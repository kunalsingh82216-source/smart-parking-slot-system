const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  // Vehicle Details
  vehicleNumber: { 
    type: String, 
    required: true, 
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
  
  // Slot Details
  slotId: { 
    type: String, 
    required: true,
    uppercase: true 
  },
  slotType: { 
    type: String, 
    enum: ['Car', 'Bike', 'Truck'] 
  },
  slotCategory: String,
  
  // Timing
  entryTime: { 
    type: Date, 
    required: true,
    default: Date.now,
    index: true 
  },
  exitTime: Date,
  expectedHours: { 
    type: Number, 
    min: 1, 
    default: 1 
  },
  actualHours: Number,
  exactHours: Number,
  exactMinutes: Number,
  
  // Pricing
  pricePerHour: { 
    type: Number, 
    required: true 
  },
  subtotal: Number,
  tax: Number,
  totalAmount: Number,
  
  // Payment
  paymentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Payment' 
  },
  paymentMethod: String,
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending' 
  },
  transactionId: String,
  
  // User Reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Cancelled', 'Overdue'],
    default: 'Active',
    index: true 
  },
  
  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
parkingSchema.index({ vehicleNumber: 1, entryTime: -1 });
parkingSchema.index({ phone: 1, entryTime: -1 });
parkingSchema.index({ status: 1, entryTime: -1 });

// Calculate duration
parkingSchema.methods.calculateDuration = function() {
  if (!this.exitTime) return 0;
  const diffMs = this.exitTime - this.entryTime;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { 
    hours, 
    minutes, 
    totalHours: Math.ceil(diffMs / (1000 * 60 * 60)) 
  };
};

// Calculate amount
parkingSchema.methods.calculateAmount = function() {
  const { totalHours } = this.calculateDuration();
  this.actualHours = totalHours;
  this.subtotal = totalHours * this.pricePerHour;
  this.tax = Math.round(this.subtotal * 0.18);
  this.totalAmount = this.subtotal + this.tax;
  return this.totalAmount;
};

// Complete parking
parkingSchema.methods.complete = async function() {
  this.exitTime = new Date();
  this.calculateAmount();
  this.status = 'Completed';
  this.updatedAt = Date.now();
  return this.save();
};

module.exports = mongoose.model('Parking', parkingSchema);