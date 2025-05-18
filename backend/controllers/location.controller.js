const Location = require('../models/location.model');

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({ active: true });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name, coordinates, description } = req.body;
    
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return res.status(400).json({ message: 'Location with this name already exists' });
    }
    
    const location = new Location({
      name,
      coordinates,
      description
    });
    
    await location.save();
    
    res.status(201).json({
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { name, coordinates, description, active } = req.body;
    
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      {
        name,
        coordinates,
        description,
        active,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(200).json({
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};