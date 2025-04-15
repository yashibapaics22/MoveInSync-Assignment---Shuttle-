const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const driverAuth = require('../middleware/driver');

const Driver = require('../models/Driver');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// @route   GET api/drivers
// @desc    Get all drivers (admin only)
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('user', ['name', 'email', 'phone'])
      .populate('vehicle')
      .populate('currentLocation');
    
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/drivers/available
// @desc    Get all available drivers
// @access  Private/Admin
router.get('/available', [auth, admin], async (req, res) => {
  try {
    const drivers = await Driver.find({ isAvailable: true })
      .populate('user', ['name', 'email', 'phone'])
      .populate('vehicle')
      .populate('currentLocation');
    
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/drivers/me
// @desc    Get current driver profile
// @access  Private/Driver
router.get('/me', [auth, driverAuth], async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id })
      .populate('user', ['name', 'email', 'phone'])
      .populate('vehicle')
      .populate('currentLocation');
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver profile not found' });
    }
    
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/drivers
// @desc    Create or update driver profile
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    admin,
    [
      check('userId', 'User ID is required').not().isEmpty(),
      check('licenseNumber', 'License number is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, licenseNumber, experience, vehicleId, currentLocationId } = req.body;

    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if vehicle exists if provided
      if (vehicleId) {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
          return res.status(404).json({ msg: 'Vehicle not found' });
        }
      }

      // Update user role to driver
      if (user.role !== 'driver') {
        user.role = 'driver';
        await user.save();
      }

      // Check if driver profile already exists
      let driver = await Driver.findOne({ user: userId });

      if (driver) {
        // Update driver profile
        const driverFields = {
          licenseNumber: licenseNumber || driver.licenseNumber,
          experience: experience !== undefined ? experience : driver.experience,
          vehicle: vehicleId || driver.vehicle,
          currentLocation: currentLocationId || driver.currentLocation
        };

        driver = await Driver.findOneAndUpdate(
          { user: userId },
          { $set: driverFields },
          { new: true }
        )
          .populate('user', ['name', 'email', 'phone'])
          .populate('vehicle')
          .populate('currentLocation');

        return res.json(driver);
      }

      // Create new driver profile
      driver = new Driver({
        user: userId,
        licenseNumber,
        experience: experience || 0,
        vehicle: vehicleId,
        currentLocation: currentLocationId
      });

      await driver.save();

      driver = await Driver.findOne({ user: userId })
        .populate('user', ['name', 'email', 'phone'])
        .populate('vehicle')
        .populate('currentLocation');

      res.json(driver);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/drivers/availability
// @desc    Update driver availability
// @access  Private/Driver
router.put(
  '/availability',
  [auth, driverAuth],
  async (req, res) => {
    const { isAvailable, currentLocationId } = req.body;

    try {
      const driver = await Driver.findOne({ user: req.user.id });

      if (!driver) {
        return res.status(404).json({ msg: 'Driver profile not found' });
      }

      const updateFields = {};
      
      if (isAvailable !== undefined) {
        updateFields.isAvailable = isAvailable;
      }
      
      if (currentLocationId) {
        updateFields.currentLocation = currentLocationId;
      }

      const updatedDriver = await Driver.findOneAndUpdate(
        { user: req.user.id },
        { $set: updateFields },
        { new: true }
      )
        .populate('user', ['name', 'email', 'phone'])
        .populate('vehicle')
        .populate('currentLocation');

      res.json(updatedDriver);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/drivers/bookings
// @desc    Get driver's current and upcoming bookings
// @access  Private/Driver
router.get('/bookings', [auth, driverAuth], async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver profile not found' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      driver: driver._id,
      date: { $gte: today },
      status: { $in: ['approved', 'in-progress'] }
    })
      .populate('user', ['name', 'phone'])
      .populate({
        path: 'route',
        populate: {
          path: 'from to',
          select: 'name address coordinates'
        }
      })
      .sort({ date: 1, time: 1 });
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/drivers/bookings/:id
// @desc    Update booking status (driver)
// @access  Private/Driver
router.put('/bookings/:id', [auth, driverAuth], async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status. Allowed values: in-progress, completed' });
  }

  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver profile not found' });
    }
    
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    
    if (!booking.driver || booking.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this booking' });
    }
    
    // If completing the ride
    if (status === 'completed' && booking.status !== 'completed') {
      // Update payment status if using points
      if (booking.paymentMethod === 'points') {
        booking.paymentStatus = 'completed';
      }
    }
    
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        paymentStatus: booking.paymentStatus
      },
      { new: true }
    )
      .populate('user', ['name', 'phone'])
      .populate({
        path: 'route',
        populate: {
          path: 'from to',
          select: 'name address coordinates'
        }
      });
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;