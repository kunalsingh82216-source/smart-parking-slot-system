const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../backend/models/User');
const ParkingSlot = require('../backend/models/ParkingSlot');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await ParkingSlot.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@parking.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin'
    });

    // Create Manager
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@parking.com',
      phone: '9876543211',
      password: 'manager123',
      role: 'manager'
    });

    // Create Customer
    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@parking.com',
      phone: '9876543212',
      password: 'customer123',
      role: 'customer',
      vehicleNumber: 'MH12AB1234'
    });

    // Create Parking Slots
    const slots = [];
    
    // Car slots (50 slots)
    for (let floor = 1; floor <= 5; floor++) {
      for (let i = 1; i <= 10; i++) {
        slots.push({
          slotNumber: `C${floor}${i.toString().padStart(2, '0')}`,
          floor: floor,
          vehicleType: 'car',
          hourlyRate: 50,
          status: 'available'
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
          status: 'available'
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
        status: 'available'
      });
    }
    await ParkingSlot.insertMany(slots);

    console.log('Database seeded successfully!');
    console.log('Admin Credentials:');
    console.log('Email: admin@parking.com');
    console.log('Password: admin123');
    console.log('\nManager Credentials:');
    console.log('Email: manager@parking.com');
    console.log('Password: manager123');
    console.log('\nCustomer Credentials:');
    console.log('Email: customer@parking.com');
    console.log('Password: customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};
seedDatabase();