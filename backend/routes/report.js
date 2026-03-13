const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.post('/generate', reportController.generateReport);
router.get('/utilization', reportController.getSlotUtilization);
router.post('/customer', reportController.getCustomerReport);
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.get('/dashboard', reportController.getDashboardStats);

module.exports = router;