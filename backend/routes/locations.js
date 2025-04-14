const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const Location = require('../models/Location');

// @route   GET api/locations
// @desc    Get all locations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/locations
// @desc    Add new location
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    admin,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('address', 'Address is required').not().isEmpty(),
      check('coordinates', 'Coordinates are required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, coordinates } = req.body;

    try {
      const newLocation = new Location({
        name,
        address,
        coordinates
      });

      const location = await newLocation.save();

      res.json(location);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/locations/:id
// @desc    Update location
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, address, coordinates } = req.body;

  // Build location object
  const locationFields = {};
  if (name) locationFields.name = name;
  if (address) locationFields.address = address;
  if (coordinates) locationFields.coordinates = coordinates;

  try {
    let location = await Location.findById(req.params.id);

    if (!location) return res.status(404).json({ msg: 'Location not found' });

    location = await Location.findByIdAndUpdate(
      req.params.id,
      { $set: locationFields },
      { new: true }
    );

    res.json(location);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/locations/:id
// @desc    Delete location
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    let location = await Location.findById(req.params.id);

    if (!location) return res.status(404).json({ msg: 'Location not found' });

    await Location.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Location removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 