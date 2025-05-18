const Booking = require('../models/booking.model');
const Route = require('../models/route.model');
const Wallet = require('../models/wallet.model');

exports.getRouteOptions = async (req, res) => {
  try {
    const { sourceId, destinationId } = req.query;
    
    // Find direct route
    const directRoute = await Route.findOne({
      source: sourceId,
      destination: destinationId,
      active: true
    }).populate('source destination');
    
    const routeOptions = {
      direct: null,
      withTransfer: []
    };
    
    if (directRoute) {
      routeOptions.direct = {
        routes: [directRoute],
        totalPoints: directRoute.pointsCost,
        estimatedDuration: directRoute.estimatedDuration
      };
    }
    
    // Find routes with one transfer
    const firstLegRoutes = await Route.find({
      source: sourceId,
      active: true
    }).populate('source destination');
    
    const potentialTransfers = [];
    
    for (const firstLeg of firstLegRoutes) {
      // Skip if first leg already reaches destination
      if (firstLeg.destination.toString() === destinationId) continue;
      
      const secondLeg = await Route.findOne({
        source: firstLeg.destination,
        destination: destinationId,
        active: true
      }).populate('source destination');
      
      if (secondLeg) {
        potentialTransfers.push({
          routes: [firstLeg, secondLeg],
          totalPoints: firstLeg.pointsCost + secondLeg.pointsCost,
          estimatedDuration: firstLeg.estimatedDuration + secondLeg.estimatedDuration + 10 // Add 10 min transfer time
        });
      }
    }
    
    // Sort by total points and duration
    potentialTransfers.sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) {
        return a.totalPoints - b.totalPoints;
      }
      return a.estimatedDuration - b.estimatedDuration;
    });
    
    // Take top 3 options
    routeOptions.withTransfer = potentialTransfers.slice(0, 3);
    
    res.status(200).json(routeOptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { sourceId, destinationId, routeIds, travelDate, isDirect } = req.body;
    
    // Calculate total points
    let totalPoints = 0;
    const routesWithOrder = [];
    
    for (let i = 0; i < routeIds.length; i++) {
      const route = await Route.findById(routeIds[i]);
      
      if (!route || !route.active) {
        return res.status(404).json({ message: `Route ${routeIds[i]} not found or inactive` });
      }
      
      totalPoints += route.pointsCost;
      routesWithOrder.push({
        route: route._id,
        order: i + 1
      });
    }
    
    // Check if user has enough points
    const wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet || wallet.points < totalPoints) {
      return res.status(400).json({ 
        message: 'Insufficient points balance', 
        required: totalPoints, 
        available: wallet ? wallet.points : 0 
      });
    }
    
    // Create booking - no need to generate ticket code here, the middleware will handle it
    const booking = new Booking({
      userId: req.userId,
      source: sourceId,
      destination: destinationId,
      routes: routesWithOrder,
      totalPoints,
      travelDate: new Date(travelDate),
      isDirect
    });
    
    await booking.save();
    
    // Deduct points from wallet
    wallet.points -= totalPoints;
    wallet.transactions.push({
      type: 'debit',
      amount: totalPoints,
      description: `Booking ID: ${booking._id}`
    });
    
    await wallet.save();
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      remainingPoints: wallet.points
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('source', 'name')
      .populate('destination', 'name')
      .populate({
        path: 'routes.route',
        populate: {
          path: 'source destination',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only allow cancellation of pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel booking with status ${booking.status}` });
    }
    
    // Only allow cancellation at least 2 hours before travel
    const travelTime = new Date(booking.travelDate).getTime();
    const currentTime = new Date().getTime();
    const hoursRemaining = (travelTime - currentTime) / (1000 * 60 * 60);
    
    if (hoursRemaining < 2) {
      return res.status(400).json({ 
        message: 'Cannot cancel booking less than 2 hours before travel time' 
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    booking.updatedAt = Date.now();
    await booking.save();
    
    // Refund points to wallet
    const wallet = await Wallet.findOne({ userId: req.userId });
    wallet.points += booking.totalPoints;
    wallet.transactions.push({
      type: 'credit',
      amount: booking.totalPoints,
      description: `Refund for cancelled booking ID: ${booking._id}`
    });
    
    await wallet.save();
    
    res.status(200).json({
      message: 'Booking cancelled and points refunded',
      booking,
      refundedPoints: booking.totalPoints,
      newBalance: wallet.points
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoint to fix bookings with null ticket codes
exports.fixNullTicketCodes = async (req, res) => {
  try {
    // Only allow admin users to run this
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Find all bookings with null ticket codes
    const bookingsWithNullTicketCode = await Booking.find({ ticketCode: null });
    
    if (bookingsWithNullTicketCode.length === 0) {
      return res.status(200).json({ message: 'No bookings with null ticket codes found' });
    }
    
    let fixedCount = 0;
    let errorCount = 0;
    
    // Fix each booking - the middleware will now handle the ticket code generation
    for (const booking of bookingsWithNullTicketCode) {
      try {
        await booking.save(); // Save will trigger the pre-save middleware
        fixedCount++;
      } catch (error) {
        errorCount++;
      }
    }
    
    res.status(200).json({
      message: 'Fixed bookings with null ticket codes',
      totalProcessed: bookingsWithNullTicketCode.length,
      fixed: fixedCount,
      errors: errorCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};