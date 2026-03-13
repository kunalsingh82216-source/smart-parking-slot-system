const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { 
    type: String, 
    unique: true,
    default: () => 'PAY' + Date.now() + Math.floor(Math.random() * 1000)
  },
  
  // Customer Details
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
  email: String,
  
  // Parking Details
  slotNumber: { 
    type: String, 
    required: true,
    uppercase: true 
  },
  vehicleType: { 
    type: String, 
    enum: ['Car', 'Bike', 'Truck'],
    default: 'Car' 
  },
  entryTime: { 
    type: Date, 
    required: true 
  },
  exitTime: { 
    type: Date, 
    required: true 
  },
  hours: { 
    type: Number, 
    required: true 
  },
  exactHours: Number,
  exactMinutes: Number,
  pricePerHour: { 
    type: Number, 
    required: true 
  },
  
  // Amount Details
  amount: { 
    type: Number, 
    required: true 
  }, // subtotal
  tax: { 
    type: Number, 
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  
  // Payment Details
  paymentMethod: { 
    type: String, 
    enum: ['pending', 'cash', 'card', 'upi', 'wallet'],
    default: 'pending' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true 
  },
  
  // Transaction Details
  transactionId: String,
  upiId: String,
  upiTransactionId: String,
  upiReference: String,
  
  // Card Details
  cardDetails: {
    last4: String,
    cardType: String,
    bankName: String
  },
  
  // Cash Details
  cashReceivedBy: String,
  cashReference: String,
  
  // Wallet Details
  walletType: String,
  
  // Timestamps
  paidAt: Date,
  
  // References
  parkingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Parking' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Receipt
  receiptGenerated: { 
    type: Boolean, 
    default: false 
  },
  receiptUrl: String
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ phone: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ vehicleNumber: 1, createdAt: -1 });

// Generate transaction ID before save
paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const prefix = this.paymentMethod === 'cash' ? 'CASH' :
                  this.paymentMethod === 'card' ? 'CARD' :
                  this.paymentMethod === 'upi' ? 'UPI' :
                  this.paymentMethod === 'wallet' ? 'WLT' : 'TXN';
    this.transactionId = prefix + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
  }
  next();
});

// Mark as completed
paymentSchema.methods.markCompleted = async function() {
  this.status = 'completed';
  this.paidAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);