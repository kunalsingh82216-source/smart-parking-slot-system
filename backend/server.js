const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ IMPORT CONTROLLERS ============
const parkingController = require('./controllers/parkingController');
const paymentController = require('./controllers/paymentController');
const reportController = require('./controllers/reportController');

// ============ ROUTES ============

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ✅ FIXED PARKING ROUTES
app.post('/api/parking/slots', parkingController.createSlots);
app.get('/api/parking/slots', parkingController.getAllSlots);
app.get('/api/parking/available', parkingController.getAvailableSlots);
app.post('/api/parking/park', parkingController.parkVehicle);
app.post('/api/parking/exit', parkingController.exitVehicle);
app.get('/api/parking/history', parkingController.getParkingHistory);
app.put('/api/parking/slot/:slotId/price', parkingController.updateSlotPrice);
app.get('/api/parking/stats', parkingController.getParkingStats);
app.get('/api/parking/active', parkingController.getActiveParkings);

// Payment Routes
app.get('/api/payment/pending', paymentController.getPendingPayments);
app.post('/api/payment/process', paymentController.processPayment);
app.get('/api/payment/history', paymentController.getPaymentHistory);
app.get('/api/payment/:id', paymentController.getPaymentById);
app.post('/api/payment/create', paymentController.createPayment);
app.get('/api/payment/stats', paymentController.getPaymentStats);

// Report Routes
app.post('/api/reports/generate', reportController.generateReport);
app.get('/api/reports/utilization', reportController.getSlotUtilization);
app.post('/api/reports/customer', reportController.getCustomerReport);
app.get('/api/reports', reportController.getAllReports);
app.get('/api/reports/:id', reportController.getReportById);
app.get('/api/reports/dashboard', reportController.getDashboardStats);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   - POST  /api/auth/signup`);
  console.log(`   - POST  /api/auth/login`);
  console.log(`   - POST  /api/parking/slots`);
  console.log(`   - GET   /api/parking/slots`);
  console.log(`   - POST  /api/parking/park`);
  console.log(`   - POST  /api/parking/exit`);
  console.log(`   - GET   /api/payment/pending`);
  console.log(`   - POST  /api/reports/generate`);
});