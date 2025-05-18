const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Wallet = require('../models/wallet.model');
const Route = require('../models/route.model');
const Location = require('../models/location.model');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const activeRoutes = await Route.countDocuments({ active: true });
    const totalLocations = await Location.countDocuments();
    
    // Bookings in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBookings = await Booking.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Current month bookings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const currentMonthBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Booking status breakdown
    const pending = await Booking.countDocuments({ status: 'pending' });
    const confirmed = await Booking.countDocuments({ status: 'confirmed' });
    const completed = await Booking.countDocuments({ status: 'completed' });
    const cancelled = await Booking.countDocuments({ status: 'cancelled' });
    
    res.status(200).json({
      users: {
        total: totalUsers
      },
      routes: {
        active: activeRoutes,
        total: await Route.countDocuments()
      },
      locations: {
        total: totalLocations
      },
      bookings: {
        recent: recentBookings,
        currentMonth: currentMonthBookings,
        statusBreakdown: {
          pending,
          confirmed,
          completed,
          cancelled
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);
    
    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .populate('source', 'name')
      .populate('destination', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      res.status(200).json({
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings,
          limit
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.updateBookingStatus = async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { 
          status,
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // If cancelled, refund points
      if (status === 'cancelled') {
        const wallet = await Wallet.findOne({ userId: booking.userId });
        
        if (wallet) {
          wallet.points += booking.totalPoints;
          wallet.transactions.push({
            type: 'credit',
            amount: booking.totalPoints,
            description: `Refund for admin-cancelled booking ID: ${booking._id}`
          });
          
          await wallet.save();
        }
      }
      
      res.status(200).json({
        message: 'Booking status updated successfully',
        booking
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.getUserList = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      const query = {};
      
      // Search by name or email
      if (req.query.search) {
        query.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ];
      }
      
      // Filter by role
      if (req.query.role) {
        query.role = req.query.role;
      }
      
      const totalUsers = await User.countDocuments(query);
      const totalPages = Math.ceil(totalUsers / limit);
      
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get wallet balances
      const userIds = users.map(user => user._id);
      const wallets = await Wallet.find({ userId: { $in: userIds } });
      
      const usersWithBalance = users.map(user => {
        const wallet = wallets.find(w => w.userId.toString() === user._id.toString());
        return {
          ...user.toObject(),
          points: wallet ? wallet.points : 0
        };
      });
      
      res.status(200).json({
        users: usersWithBalance,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.addPointsToUser = async (req, res) => {
    try {
      const { points, reason } = req.body;
      
      if (!points || points <= 0) {
        return res.status(400).json({ message: 'Points must be a positive number' });
      }
      
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      let wallet = await Wallet.findOne({ userId: user._id });
      
      if (!wallet) {
        wallet = new Wallet({ userId: user._id, points: 0 });
      }
      
      wallet.points += parseFloat(points);
      wallet.transactions.push({
        type: 'credit',
        amount: parseFloat(points),
        description: reason || 'Admin added points'
      });
      
      await wallet.save();
      
      res.status(200).json({
        message: 'Points added successfully',
        userId: user._id,
        userName: user.name,
        pointsAdded: points,
        newBalance: wallet.points
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.getMostUsedRoutes = async (req, res) => {
    try {
      // Get date range (default: last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (parseInt(req.query.days) || 30));
      
      // Aggregate bookings to get route usage
      const routeUsage = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['confirmed', 'completed'] }
          }
        },
        { $unwind: '$routes' },
        {
          $group: {
            _id: '$routes.route',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      // Get route details
      const routeIds = routeUsage.map(item => item._id);
      const routes = await Route.find({ _id: { $in: routeIds } })
        .populate('source', 'name')
        .populate('destination', 'name');
      
      // Combine data
      const result = routeUsage.map(item => {
        const route = routes.find(r => r._id.toString() === item._id.toString());
        return {
          route: route ? {
            id: route._id,
            name: route.name,
            source: route.source.name,
            destination: route.destination.name
          } : { id: item._id, name: 'Unknown Route' },
          count: item.count
        };
      });
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      phoneNumber
    });
    
    await user.save();
    
    // Create wallet for the user if they are a student
    if (role === 'student' || !role) {
      const wallet = new Wallet({
        userId: user._id,
        points: 100 // Give 100 points to new students
      });
      
      await wallet.save();
    }
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    console.log('updateUser function called');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    const { name, email, password, phoneNumber } = req.body;
    const userId = req.params.userId;
    
    if (!userId) {
      console.error('No userId provided in params');
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Validate MongoDB ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    console.log('Updating user:', userId);
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Found user:', user.email);
    
    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        console.log('Email already in use:', email);
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      // Password will be hashed by the pre-save middleware
      user.password = password;
    }
    
    user.updatedAt = Date.now();
    
    console.log('Saving updated user...');
    const savedUser = await user.save();
    console.log('User updated successfully:', savedUser.email);
    
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Error updating user',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};