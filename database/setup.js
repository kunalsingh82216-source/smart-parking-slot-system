const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parking_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database cleared');
    
    // Create users with hashed passwords
    console.log('👥 Creating users...');
    const salt = await bcrypt.genSalt(10);
    
    // User Schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      phone: String,
      password: String,
      role: String,
      vehicleNumber: String,
      walletBalance: Number,
      isActive: Boolean,
      createdAt: Date
    });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@parking.com',
        phone: '9876543210',
        password: await bcrypt.hash('admin123', salt),
        role: 'admin',
        isActive: true,
        walletBalance: 0,
        createdAt: new Date()
      },
      {
        name: 'Manager User',
        email: 'manager@parking.com',
        phone: '9876543211',
        password: await bcrypt.hash('manager123', salt),
        role: 'manager',
        isActive: true,
        walletBalance: 0,
        createdAt: new Date()
      },
      {
        name: 'Customer User',
        email: 'customer@parking.com',
        phone: '9876543212',
        password: await bcrypt.hash('customer123', salt),
        role: 'customer',
        vehicleNumber: 'MH12AB1234',
        isActive: true,
        walletBalance: 1000,
        createdAt: new Date()
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543213',
        password: await bcrypt.hash('john123', salt),
        role: 'customer',
        vehicleNumber: 'MH01AB1234',
        isActive: true,
        walletBalance: 500,
        createdAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543214',
        password: await bcrypt.hash('jane123', salt),
        role: 'customer',
        vehicleNumber: 'DL2CAB5678',
        isActive: true,
        walletBalance: 750,
        createdAt: new Date()
      }
    ]);
    
    console.log('✅ Created ' + users.length + ' users');
    
    // Create parking slots
    console.log('🅿️  Creating parking slots...');
    
    const parkingSlotSchema = new mongoose.Schema({
      slotNumber: String,
      floor: Number,
      vehicleType: String,
      status: String,
      hourlyRate: Number,
      isReserved: Boolean,
      createdAt: Date
    });
    
    const ParkingSlot = mongoose.models.ParkingSlot || mongoose.model('ParkingSlot', parkingSlotSchema);
    
    const slots = [];
    
    // Car slots (50 slots)
    for (let floor = 1; floor <= 5; floor++) {
      for (let i = 1; i <= 10; i++) {
        slots.push({
          slotNumber: `C${floor}${i.toString().padStart(2, '0')}`,
          floor: floor,
          vehicleType: 'car',
          hourlyRate: 50,
          status: 'available',
          isReserved: false,
          createdAt: new Date()
        });
      }
    }
    
    // Bike slots (30 slots)
    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 1; i <= 10; i++) {
        slots.push({
          slotNumber: `B${floor}${i.toString().padStart(2, '0')}`,
          floor: floor,
          vehicleType: 'bike',
          hourlyRate: 20,
          status: 'available',
          isReserved: false,
          createdAt: new Date()
        });
      }
    }
    
    // Truck slots (10 slots)
    for (let i = 1; i <= 10; i++) {
      slots.push({
        slotNumber: `T1${i.toString().padStart(2, '0')}`,
        floor: 1,
        vehicleType: 'truck',
        hourlyRate: 100,
        status: 'available',
        isReserved: false,
        createdAt: new Date()
      });
    }
    
    // Mark some slots as occupied
    slots[0].status = 'occupied'; // C101
    slots[1].status = 'occupied'; // C102
    slots[50].status = 'occupied'; // B101
    slots[51].status = 'maintenance'; // B102
    slots[90].status = 'occupied'; // T101
    
    await ParkingSlot.insertMany(slots);
    console.log('✅ Created ' + slots.length + ' parking slots');
    
    // Create some vehicles
    console.log(' Creating vehicles...');
    
    const vehicleSchema = new mongoose.Schema({
      vehicleNumber: String,
      owner: mongoose.Schema.Types.ObjectId,
      vehicleType: String,
      brand: String,
      model: String,
      color: String,
      isActive: Boolean,
      createdAt: Date
    });
    
    const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
    
    const vehicles = await Vehicle.create([
      {
        vehicleNumber: 'MH12AB1234',
        owner: users[2]._id, // Customer User
        vehicleType: 'car',
        brand: 'Toyota',
        model: 'Innova',
        color: 'White',
        isActive: true,
        createdAt: new Date()
      },
      {
        vehicleNumber: 'MH01AB1234',
        owner: users[3]._id, // John Doe
        vehicleType: 'car',
        brand: 'Hyundai',
        model: 'Creta',
        color: 'Black',
        isActive: true,
        createdAt: new Date()
      },
      {
        vehicleNumber: 'DL2CAB5678',
        owner: users[4]._id, // Jane Smith
        vehicleType: 'bike',
        brand: 'Honda',
        model: 'Activa',
        color: 'Red',
        isActive: true,
        createdAt: new Date()
      },
      {
        vehicleNumber: 'KA05CD4321',
        owner: users[2]._id, // Customer User
        vehicleType: 'truck',
        brand: 'Tata',
        model: 'Ace',
        color: 'Blue',
        isActive: true,
        createdAt: new Date()
      }
    ]);
    
    console.log('✅ Created ' + vehicles.length + ' vehicles');
    
    // Create some parking records
    console.log(' Creating parking records...');
    
    const parkingSchema = new mongoose.Schema({
      vehicle: mongoose.Schema.Types.ObjectId,
      vehicleNumber: String,
      owner: mongoose.Schema.Types.ObjectId,
      ownerName: String,
      phone: String,
      slot: mongoose.Schema.Types.ObjectId,
      slotNumber: String,
      entryTime: Date,
      exitTime: Date,
      amount: Number,
      status: String,
      paymentStatus: String,
      duration: Number,
      createdAt: Date
    });
    
    const Parking = mongoose.models.Parking || mongoose.model('Parking', parkingSchema);
    
    const parkings = await Parking.create([
      {
        vehicle: vehicles[0]._id,
        vehicleNumber: 'MH12AB1234',
        owner: users[2]._id,
        ownerName: 'Customer User',
        phone: '9876543212',
        slot: slots[0]._id,
        slotNumber: 'C101',
        entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        exitTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        amount: 100,
        status: 'completed',
        paymentStatus: 'paid',
        duration: 2,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        vehicle: vehicles[1]._id,
        vehicleNumber: 'MH01AB1234',
        owner: users[3]._id,
        ownerName: 'John Doe',
        phone: '9876543213',
        slot: slots[1]._id,
        slotNumber: 'C102',
        entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        exitTime: null,
        amount: 0,
        status: 'active',
        paymentStatus: 'pending',
        duration: 0,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        vehicle: vehicles[2]._id,
        vehicleNumber: 'DL2CAB5678',
        owner: users[4]._id,
        ownerName: 'Jane Smith',
        phone: '9876543214',
        slot: slots[50]._id,
        slotNumber: 'B101',
        entryTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        exitTime: null,
        amount: 0,
        status: 'active',
        paymentStatus: 'pending',
        duration: 0,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]);
    
    console.log('✅ Created ' + parkings.length + ' parking records');
    
    // Create some payment records
    console.log('💰 Creating payment records...');
    
    const paymentSchema = new mongoose.Schema({
      parking: mongoose.Schema.Types.ObjectId,
      user: mongoose.Schema.Types.ObjectId,
      amount: Number,
      method: String,
      upiId: String,
      transactionId: String,
      status: String,
      receiptNumber: String,
      paidAt: Date,
      createdAt: Date
    });
    
    const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
    
    const payments = await Payment.create([
      {
        parking: parkings[0]._id,
        user: users[2]._id,
        amount: 100,
        method: 'upi',
        upiId: 'customer@upi',
        transactionId: 'TXN' + Date.now().toString().slice(-10),
        status: 'completed',
        receiptNumber: 'RCPT' + Date.now().toString().slice(-8),
        paidAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]);
    
    console.log('✅ Created ' + payments.length + ' payment records');
    
    // Create indexes
    console.log(' Creating indexes...');
    
    // Users collection indexes
    await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
    await mongoose.connection.collection('users').createIndex({ role: 1 });
    await mongoose.connection.collection('users').createIndex({ isActive: 1 });
    
    // ParkingSlots collection indexes
    await mongoose.connection.collection('parkingslots').createIndex({ slotNumber: 1 }, { unique: true });
    await mongoose.connection.collection('parkingslots').createIndex({ floor: 1 });
    await mongoose.connection.collection('parkingslots').createIndex({ vehicleType: 1 });
    await mongoose.connection.collection('parkingslots').createIndex({ status: 1 });
    await mongoose.connection.collection('parkingslots').createIndex({ floor: 1, vehicleType: 1, status: 1 });
    
    // Vehicles collection indexes
    await mongoose.connection.collection('vehicles').createIndex({ vehicleNumber: 1 }, { unique: true });
    await mongoose.connection.collection('vehicles').createIndex({ owner: 1 });
    await mongoose.connection.collection('vehicles').createIndex({ vehicleType: 1 });
    
    // Parkings collection indexes
    await mongoose.connection.collection('parkings').createIndex({ vehicleNumber: 1, status: 1 });
    await mongoose.connection.collection('parkings').createIndex({ owner: 1, entryTime: -1 });
    await mongoose.connection.collection('parkings').createIndex({ status: 1, entryTime: -1 });
    await mongoose.connection.collection('parkings').createIndex({ slot: 1, entryTime: -1 });
    await mongoose.connection.collection('parkings').createIndex({ entryTime: -1 });
    await mongoose.connection.collection('parkings').createIndex({ exitTime: -1 });
    await mongoose.connection.collection('parkings').createIndex({ 
      status: 1, 
      paymentStatus: 1, 
      exitTime: -1 
    });
    
    // Payments collection indexes
    await mongoose.connection.collection('payments').createIndex({ transactionId: 1 }, { unique: true, sparse: true });
    await mongoose.connection.collection('payments').createIndex({ receiptNumber: 1 }, { unique: true, sparse: true });
    await mongoose.connection.collection('payments').createIndex({ user: 1, createdAt: -1 });
    await mongoose.connection.collection('payments').createIndex({ parking: 1 });
    await mongoose.connection.collection('payments').createIndex({ status: 1 });
    await mongoose.connection.collection('payments').createIndex({ method: 1 });
    await mongoose.connection.collection('payments').createIndex({ createdAt: -1 });
    
    // Compound indexes for better performance
    await mongoose.connection.collection('parkingslots').createIndex(
      { vehicleType: 1, floor: 1, status: 1 },
      { name: 'available_slots_search' }
    );
    
    await mongoose.connection.collection('parkings').createIndex(
      { status: 1, entryTime: -1, owner: 1 },
      { name: 'dashboard_active_parkings' }
    );
    
    await mongoose.connection.collection('payments').createIndex(
      { user: 1, status: 1, createdAt: -1 },
      { name: 'user_payment_history' }
    );
    
    await mongoose.connection.collection('parkings').createIndex(
      { entryTime: 1, status: 1 },
      { name: 'report_date_range' }
    );
    
    console.log('✅ All indexes created successfully!');
    
    // Summary
    console.log('\n🎉 Database setup complete!');
    console.log('\n📋 Setup Summary:');
    console.log(`• Created ${users.length} users`);
    console.log(`• Created ${slots.length} parking slots`);
    console.log(`• Created ${vehicles.length} vehicles`);
    console.log(`• Created ${parkings.length} parking records`);
    console.log(`• Created ${payments.length} payment records`);
    console.log(`• Created 30+ indexes for optimal performance`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('1. Admin: admin@parking.com / admin123');
    console.log('2. Manager: manager@parking.com / manager123');
    console.log('3. Customer: customer@parking.com / customer123');
    console.log('4. Customer: john@example.com / john123');
    console.log('5. Customer: jane@example.com / jane123');
    
    console.log('\n🚗 Sample Data:');
    console.log('• Active Parking: Vehicle MH01AB1234 at Slot C102');
    console.log('• Active Parking: Vehicle DL2CAB5678 at Slot B101');
    console.log('• Completed Parking: Vehicle MH12AB1234 (Paid ₹100)');
    console.log('• Available Slots: 87 slots (3 occupied, 1 maintenance)');
    
    console.log('\n🚀 Start your application:');
    console.log('1. Backend: cd backend && npm start');
    console.log('2. Frontend: cd frontend && npm start');
    console.log('\n🌐 Access URLs:');
    console.log('• Home Page: http://localhost:3000');
    console.log('• Customer Login: http://localhost:3000/customer-login');
    console.log('• Admin Login: http://localhost:3000/admin-login');
    console.log('• Manager Login: http://localhost:3000/manager-login');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
  setupDatabase();
});

// If connection takes too long
setTimeout(() => {
  console.error('❌ MongoDB connection timeout');
  process.exit(1);
}, 10000);