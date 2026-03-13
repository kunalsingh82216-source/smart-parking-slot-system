const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    index: true 
  },
  
  ownerName: { 
    type: String, 
    required: true 
  },
  
  phone: { 
    type: String, 
    required: true,
    index: true 
  },
  
  email: String,
  
  vehicleType: { 
    type: String, 
    enum: ['Car', 'Bike', 'Truck'],
    required: true 
  },
  
  vehicleModel: String,
  vehicleColor: String,
  registrationYear: Number,
  
  // Insurance Details
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  
  // User Reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Statistics
  totalParkings: { 
    type: Number, 
    default: 0 
  },
  
  totalSpent: { 
    type: Number, 
    default: 0 
  },
  
  lastParked: Date,
  
  // Parking History
  parkingHistory: [{
    parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' },
    slotId: String,
    entryTime: Date,
    exitTime: Date,
    amount: Number
  }],
  
  // Current Status
  currentStatus: { 
    type: String, 
    enum: ['Parked', 'Outside', 'Blocked'],
    default: 'Outside' 
  },
  
  currentSlot: String,
  
  // Preferences
  preferredSlotType: String,
  preferredFloor: String,
  isVIP: { 
    type: Boolean, 
    default: false 
  },
  
  notes: String
}, {
  timestamps: true
});

// Indexes
vehicleSchema.index({ vehicleNumber: 1, phone: 1 });

// Add parking record
vehicleSchema.methods.addParking = async function(parkingId, slotId, entryTime, amount) {
  this.parkingHistory.push({
    parkingId,
    slotId,
    entryTime,
    amount
  });
  this.totalParkings += 1;
  this.totalSpent += amount;
  this.lastParked = new Date();
  this.currentStatus = 'Parked';
  this.currentSlot = slotId;
  return this.save();
};

// Exit vehicle
vehicleSchema.methods.exitParking = async function(exitTime) {
  const lastParking = this.parkingHistory[this.parkingHistory.length - 1];
  if (lastParking) {
    lastParking.exitTime = exitTime;
  }
  this.currentStatus = 'Outside';
  this.currentSlot = null;
  return this.save();
};

module.exports = mongoose.model('Vehicle', vehicleSchema);