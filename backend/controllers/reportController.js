const Payment = require('../models/Payment');
const Parking = require('../models/Parking');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');
const Report = require('../models/Report');

// @desc    Generate revenue report
// @route   POST /api/reports/generate
exports.generateReport = async (req, res) => {
  try {
    console.log('📊 Generating report:', req.body);
    
    const { startDate, endDate, type } = req.body;

    // Build date query
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get completed payments
    const query = { status: 'completed' };
    if (startDate && endDate) {
      query.paidAt = dateQuery;
    }

    const payments = await Payment.find(query)
      .sort({ paidAt: -1 })
      .populate('parkingId');

    console.log(`📊 Found ${payments.length} payments`);

    if (payments.length === 0) {
      return res.json({
        success: true,
        message: 'No payments found for this period',
        data: {
          summary: {
            totalRevenue: 0,
            totalParkings: 0,
            activeCustomers: 0
          }
        }
      });
    }

    // Calculate summary
    const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalParkings = payments.length;
    const uniquePhones = [...new Set(payments.map(p => p.phone))];
    const activeCustomers = uniquePhones.length;

    // Vehicle distribution
    const vehicleDist = {
      car: payments.filter(p => p.vehicleType === 'Car' || !p.vehicleType).length,
      bike: payments.filter(p => p.vehicleType === 'Bike').length,
      truck: payments.filter(p => p.vehicleType === 'Truck').length
    };

    // Payment method distribution
    const paymentDist = {
      cash: payments.filter(p => p.paymentMethod === 'cash').length,
      card: payments.filter(p => p.paymentMethod === 'card').length,
      upi: payments.filter(p => p.paymentMethod === 'upi').length,
      wallet: payments.filter(p => p.paymentMethod === 'wallet').length
    };

    // Daily revenue for last 7 days or date range
    const dailyRevenue = [];
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPayments = payments.filter(p => {
        const paidAt = new Date(p.paidAt);
        return paidAt >= dayStart && paidAt <= dayEnd;
      });

      dailyRevenue.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayPayments.reduce((sum, p) => sum + p.totalAmount, 0),
        count: dayPayments.length
      });
    }

    // Top customers
    const customerMap = new Map();
    payments.forEach(p => {
      const key = p.phone;
      if (!key) return;
      
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: p.ownerName,
          phone: key,
          visits: 0,
          totalSpent: 0,
          vehicles: new Set(),
          lastVisit: p.paidAt
        });
      }
      
      const customer = customerMap.get(key);
      customer.visits += 1;
      customer.totalSpent += p.totalAmount;
      if (p.vehicleNumber) customer.vehicles.add(p.vehicleNumber);
      if (p.paidAt > customer.lastVisit) customer.lastVisit = p.paidAt;
    });

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        phone: c.phone,
        visits: c.visits,
        totalSpent: c.totalSpent,
        vehicles: Array.from(c.vehicles),
        lastVisit: c.lastVisit
      }));

    // Create report in database
    const report = await Report.create({
      reportId: 'RPT' + Date.now(),
      reportType: type || 'custom',
      generatedBy: req.user?._id || null,
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
      dailyRevenue,
      topCustomers,
      allPayments: payments.map(p => p._id)
    });

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });

  } catch (error) {
    console.error('❌ Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get slot utilization report
// @route   GET /api/reports/utilization
exports.getSlotUtilization = async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    
    // Get active parkings
    const activeParkings = await Parking.find({ status: 'Active' });

    const utilization = slots.map(slot => {
      const activeParking = activeParkings.find(p => p.slotId === slot.slotId);
      
      return {
        slotId: slot.slotId,
        type: slot.type,
        category: slot.category,
        status: slot.status,
        utilization: slot.status === 'Occupied' ? 100 : 0,
        totalParkings: slot.totalParkings,
        revenue: slot.totalRevenue,
        currentVehicle: activeParking ? {
          vehicleNumber: activeParking.vehicleNumber,
          ownerName: activeParking.ownerName,
          entryTime: activeParking.entryTime,
          expectedHours: activeParking.expectedHours
        } : null
      };
    });

    const stats = {
      totalSlots: slots.length,
      available: slots.filter(s => s.status === 'Available').length,
      occupied: slots.filter(s => s.status === 'Occupied').length,
      maintenance: slots.filter(s => s.status === 'Maintenance').length,
      totalRevenue: slots.reduce((sum, s) => sum + s.totalRevenue, 0),
      totalParkings: slots.reduce((sum, s) => sum + s.totalParkings, 0),
      byType: {
        car: slots.filter(s => s.type === 'Car').length,
        bike: slots.filter(s => s.type === 'Bike').length,
        truck: slots.filter(s => s.type === 'Truck').length
      },
      byCategory: {
        regular: slots.filter(s => s.category === 'Regular').length,
        vip: slots.filter(s => s.category === 'VIP').length,
        ev: slots.filter(s => s.category === 'EV').length,
        disabled: slots.filter(s => s.category === 'Disabled').length
      }
    };

    res.json({
      success: true,
      stats,
      utilization
    });

  } catch (error) {
    console.error('Get utilization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get customer report
// @route   POST /api/reports/customer
exports.getCustomerReport = async (req, res) => {
  try {
    const { phone, startDate, endDate } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number'
      });
    }

    // Build payment query
    let paymentQuery = { phone };
    if (startDate && endDate) {
      paymentQuery.paidAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(paymentQuery)
      .sort({ paidAt: -1 })
      .populate('parkingId');
    
    // Get user info
    const user = await User.findOne({ phone }).select('-password');

    // Get vehicle info
    const vehicles = await Vehicle.find({ phone });

    const report = {
      customerInfo: user || {
        name: payments[0]?.ownerName || 'Unknown',
        phone
      },
      vehicles: vehicles.map(v => ({
        vehicleNumber: v.vehicleNumber,
        vehicleType: v.vehicleType,
        totalParkings: v.totalParkings,
        totalSpent: v.totalSpent
      })),
      summary: {
        totalVisits: payments.length,
        totalSpent: payments.reduce((sum, p) => sum + p.totalAmount, 0),
        averageSpent: payments.length > 0 
          ? payments.reduce((sum, p) => sum + p.totalAmount, 0) / payments.length 
          : 0,
        firstVisit: payments[payments.length - 1]?.paidAt,
        lastVisit: payments[0]?.paidAt
      },
      payments: payments.map(p => ({
        date: p.paidAt,
        vehicleNumber: p.vehicleNumber,
        slotNumber: p.slotNumber,
        amount: p.totalAmount,
        paymentMethod: p.paymentMethod,
        hours: p.hours,
        transactionId: p.transactionId
      }))
    };

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Customer report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate('generatedBy', 'name email')
      .limit(50);

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email')
      .populate('allPayments');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalSlots,
      availableSlots,
      occupiedSlots,
      activeParkings,
      pendingPayments,
      todayRevenue,
      totalRevenue
    ] = await Promise.all([
      ParkingSlot.countDocuments(),
      ParkingSlot.countDocuments({ status: 'Available' }),
      ParkingSlot.countDocuments({ status: 'Occupied' }),
      Parking.countDocuments({ status: 'Active' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.aggregate([
        { $match: { status: 'completed', paidAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        slots: {
          total: totalSlots,
          available: availableSlots,
          occupied: occupiedSlots,
          utilizationRate: totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0
        },
        parkings: {
          active: activeParkings
        },
        payments: {
          pending: pendingPayments
        },
        revenue: {
          today: todayRevenue[0]?.total || 0,
          total: totalRevenue[0]?.total || 0
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};