const Payment = require('../models/Payment');
const Parking = require('../models/Parking');
const User = require('../models/User');

// @desc    Get pending payments
// @route   GET /api/payment/pending
exports.getPendingPayments = async (req, res) => {
  try {
    console.log('📊 Fetching pending payments...');
    
    // ✅ Fix: Add error handling for database connection
    const payments = await Payment.find({ 
      status: 'pending' 
    })
    .sort({ createdAt: -1 })
    .populate('parkingId')
    .lean(); // Better performance

    console.log(`✅ Found ${payments.length} pending payments`);

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('❌ Get pending error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Process payment
// @route   POST /api/payment/process
exports.processPayment = async (req, res) => {
  try {
    console.log('💰 Processing payment:', req.body);
    
    const { paymentId, method, upiId, cardDetails, cashReceivedBy } = req.body;

    if (!paymentId || !method) {
      return res.status(400).json({
        success: false,
        message: 'Please provide payment ID and method'
      });
    }

    // ✅ Fix: Validate payment method
    const validMethods = ['cash', 'card', 'upi', 'wallet'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Find payment
    const payment = await Payment.findById(paymentId).populate('parkingId');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`
      });
    }

    // Update payment based on method
    payment.paymentMethod = method;
    payment.status = 'completed';
    payment.paidAt = new Date();

    // Method specific details
    if (method === 'upi') {
      payment.upiId = upiId || 'customer@upi';
      payment.upiTransactionId = 'UPI' + Date.now();
      payment.upiReference = 'REF' + Math.random().toString(36).substring(7);
      payment.transactionId = 'UPI' + Date.now() + Math.floor(Math.random() * 1000);
    } else if (method === 'card') {
      payment.cardDetails = cardDetails || {
        last4: '1234',
        cardType: 'VISA',
        bankName: 'HDFC'
      };
      payment.transactionId = 'CARD' + Date.now() + Math.floor(Math.random() * 1000);
    } else if (method === 'cash') {
      payment.cashReceivedBy = cashReceivedBy || 'Admin';
      payment.cashReference = 'CASH' + Date.now().toString().slice(-8);
      payment.transactionId = 'CASH' + Date.now() + Math.floor(Math.random() * 1000);
    } else if (method === 'wallet') {
      payment.walletType = 'Paytm';
      payment.transactionId = 'WLT' + Date.now() + Math.floor(Math.random() * 1000);
    }

    await payment.save();
    console.log('✅ Payment completed:', payment.paymentId);
    console.log('✅ Transaction ID:', payment.transactionId);

    // Update parking record
    if (payment.parkingId) {
      await Parking.findByIdAndUpdate(
        payment.parkingId._id || payment.parkingId, 
        {
          paymentMethod: method,
          paymentStatus: 'completed',
          transactionId: payment.transactionId
        },
        { new: true }
      );
      console.log('✅ Parking updated');
    }

    // Update user if exists by userId
    if (payment.userId) {
      await User.findByIdAndUpdate(payment.userId, {
        $inc: { totalSpent: payment.totalAmount },
        $push: { paymentHistory: payment._id }
      });
      console.log('✅ User updated by ID');
    }

    // Find and update user by phone (if not updated by ID)
    const user = await User.findOne({ phone: payment.phone });
    if (user && (!payment.userId || payment.userId.toString() !== user._id.toString())) {
      user.totalSpent = (user.totalSpent || 0) + payment.totalAmount;
      user.paymentHistory = user.paymentHistory || [];
      user.paymentHistory.push(payment._id);
      await user.save();
      console.log('✅ User updated by phone');
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        _id: payment._id,
        paymentId: payment.paymentId,
        transactionId: payment.transactionId,
        amount: payment.totalAmount,
        method: payment.paymentMethod,
        status: payment.status,
        paidAt: payment.paidAt
      }
    });

  } catch (error) {
    console.error('❌ Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payment/history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { phone, startDate, endDate, status, limit = 100 } = req.query;
    
    let query = {};
    
    if (phone) query.phone = phone;
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.paidAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(query)
      .sort({ paidAt: -1 })
      .populate('parkingId')
      .populate('userId', 'name email')
      .limit(parseInt(limit));

    // Calculate summary
    const summary = {
      total: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.totalAmount, 0),
      byMethod: {
        cash: payments.filter(p => p.paymentMethod === 'cash').length,
        card: payments.filter(p => p.paymentMethod === 'card').length,
        upi: payments.filter(p => p.paymentMethod === 'upi').length,
        wallet: payments.filter(p => p.paymentMethod === 'wallet').length
      }
    };

    res.json({
      success: true,
      summary,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payment/:id
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('parkingId')
      .populate('userId', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('❌ Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create payment
// @route   POST /api/payment/create
exports.createPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Validate required fields
    const requiredFields = ['vehicleNumber', 'ownerName', 'amount', 'totalAmount'];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }
    
    const payment = new Payment({
      ...paymentData,
      paymentId: 'PAY' + Date.now() + Math.floor(Math.random() * 1000),
      status: 'pending'
    });
    
    await payment.save();
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment
    });

  } catch (error) {
    console.error('❌ Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get payment stats
// @route   GET /api/payment/stats
exports.getPaymentStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [
      totalPayments,
      pendingCount,
      completedCount,
      failedCount,
      completedToday,
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ status: 'failed' }),
      Payment.countDocuments({ 
        status: 'completed', 
        paidAt: { $gte: today } 
      }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Payment.aggregate([
        { 
          $match: { 
            status: 'completed', 
            paidAt: { $gte: today } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Payment.aggregate([
        { 
          $match: { 
            status: 'completed', 
            paidAt: { $gte: weekAgo } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Payment.aggregate([
        { 
          $match: { 
            status: 'completed', 
            paidAt: { $gte: monthAgo } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        total: {
          count: totalPayments,
          completed: completedCount,
          pending: pendingCount,
          failed: failedCount
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          today: todayRevenue[0]?.total || 0,
          weekly: weeklyRevenue[0]?.total || 0,
          monthly: monthlyRevenue[0]?.total || 0
        },
        today: {
          completed: completedToday
        }
      }
    });

  } catch (error) {
    console.error('❌ Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete payment (Admin only)
// @route   DELETE /api/payment/:id
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.deleteOne();

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};