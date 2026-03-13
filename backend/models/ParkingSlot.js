const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true 
  },
  floor: { 
    type: String, 
    required: true 
  },
  area: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Car', 'Bike', 'Truck'],
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Regular', 'VIP', 'EV', 'Disabled'],
    default: 'Regular' 
  },
  pricePerHour: { 
    type: Number, 
    required: true,
    default: 50,
    min: 10 
  },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
    default: 'Available' 
  },
  currentVehicle: {
    vehicleNumber: { type: String, uppercase: true },
    ownerName: String,
    phone: String,
    entryTime: Date,
    expectedHours: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  totalParkings: { 
    type: Number, 
    default: 0 
  },
  totalRevenue: { 
    type: Number, 
    default: 0 
  },
  lastOccupied: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp before save
parkingSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if slot is available
parkingSlotSchema.methods.isAvailable = function() {
  return this.status === 'Available';
};

// Update slot stats after vehicle exit
parkingSlotSchema.methods.completeParking = async function(amount) {
  this.status = 'Available';
  this.totalParkings += 1;
  this.totalRevenue += amount;
  this.lastOccupied = new Date();
  this.currentVehicle = null;
  this.updatedAt = Date.now();
  return this.save();
};

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);