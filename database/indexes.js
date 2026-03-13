const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parking_system', {
  
});

async function createIndexes() {
  try {
    console.log('📊 Creating database indexes...');

    // Get the database connection
    const db = mongoose.connection;
    
    // Wait for connection
    await db.once('open', async () => {
      console.log('✅ Connected to MongoDB');
      
      // Users Collection Indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ isActive: 1 });
      console.log('✅ Created indexes for users collection');
      
      // Parking Slots Collection Indexes
      await db.collection('parkingslots').createIndex({ slotNumber: 1 }, { unique: true });
      await db.collection('parkingslots').createIndex({ floor: 1 });
      await db.collection('parkingslots').createIndex({ vehicleType: 1 });
      await db.collection('parkingslots').createIndex({ status: 1 });
      await db.collection('parkingslots').createIndex({ floor: 1, vehicleType: 1, status: 1 });
      console.log('✅ Created indexes for parkingslots collection');
      
      // Vehicles Collection Indexes
      await db.collection('vehicles').createIndex({ vehicleNumber: 1 }, { unique: true });
      await db.collection('vehicles').createIndex({ owner: 1 });
      await db.collection('vehicles').createIndex({ vehicleType: 1 });
      console.log('✅ Created indexes for vehicles collection');
      
      // Parkings Collection Indexes
      await db.collection('parkings').createIndex({ vehicleNumber: 1, status: 1 });
      await db.collection('parkings').createIndex({ owner: 1, entryTime: -1 });
      await db.collection('parkings').createIndex({ status: 1, entryTime: -1 });
      await db.collection('parkings').createIndex({ slot: 1, entryTime: -1 });
      await db.collection('parkings').createIndex({ entryTime: -1 });
      await db.collection('parkings').createIndex({ exitTime: -1 });
      await db.collection('parkings').createIndex({ 
        status: 1, 
        paymentStatus: 1, 
        exitTime: -1 
      });
      console.log('✅ Created indexes for parkings collection');
      
      // Payments Collection Indexes
      await db.collection('payments').createIndex({ transactionId: 1 }, { unique: true, sparse: true });
      await db.collection('payments').createIndex({ receiptNumber: 1 }, { unique: true, sparse: true });
      await db.collection('payments').createIndex({ user: 1, createdAt: -1 });
      await db.collection('payments').createIndex({ parking: 1 });
      await db.collection('payments').createIndex({ status: 1 });
      await db.collection('payments').createIndex({ method: 1 });
      await db.collection('payments').createIndex({ createdAt: -1 });
      console.log('✅ Created indexes for payments collection');
      
      // Reports Collection Indexes
      await db.collection('reports').createIndex({ type: 1 });
      await db.collection('reports').createIndex({ 'period.startDate': -1 });
      await db.collection('reports').createIndex({ generatedBy: 1 });
      await db.collection('reports').createIndex({ generatedAt: -1 });
      console.log('✅ Created indexes for reports collection');
      
      // Compound Indexes for Better Query Performance
      
      // For quick search of available slots by vehicle type and floor
      await db.collection('parkingslots').createIndex(
        { vehicleType: 1, floor: 1, status: 1 },
        { name: 'available_slots_search' }
      );
      
      // For dashboard queries - active parkings
      await db.collection('parkings').createIndex(
        { status: 1, entryTime: -1, owner: 1 },
        { name: 'dashboard_active_parkings' }
      );
      
      // For payment history with filters
      await db.collection('payments').createIndex(
        { user: 1, status: 1, createdAt: -1 },
        { name: 'user_payment_history' }
      );
      
      // For report generation - date range queries
      await db.collection('parkings').createIndex(
        { entryTime: 1, status: 1 },
        { name: 'report_date_range' }
      );
      
      // For slot utilization analysis
      await db.collection('parkings').createIndex(
        { slot: 1, entryTime: 1, exitTime: 1 },
        { name: 'slot_utilization_analysis' }
      );
      
      console.log('\n🎉 All indexes created successfully!');
      console.log('\n📊 Index Summary:');
      console.log('1. Users: 4 indexes');
      console.log('2. ParkingSlots: 5 indexes + 1 compound');
      console.log('3. Vehicles: 3 indexes');
      console.log('4. Parkings: 7 indexes + 3 compound');
      console.log('5. Payments: 7 indexes + 1 compound');
      console.log('6. Reports: 4 indexes');
      
      // Verify indexes
      console.log('\n🔍 Verifying indexes...');
      const collections = ['users', 'parkingslots', 'vehicles', 'parkings', 'payments', 'reports'];
      
      for (const collection of collections) {
        const indexes = await db.collection(collection).indexes();
        console.log(`${collection}: ${indexes.length} indexes`);
      }
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

// Handle errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Run the index creation
createIndexes();