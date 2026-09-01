const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
let mongoConnection;

// Setup: Connect to in-memory MongoDB (using mongoose test database)
async function setupTestDB() {
  // Use a simple test database connection string
  // In production, this would be replaced with MongoDB Memory Server or a test MongoDB instance
  const testDbUri = process.env.TEST_MONGO_URL || 'mongodb://127.0.0.1:27017/test_careconnect';
  
  try {
    mongoConnection = await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    console.error('[Test Setup] MongoDB connection failed:', err.message);
    throw err;
  }
}

// Teardown: Close MongoDB connection
async function teardownTestDB() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

// Clear a collection between tests
async function clearCollection(collectionName) {
  try {
    if (mongoose.connection.readyState === 1) {
      const collection = mongoose.connection.collection(collectionName);
      if (collection) {
        await collection.deleteMany({});
      }
    }
  } catch (err) {
    console.error(`[Test Setup] Failed to clear ${collectionName}:`, err.message);
  }
}

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearCollection,
};
