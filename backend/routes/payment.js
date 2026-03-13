const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/pending', paymentController.getPendingPayments);
router.post('/process', paymentController.processPayment);
router.get('/history', paymentController.getPaymentHistory);
router.get('/:id', paymentController.getPaymentById);
router.post('/create', paymentController.createPayment);
router.get('/stats', paymentController.getPaymentStats);
router.delete('/:id', authorize('admin'), paymentController.deletePayment);

module.exports = router;