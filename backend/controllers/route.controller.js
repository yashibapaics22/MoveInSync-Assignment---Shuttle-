const Route = require('../models/route.model');
const Location = require('../models/location.model');

exports.getAllRoutes = async (req, res) => {
  try {
    // Return all routes, not just active ones
    const routes = await Route.find()
      .populate('source', 'name coordinates active')
      .populate('destination', 'name coordinates active');
    
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const { 
      name, 
      source, sourceId, 
      destination, destinationId, 
      distance, 
      pointsCost, 
      estimatedDuration 
    } = req.body;
    
    // Support both naming conventions: sourceId/destinationId and source/destination
    const sourceLocationId = sourceId || source;
    const destinationLocationId = destinationId || destination;
    
    console.log('Creating route with source:', sourceLocationId, 'destination:', destinationLocationId);
    
    // Verify locations exist
    const sourceLocation = await Location.findById(sourceLocationId);
    if (!sourceLocation) {
      return res.status(404).json({ message: 'Source location not found' });
    }
    
    const destinationLocation = await Location.findById(destinationLocationId);
    if (!destinationLocation) {
      return res.status(404).json({ message: 'Destination location not found' });
    }
    
    // Check if location is active
    if (!sourceLocation.active) {
      return res.status(400).json({ message: 'Source location is not active' });
    }
    
    if (!destinationLocation.active) {
      return res.status(400).json({ message: 'Destination location is not active' });
    }
    
    // Create route
    const route = new Route({
      name,
      source: sourceLocationId,
      destination: destinationLocationId,
      distance,
      pointsCost,
      estimatedDuration
    });
    
    await route.save();
    
    res.status(201).json({
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { 
      name, 
      sourceId, source, 
      destinationId, destination, 
      distance, 
      pointsCost, 
      estimatedDuration, 
      active 
    } = req.body;
    
    // Support both naming conventions
    const sourceLocationId = sourceId || source;
    const destinationLocationId = destinationId || destination;
    
    // Create update object
    const updateData = {
      updatedAt: Date.now()
    };
    
    // Only add fields that are present in the request
    if (name) updateData.name = name;
    if (distance) updateData.distance = distance;
    if (pointsCost) updateData.pointsCost = pointsCost;
    if (estimatedDuration) updateData.estimatedDuration = estimatedDuration;
    if (active !== undefined) updateData.active = active;
    if (sourceLocationId) updateData.source = sourceLocationId;
    if (destinationLocationId) updateData.destination = destinationLocationId;
    
    console.log('Updating route with data:', updateData);
    
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.status(200).json({
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ message: error.message });
  }
};