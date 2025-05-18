const mongoose = require('mongoose');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shuttle-management')
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Get the routes collection
      const db = mongoose.connection.db;
      const routesCollection = db.collection('routes');
      
      console.log('Checking existing indexes...');
      const indexes = await routesCollection.indexes();
      console.log('Current indexes:', indexes);
      
      // Drop the existing name index if it exists
      console.log('Dropping name_1 index if it exists...');
      try {
        await routesCollection.dropIndex('name_1');
        console.log('Successfully dropped name_1 index');
      } catch (error) {
        console.log('No name_1 index to drop or error dropping index:', error.message);
      }
      
      // Create the new compound index
      console.log('Creating new compound index on name and active...');
      await routesCollection.createIndex({ name: 1, active: 1 }, { unique: true });
      console.log('Successfully created compound index');
      
      // Verify new indexes
      const updatedIndexes = await routesCollection.indexes();
      console.log('Updated indexes:', updatedIndexes);
      
      console.log('Index migration completed successfully');
    } catch (error) {
      console.error('Error during migration:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 