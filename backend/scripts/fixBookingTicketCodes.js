const mongoose = require('mongoose');
const Booking = require('../models/booking.model');

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

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shuttle-management')
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Get the bookings collection
      const db = mongoose.connection.db;
      const bookingsCollection = db.collection('bookings');
      
      console.log('Checking existing indexes...');
      const indexes = await bookingsCollection.indexes();
      console.log('Current indexes:', indexes);
      
      // Drop the existing ticketCode index if it exists
      console.log('Dropping ticketCode_1 index if it exists...');
      try {
        await bookingsCollection.dropIndex('ticketCode_1');
        console.log('Successfully dropped ticketCode_1 index');
      } catch (error) {
        console.log('No ticketCode_1 index to drop or error dropping index:', error.message);
      }
      
      // Create the new index with sparse option
      console.log('Creating new sparse index on ticketCode...');
      await bookingsCollection.createIndex({ ticketCode: 1 }, { unique: true, sparse: true });
      console.log('Successfully created sparse index');
      
      // Fix bookings with null ticket codes
      console.log('Finding bookings with null ticket codes...');
      const bookingsWithNullTicketCode = await Booking.find({ ticketCode: null });
      
      if (bookingsWithNullTicketCode.length === 0) {
        console.log('No bookings with null ticket codes found');
      } else {
        console.log(`Found ${bookingsWithNullTicketCode.length} bookings with null ticket codes`);
        
        let fixedCount = 0;
        let errorCount = 0;
        
        // Fix each booking
        for (const booking of bookingsWithNullTicketCode) {
          try {
            // Generate a unique ticket code
            let isUnique = false;
            let ticketCode;
            let attempts = 0;
            const maxAttempts = 5;
            
            while (!isUnique && attempts < maxAttempts) {
              ticketCode = generateTicketCode();
              const existingBooking = await Booking.findOne({ ticketCode });
              if (!existingBooking) {
                isUnique = true;
              }
              attempts++;
            }
            
            if (!isUnique) {
              throw new Error('Failed to generate a unique ticket code after multiple attempts');
            }
            
            // Update the booking
            booking.ticketCode = ticketCode;
            await booking.save();
            fixedCount++;
            console.log(`Fixed booking ID: ${booking._id}, set ticket code to ${ticketCode}`);
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
      }
      
      // Verify new indexes
      const updatedIndexes = await bookingsCollection.indexes();
      console.log('Updated indexes:', updatedIndexes);
      
      console.log('Index migration and ticket code fix completed successfully');
    } catch (error) {
      console.error('Error during fix process:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 