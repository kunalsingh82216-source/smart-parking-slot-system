const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// Protect all routes
router.use(protect);

// ============ SLOT MANAGEMENT ============
// Create slots (Admin only)
router.post('/slots', authorize('admin'), parkingController.createSlots);

// Get all slots (All authenticated users)
router.get('/slots', parkingController.getAllSlots);

// Get available slots (All authenticated users)
router.get('/available', parkingController.getAvailableSlots);

// Update slot price (Admin only)
router.put('/slot/:slotId/price', authorize('admin'), parkingController.updateSlotPrice);

// Delete slot (Admin only)
router.delete('/slot/:slotId', authorize('admin'), parkingController.deleteSlot);

// ============ VEHICLE OPERATIONS ============
// ✅ FIXED: Changed from '/entry' to '/park' to match frontend
router.post('/park', parkingController.parkVehicle);

// Vehicle exit
router.post('/exit', parkingController.exitVehicle);

// Get vehicle details by number
router.get('/vehicle/:vehicleNumber', parkingController.getVehicleDetails);

// ============ PARKING STATUS ============
// Get active parkings (All authenticated users)
router.get('/active', parkingController.getActiveParkings);

// Get parking history (All authenticated users - can filter by own)
router.get('/history', parkingController.getParkingHistory);

// Get parking stats (Admin/Manager only)
router.get('/stats', authorize('admin', 'manager'), parkingController.getParkingStats);

module.exports = router;