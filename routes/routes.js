const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const Route = require('../models/Route');
const Location = require('../models/Location');

// @route   GET api/routes
// @desc    Get all routes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find()
      .populate('from', 'name address coordinates')
      .populate('to', 'name address coordinates')
      .sort({ name: 1 });
    res.json(routes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/routes/:id
// @desc    Get route by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('from', 'name address coordinates')
      .populate('to', 'name address coordinates');
    
    if (!route) {
      return res.status(404).json({ msg: 'Route not found' });
    }
    
    res.json(route);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Route not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/routes/from/:locationId
// @desc    Get routes from a specific location
// @access  Public
router.get('/from/:locationId', async (req, res) => {
  try {
    const routes = await Route.find({ from: req.params.locationId })
      .populate('from', 'name address')
      .populate('to', 'name address')
      .sort({ name: 1 });
    
    res.json(routes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/routes
// @desc    Add new route
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    admin,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('from', 'Origin location is required').not().isEmpty(),
      check('to', 'Destination location is required').not().isEmpty(),
      check('distance', 'Distance is required').isNumeric(),
      check('duration', 'Duration is required').isNumeric(),
      check('price', 'Price is required').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, from, to, distance, duration, price } = req.body;

    try {
      // Verify locations exist
      const fromLocation = await Location.findById(from);
      const toLocation = await Location.findById(to);

      if (!fromLocation) {
        return res.status(404).json({ msg: 'Origin location not found' });
      }
      
      if (!toLocation) {
        return res.status(404).json({ msg: 'Destination location not found' });
      }
      
      // Check if route with same from/to already exists
      const existingRoute = await Route.findOne({ 
        from: from,
        to: to
      });
      
      if (existingRoute) {
        return res.status(400).json({ 
          msg: 'A route between these locations already exists'
        });
      }

      const newRoute = new Route({
        name,
        from,
        to,
        distance,
        duration,
        price
      });

      const route = await newRoute.save();
      
      // Populate the locations data
      const populatedRoute = await Route.findById(route._id)
        .populate('from', 'name address')
        .populate('to', 'name address');

      res.json(populatedRoute);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/routes/:id
// @desc    Update route
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, from, to, distance, duration, price } = req.body;

  // Build route object
  const routeFields = {};
  if (name) routeFields.name = name;
  if (distance) routeFields.distance = distance;
  if (duration) routeFields.duration = duration;
  if (price) routeFields.price = price;

  try {
    let route = await Route.findById(req.params.id);

    if (!route) return res.status(404).json({ msg: 'Route not found' });

    // If changing locations, validate they exist
    if (from || to) {
      let fromId = from || route.from;
      let toId = to || route.to;
      
      // Check if locations exist
      const fromLocation = await Location.findById(fromId);
      const toLocation = await Location.findById(toId);
      
      if (!fromLocation) {
        return res.status(404).json({ msg: 'Origin location not found' });
      }
      
      if (!toLocation) {
        return res.status(404).json({ msg: 'Destination location not found' });
      }
      
      // Check if this would create a duplicate route
      if (from !== route.from.toString() || to !== route.to.toString()) {
        const existingRoute = await Route.findOne({
          from: fromId,
          to: toId,
          _id: { $ne: req.params.id }
        });
        
        if (existingRoute) {
          return res.status(400).json({ 
            msg: 'A route between these locations already exists'
          });
        }
      }
      
      if (from) routeFields.from = from;
      if (to) routeFields.to = to;
    }

    route = await Route.findByIdAndUpdate(
      req.params.id,
      { $set: routeFields },
      { new: true }
    )
      .populate('from', 'name address')
      .populate('to', 'name address');

    res.json(route);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/routes/:id
// @desc    Delete route
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    let route = await Route.findById(req.params.id);

    if (!route) return res.status(404).json({ msg: 'Route not found' });

    await Route.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Route removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;