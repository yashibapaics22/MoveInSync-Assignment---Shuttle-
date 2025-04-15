const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const Booking = require('../models/Booking');
const Route = require('../models/Route');
const User = require('../models/User');
const Driver = require('../models/Driver');

// @route   GET api/bookings
// @desc    Get all bookings for admin or user's bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let bookings;
    if (user.role === 'admin') {
      // If admin, get all bookings
      bookings = await Booking.find()
        .populate('user', 'name email phone')
        .populate({
          path: 'route',
          populate: {
            path: 'from to',
            select: 'name address'
          }
        })
        .populate({
          path: 'driver',
          populate: {
            path: 'user vehicle',
            select: 'name email phone model registrationNumber'
          }
        })
        .sort({ date: -1 });
    } else {
      // If regular user, get only their bookings
      bookings = await Booking.find({ user: req.user.id })
        .populate({
          path: 'route',
          populate: {
            path: 'from to',
            select: 'name address'
          }
        })
        .populate({
          path: 'driver',
          populate: {
            path: 'user vehicle',
            select: 'name email phone model registrationNumber'
          }
        })
        .sort({ date: -1 });
    }
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/bookings
// @desc    Create a booking
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('route', 'Route is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('time', 'Time is required').not().isEmpty(),
      check('passengers', 'Number of passengers is required').isNumeric(),
      check('paymentMethod', 'Payment method is required').isIn(['points', 'cash', 'card'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { route: routeId, date, time, passengers, paymentMethod } = req.body;

    try {
      // Get user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Get route
      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({ msg: 'Route not found' });
      }
      
      // Calculate total price based on number of passengers
      const totalPrice = route.price * passengers;
      
      // Check if user has enough points if paying with points
      let pointsUsed = 0;
      if (paymentMethod === 'points') {
        // 1 point = 1 currency unit
        pointsUsed = totalPrice;
        
        if (user.points < pointsUsed) {
          return res.status(400).json({ 
            msg: `Not enough points. Required: ${pointsUsed}, Available: ${user.points}` 
          });
        }
      }
      
      const newBooking = new Booking({
        user: req.user.id,
        route: routeId,
        date,
        time,
        passengers,
        totalPrice,
        paymentMethod,
        pointsUsed,
        paymentStatus: paymentMethod === 'points' ? 'pending' : 'pending'
      });

      const booking = await newBooking.save();

      // If using points, deduct points but don't mark payment as completed yet
      // Points will be deducted when the booking is approved or when the ride is completed
      if (paymentMethod === 'points') {
        // We'll deduct points when the booking is approved
      }

      // Populate the booking with route and user details
      const populatedBooking = await Booking.findById(booking._id)
        .populate('user', 'name email')
        .populate({
          path: 'route',
          populate: {
            path: 'from to',
            select: 'name'
          }
        });

      res.json(populatedBooking);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/bookings/:id
// @desc    Update booking status (admin only)
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { status, driverId } = req.body;

  if (!status) {
    return res.status(400).json({ msg: 'Status is required' });
  }

  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // If approving booking
    if (status === 'approved' && booking.status !== 'approved') {
      // Assign driver if provided
      if (driverId) {
        const driver = await Driver.findById(driverId);
        if (!driver) {
          return res.status(404).json({ msg: 'Driver not found' });
        }
        
        // Check if driver is available
        if (!driver.isAvailable) {
          return res.status(400).json({ msg: 'Driver is not available' });
        }
        
        booking.driver = driverId;
        
        // Also assign the driver's vehicle
        if (driver.vehicle) {
          booking.vehicle = driver.vehicle;
        }
      }
      
      // If payment method is points, deduct points now
      if (booking.paymentMethod === 'points') {
        const user = await User.findById(booking.user);
        
        if (user.points < booking.pointsUsed) {
          return res.status(400).json({ 
            msg: `User doesn't have enough points. Required: ${booking.pointsUsed}, Available: ${user.points}` 
          });
        }
        
        // Deduct points
        user.points -= booking.pointsUsed;
        await user.save();
      }
    }
    
    // If rejecting a previously approved booking, refund points
    if (status === 'rejected' && booking.status === 'approved' && booking.paymentMethod === 'points' && booking.pointsUsed > 0) {
      const user = await User.findById(booking.user);
      // Refund points
      user.points += booking.pointsUsed;
      await user.save();
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        driver: booking.driver,
        vehicle: booking.vehicle
      },
      { new: true }
    )
      .populate('user', 'name email')
      .populate({
        path: 'route',
        populate: {
          path: 'from to',
          select: 'name'
        }
      })
      .populate({
        path: 'driver',
        populate: {
          path: 'user vehicle',
          select: 'name email phone model registrationNumber'
        }
      });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/bookings/:id/feedback
// @desc    Add feedback and rating for a completed booking
// @access  Private
router.put(
  '/:id/feedback',
  [
    auth,
    [
      check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    try {
      let booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ msg: 'Booking not found' });
      }

      // Check if user owns the booking
      if (booking.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      // Check if booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({ msg: 'Cannot add feedback until booking is completed' });
      }

      booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { 
          driverRating: rating,
          feedbackComment: comment || ''
        },
        { new: true }
      );

      // If there's a driver, update their rating
      if (booking.driver) {
        const driver = await Driver.findById(booking.driver);
        
        if (driver) {
          // Get all ratings for this driver
          const driverBookings = await Booking.find({ 
            driver: driver._id,
            driverRating: { $exists: true, $ne: null }
          });
          
          // Calculate new average rating
          let totalRating = 0;
          driverBookings.forEach(b => {
            totalRating += b.driverRating;
          });
          
          const newRating = driverBookings.length > 0 ? 
            (totalRating / driverBookings.length).toFixed(1) : 
            5;
          
          // Update driver rating
          await Driver.findByIdAndUpdate(driver._id, { rating: newRating });
        }
      }

      res.json(booking);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put(
  '/:id/cancel',
  auth,
  async (req, res) => {
    try {
      let booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ msg: 'Booking not found' });
      }

      // Check if user owns the booking or is admin
      const user = await User.findById(req.user.id);
      
      if (booking.user.toString() !== req.user.id && user.role !== 'admin') {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      // Check if booking can be cancelled
      if (['completed', 'in-progress', 'cancelled'].includes(booking.status)) {
        return res.status(400).json({ 
          msg: `Booking cannot be cancelled because it is ${booking.status}` 
        });
      }

      // If payment method is points and booking was approved, refund points
      if (booking.paymentMethod === 'points' && booking.status === 'approved' && booking.pointsUsed > 0) {
        const bookingUser = await User.findById(booking.user);
        // Refund points
        bookingUser.points += booking.pointsUsed;
        await bookingUser.save();
      }

      booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { status: 'cancelled' },
        { new: true }
      );

      res.json(booking);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/bookings/:id
// @desc    Delete booking (user can delete their own, admin can delete any)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    const user = await User.findById(req.user.id);
    
    if (booking.user.toString() !== req.user.id && user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // If deleting an approved booking with points payment, refund points
    if (booking.status === 'approved' && booking.paymentMethod === 'points' && booking.pointsUsed > 0) {
      const bookingUser = await User.findById(booking.user);
      // Refund points
      bookingUser.points += booking.pointsUsed;
      await bookingUser.save();
    }

    await Booking.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Booking removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;