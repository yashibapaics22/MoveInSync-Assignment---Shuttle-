const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  experience: {
    type: Number, // in years
    default: 0
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vehicle'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'location'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('driver', DriverSchema);