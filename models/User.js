const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'driver'],
    default: 'user'
  },
  points: {
    type: Number,
    default: 100 // Start with 100 points
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual property to check if user is admin
UserSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Virtual property to check if user is driver
UserSchema.virtual('isDriver').get(function() {
  return this.role === 'driver';
});

// Make virtuals available when converting to JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('user', UserSchema);