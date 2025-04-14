const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const Booking = require('../models/Booking');
const Route = require('../models/Route');
const User = require('../models/User');

// @route   GET api/bookings
// @desc    Get all bookings for admin or user's bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let bookings;
    if (user.isAdmin) {
      // If admin, get all bookings
      bookings = await Booking.find()
        .populate('user', 'name email')
        .populate({
          path: 'route',
          populate: {
            path: 'from to',
            select: 'name'
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
            select: 'name'
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
      check('passengers', 'Number of passengers is required').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { route: routeId, date, time, passengers } = req.body;

    try {
      const route = await Route.findById(routeId);
      
      if (!route) {
        return res.status(404).json({ msg: 'Route not found' });
      }
      
      // Calculate total price based on number of passengers
      const totalPrice = route.price * passengers;
      
      const newBooking = new Booking({
        user: req.user.id,
        route: routeId,
        date,
        time,
        passengers,
        totalPrice
      });

      const booking = await newBooking.save();

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
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ msg: 'Status is required' });
  }

  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('user', 'name email')
      .populate({
        path: 'route',
        populate: {
          path: 'from to',
          select: 'name'
        }
      });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

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
    
    if (booking.user.toString() !== req.user.id && !user.isAdmin) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Booking.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Booking removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 