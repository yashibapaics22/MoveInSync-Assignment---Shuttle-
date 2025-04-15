const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  model: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 4
  },
  type: {
    type: String,
    enum: ['sedan', 'suv', 'mini-bus', 'bus'],
    default: 'sedan'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('vehicle', VehicleSchema);