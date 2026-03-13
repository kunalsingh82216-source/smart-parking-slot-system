const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: { 
    type: String, 
    unique: true,
    default: () => 'RPT' + Date.now() + Math.floor(Math.random() * 1000)
  },
  
  reportType: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'custom', 'vehicle', 'customer'],
    required: true 
  },
  
  generatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  dateRange: {
    startDate: Date,
    endDate: Date
  },
  
  // Summary Statistics
  summary: {
    totalRevenue: Number,
    totalParkings: Number,
    activeCustomers: Number,
    averageRevenue: Number,
    averageDuration: Number,
    peakHours: String,
    mostUsedSlot: String
  },
  
  // Distributions
  vehicleTypeDistribution: {
    car: { type: Number, default: 0 },
    bike: { type: Number, default: 0 },
    truck: { type: Number, default: 0 }
  },
  
  paymentMethodDistribution: {
    cash: { type: Number, default: 0 },
    card: { type: Number, default: 0 },
    upi: { type: Number, default: 0 },
    wallet: { type: Number, default: 0 }
  },
  
  // Slot Utilization
  slotUtilization: [{
    slotId: String,
    utilization: Number,
    totalParkings: Number,
    revenue: Number
  }],
  
  // Top Customers
  topCustomers: [{
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    phone: String,
    visits: Number,
    totalSpent: Number,
    vehicles: [String]
  }],
  
  // Trends
  hourlyDistribution: [{
    hour: Number,
    count: Number
  }],
  
  dailyRevenue: [{
    date: String,
    revenue: Number,
    count: Number
  }],
  
  // All Payments Reference
  allPayments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  
  // Metadata
  status: { 
    type: String, 
    enum: ['generating', 'completed', 'failed'],
    default: 'completed' 
  },
  
  fileUrl: String
}, {
  timestamps: true
});

// Generate summary from payments
reportSchema.statics.generateFromPayments = async function(payments, type, userId, startDate, endDate) {
  const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalParkings = payments.length;
  const activeCustomers = [...new Set(payments.map(p => p.phone))].length;
  
  // Vehicle distribution
  const vehicleDist = {
    car: payments.filter(p => p.vehicleType === 'Car' || !p.vehicleType).length,
    bike: payments.filter(p => p.vehicleType === 'Bike').length,
    truck: payments.filter(p => p.vehicleType === 'Truck').length
  };
  
  // Payment distribution
  const paymentDist = {
    cash: payments.filter(p => p.paymentMethod === 'cash').length,
    card: payments.filter(p => p.paymentMethod === 'card').length,
    upi: payments.filter(p => p.paymentMethod === 'upi').length,
    wallet: payments.filter(p => p.paymentMethod === 'wallet').length
  };
  
  // Customer grouping
  const customerMap = new Map();
  payments.forEach(p => {
    const key = p.phone;
    if (!key) return;
    
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        phone: key,
        name: p.ownerName,
        visits: 0,
        totalSpent: 0,
        vehicles: new Set()
      });
    }
    
    const customer = customerMap.get(key);
    customer.visits += 1;
    customer.totalSpent += p.totalAmount;
    if (p.vehicleNumber) customer.vehicles.add(p.vehicleNumber);
  });
  
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map(c => ({
      name: c.name,
      phone: c.phone,
      visits: c.visits,
      totalSpent: c.totalSpent,
      vehicles: Array.from(c.vehicles)
    }));
  
  return this.create({
    reportType: type,
    generatedBy: userId,
    dateRange: { startDate, endDate },
    summary: {
      totalRevenue,
      totalParkings,
      activeCustomers,
      averageRevenue: totalParkings > 0 ? (totalRevenue / totalParkings) : 0,
      averageDuration: 2.5,
      peakHours: '10 AM - 2 PM',
      mostUsedSlot: 'F1-A1'
    },
    vehicleTypeDistribution: vehicleDist,
    paymentMethodDistribution: paymentDist,
    topCustomers,
    allPayments: payments.map(p => p._id)
  });
};

module.exports = mongoose.model('Report', reportSchema);