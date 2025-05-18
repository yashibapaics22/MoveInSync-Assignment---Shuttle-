const mongoose = require('mongoose');

// Generate a unique ticket code
const generateTicketCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 8;
  let ticketCode = '';
  
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    ticketCode += characters[randomIndex];
  }
  
  return ticketCode;
};

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketCode: {
    type: String,
    unique: true,
    sparse: true // Allow null values to prevent validation errors on existing docs
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
  routes: [{
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    order: {
      type: Number,
      required: true
    }
  }],
  totalPoints: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  travelDate: {
    type: Date,
    required: true
  },
  isDirect: {
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

// Middleware to generate ticket code before saving if it doesn't exist
BookingSchema.pre('save', async function(next) {
  try {
    // Only generate ticket code if it's not set or is null
    if (!this.ticketCode) {
      let isUnique = false;
      let ticketCode;
      let attempts = 0;
      const maxAttempts = 5;
      
      // Try to generate a unique code
      while (!isUnique && attempts < maxAttempts) {
        ticketCode = generateTicketCode();
        // Check if code already exists
        const existingBooking = await mongoose.model('Booking').findOne({ ticketCode });
        if (!existingBooking) {
          isUnique = true;
          this.ticketCode = ticketCode;
        }
        attempts++;
      }
      
      if (!isUnique) {
        return next(new Error('Failed to generate a unique ticket code after multiple attempts'));
      }
      
      // Double-check that ticketCode is set
      if (!this.ticketCode) {
        return next(new Error('Failed to set ticket code'));
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Booking', BookingSchema);