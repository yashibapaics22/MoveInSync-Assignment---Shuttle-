const mongoose = require('mongoose');
const Booking = require('../models/booking.model');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shuttle-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Find all bookings with null ticket codes
      const bookingsWithNullTicketCode = await Booking.find({ ticketCode: null });
      
      if (bookingsWithNullTicketCode.length === 0) {
        console.log('No bookings with null ticket codes found');
        process.exit(0);
      }
      
      console.log(`Found ${bookingsWithNullTicketCode.length} bookings with null ticket codes`);
      
      let fixedCount = 0;
      let errorCount = 0;
      
      // Fix each booking
      for (const booking of bookingsWithNullTicketCode) {
        try {
          // Save will trigger the pre-save middleware to generate a ticket code
          await booking.save();
          fixedCount++;
          console.log(`Fixed booking ID: ${booking._id}`);
        } catch (error) {
          errorCount++;
          console.error(`Error fixing booking ID: ${booking._id}`, error.message);
        }
      }
      
      console.log(`
      Fix completed:
      - Total processed: ${bookingsWithNullTicketCode.length}
      - Fixed: ${fixedCount}
      - Errors: ${errorCount}
      `);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 