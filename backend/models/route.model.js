const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  pointsCost: {
    type: Number,
    required: true
  },
  estimatedDuration: {
    type: Number,  // in minutes
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set up a compound index with name and active status
// This allows routes with the same name but different active status
RouteSchema.index({ name: 1, active: 1 }, { unique: true });

module.exports = mongoose.model('Route', RouteSchema);