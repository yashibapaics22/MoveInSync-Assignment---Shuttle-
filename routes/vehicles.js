const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const Vehicle = require('../models/Vehicle');

// @route   GET api/vehicles
// @desc    Get all vehicles
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/vehicles/active
// @desc    Get all active vehicles
// @access  Private/Admin
router.get('/active', [auth, admin], async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isActive: true }).sort({ type: 1 });
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/vehicles
// @desc    Add new vehicle
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    admin,
    [
      check('registrationNumber', 'Registration number is required').not().isEmpty(),
      check('model', 'Model is required').not().isEmpty(),
      check('capacity', 'Capacity must be a number').isNumeric(),
      check('type', 'Type is required').isIn(['sedan', 'suv', 'mini-bus', 'bus'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { registrationNumber, model, capacity, type } = req.body;

    try {
      // Check if vehicle already exists
      let vehicle = await Vehicle.findOne({ registrationNumber });
      if (vehicle) {
        return res.status(400).json({ msg: 'Vehicle with this registration already exists' });
      }

      vehicle = new Vehicle({
        registrationNumber,
        model,
        capacity,
        type
      });

      await vehicle.save();
      res.json(vehicle);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/vehicles/:id
// @desc    Update vehicle
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { registrationNumber, model, capacity, type, isActive } = req.body;

  // Build vehicle object
  const vehicleFields = {};
  if (registrationNumber) vehicleFields.registrationNumber = registrationNumber;
  if (model) vehicleFields.model = model;
  if (capacity) vehicleFields.capacity = capacity;
  if (type) vehicleFields.type = type;
  if (isActive !== undefined) vehicleFields.isActive = isActive;

  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    // If updating registration number, check if it would create a duplicate
    if (registrationNumber && registrationNumber !== vehicle.registrationNumber) {
      const existingVehicle = await Vehicle.findOne({ registrationNumber });
      if (existingVehicle) {
        return res.status(400).json({ msg: 'Vehicle with this registration already exists' });
      }
    }

    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: vehicleFields },
      { new: true }
    );

    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/vehicles/:id
// @desc    Delete vehicle
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    await Vehicle.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Vehicle removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;