const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const ParkingSlot = require('../models/ParkingSlot');
const Payment = require('../models/Payment');
const bcrypt = require('bcryptjs');
const moment = require('moment');

// Admin Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = moment().startOf('day');
    const todayEnd = moment().endOf('day');
    
    // Total vehicles parked today
    const todayVehicles = await Vehicle.countDocuments({
      entryTime: { $gte: todayStart, $lte: todayEnd }
    });
    
    // Currently parked vehicles
    const parkedVehicles = await Vehicle.countDocuments({ isActive: true });
    
    // Total slots
    const totalSlots = await ParkingSlot.countDocuments();
    
    // Available slots
    const availableSlots = await ParkingSlot.countDocuments({ isOccupied: false });
    
    // Today's revenue
    const todayPayments = await Payment.find({
      paymentTime: { $gte: todayStart, $lte: todayEnd },
      paymentStatus: 'completed'
    });
    
    const todayRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Total revenue
    const totalRevenueResult = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    
    // Vehicle type distribution
    const vehicleTypeStats = await Vehicle.aggregate([
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } }
    ]);
    
    // Payment method distribution
    const paymentMethodStats = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    
    // Recent activities
    const recentVehicles = await Vehicle.find()
      .sort({ entryTime: -1 })
      .limit(10)
      .select('vehicleNumber vehicleType ownerName entryTime slotNumber');
    
    const recentPayments = await Payment.find()
      .sort({ paymentTime: -1 })
      .limit(10)
      .populate('vehicleId', 'vehicleNumber ownerName')
      .select('vehicleNumber amount paymentMethod paymentTime');
    
    res.json({
      success: true,
      data: {
        todayVehicles,
        parkedVehicles,
        totalSlots,
        availableSlots,
        todayRevenue,
        totalRevenue,
        vehicleTypeStats: vehicleTypeStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        paymentMethodStats,
        recentVehicles,
        recentPayments
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Manage Users (CRUD Operations)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const totalUsers = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's vehicle history
    const vehicles = await Vehicle.find({ ownerName: user.name })
      .sort({ entryTime: -1 })
      .limit(20);
    
    res.json({
      success: true,
      data: {
        user,
        vehicles
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, vehicleNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      vehicleNumber
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phoneNumber, vehicleNumber, password } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (vehicleNumber) updates.vehicleNumber = vehicleNumber;
    
    // Update password if provided
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Manage Parking Slots
exports.getAllSlots = async (req, res) => {
  try {
    const { floor, slotType, isOccupied, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (floor) query.floor = floor;
    if (slotType) query.slotType = slotType;
    if (isOccupied !== undefined) query.isOccupied = isOccupied === 'true';
    
    const slots = await ParkingSlot.find(query)
      .populate('currentVehicle', 'vehicleNumber vehicleType ownerName entryTime')
      .sort({ slotNumber: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const totalSlots = await ParkingSlot.countDocuments(query);
    
    // Get statistics
    const totalCount = await ParkingSlot.countDocuments();
    const occupiedCount = await ParkingSlot.countDocuments({ isOccupied: true });
    const availableCount = totalCount - occupiedCount;
    
    // Floor-wise statistics
    const floorStats = await ParkingSlot.aggregate([
      { $group: { 
        _id: '$floor',
        total: { $sum: 1 },
        occupied: { 
          $sum: { $cond: ['$isOccupied', 1, 0] } 
        }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        slots,
        statistics: {
          total: totalCount,
          occupied: occupiedCount,
          available: availableCount,
          floorStats
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalSlots,
          pages: Math.ceil(totalSlots / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createSlot = async (req, res) => {
  try {
    const { slotNumber, slotType, floor, hourlyRate } = req.body;
    
    // Check if slot already exists
    const existingSlot = await ParkingSlot.findOne({ slotNumber });
    if (existingSlot) {
      return res.status(400).json({ error: 'Slot already exists' });
    }
    
    const slot = new ParkingSlot({
      slotNumber,
      slotType,
      floor: floor || 1,
      hourlyRate: hourlyRate || (slotType === 'car' ? 50 : slotType === 'bike' ? 20 : 100),
      isOccupied: false
    });
    
    await slot.save();
    
    res.status(201).json({
      success: true,
      message: 'Parking slot created successfully',
      data: slot
    });
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { slotNumber, slotType, floor, hourlyRate, isOccupied } = req.body;
    
    const updates = {};
    if (slotNumber) updates.slotNumber = slotNumber;
    if (slotType) updates.slotType = slotType;
    if (floor) updates.floor = floor;
    if (hourlyRate) updates.hourlyRate = hourlyRate;
    if (isOccupied !== undefined) updates.isOccupied = isOccupied;
    
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!slot) {
      return res.status(404).json({ error: 'Parking slot not found' });
    }
    
    res.json({
      success: true,
      message: 'Parking slot updated successfully',
      data: slot
    });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    // Check if slot is occupied
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ error: 'Parking slot not found' });
    }
    
    if (slot.isOccupied) {
      return res.status(400).json({ error: 'Cannot delete occupied slot' });
    }
    
    await ParkingSlot.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Parking slot deleted successfully'
    });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Parking System Configuration
exports.updateSystemConfig = async (req, res) => {
  try {
    const { 
      carHourlyRate,
      bikeHourlyRate,
      truckHourlyRate,
      maxParkingHours,
      overtimeCharge,
      discountPercentage,
      taxPercentage,
      maintenanceMode
    } = req.body;
    
    // In a real system, you would save these to a Config model
    // For now, we'll return the updated configuration
    
    const config = {
      carHourlyRate: carHourlyRate || 50,
      bikeHourlyRate: bikeHourlyRate || 20,
      truckHourlyRate: truckHourlyRate || 100,
      maxParkingHours: maxParkingHours || 24,
      overtimeCharge: overtimeCharge || 1.5,
      discountPercentage: discountPercentage || 10,
      taxPercentage: taxPercentage || 18,
      maintenanceMode: maintenanceMode || false,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      message: 'System configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update system config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSystemConfig = async (req, res) => {
  try {
    // Get current configuration
    // In a real system, fetch from Config model
    const config = {
      carHourlyRate: 50,
      bikeHourlyRate: 20,
      truckHourlyRate: 100,
      maxParkingHours: 24,
      overtimeCharge: 1.5,
      discountPercentage: 10,
      taxPercentage: 18,
      maintenanceMode: false,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      supportEmail: 'support@parkingsystem.com',
      supportPhone: '+91-9876543210'
    };
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Financial Reports
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const query = {
      paymentStatus: 'completed'
    };
    
    if (startDate && endDate) {
      query.paymentTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    
    // Get total revenue
    const payments = await Payment.find(query)
      .populate('vehicleId', 'vehicleType')
      .sort({ paymentTime: -1 });
    
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Daily revenue breakdown
    const dailyRevenue = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paymentTime" }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);
    
    // Payment method breakdown
    const paymentMethodBreakdown = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Vehicle type revenue
    const vehicleTypeRevenue = await Payment.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicle'
        }
      },
      { $unwind: '$vehicle' },
      {
        $group: {
          _id: '$vehicle.vehicleType',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Top vehicles by revenue
    const topVehicles = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$vehicleNumber',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTransactions: payments.length,
          averageTransaction: payments.length > 0 ? totalRevenue / payments.length : 0
        },
        dailyRevenue,
        paymentMethodBreakdown,
        vehicleTypeRevenue,
        topVehicles,
        recentPayments: payments.slice(0, 20)
      }
    });
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Generate Reports
exports.generateReport = async (req, res) => {
  try {
    const { reportType, format = 'json', startDate, endDate } = req.body;
    
    let data;
    
    switch (reportType) {
      case 'daily_summary':
        data = await generateDailySummaryReport(startDate, endDate);
        break;
      case 'vehicle_analysis':
        data = await generateVehicleAnalysisReport(startDate, endDate);
        break;
      case 'slot_utilization':
        data = await generateSlotUtilizationReport(startDate, endDate);
        break;
      case 'user_activity':
        data = await generateUserActivityReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }
    
    if (format === 'csv') {
      // Convert to CSV
      const csvData = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.csv`);
      return res.send(csvData);
    }
    
    res.json({
      success: true,
      data,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper functions for reports
async function generateDailySummaryReport(startDate, endDate) {
  const query = {};
  if (startDate && endDate) {
    query.entryTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate + 'T23:59:59.999Z')
    };
  }
  
  const vehicles = await Vehicle.find(query);
  const payments = await Payment.find({
    paymentTime: query.entryTime || {},
    paymentStatus: 'completed'
  });
  
  return {
    summary: {
      totalVehicles: vehicles.length,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      averageParkingDuration: calculateAverageDuration(vehicles),
      peakHour: calculatePeakHour(vehicles)
    },
    dailyBreakdown: await getDailyBreakdown(startDate, endDate),
    vehicleTypes: await getVehicleTypeBreakdown(vehicles)
  };
}

async function generateVehicleAnalysisReport(startDate, endDate) {
  const query = {};
  if (startDate && endDate) {
    query.entryTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate + 'T23:59:59.999Z')
    };
  }
  
  const vehicles = await Vehicle.find(query).sort({ entryTime: -1 });
  
  return {
    totalVehicles: vehicles.length,
    vehicleTypeDistribution: await getVehicleTypeDistribution(vehicles),
    frequentVehicles: await getFrequentVehicles(vehicles),
    averageStayByType: await getAverageStayByType(vehicles),
    vehicleTimeline: await getVehicleTimeline(startDate, endDate)
  };
}

async function generateSlotUtilizationReport(startDate, endDate) {
  const slots = await ParkingSlot.find();
  const vehicles = await Vehicle.find({
    entryTime: startDate && endDate ? {
      $gte: new Date(startDate),
      $lte: new Date(endDate + 'T23:59:59.999Z')
    } : {}
  });
  
  return {
    slotStatistics: {
      total: slots.length,
      occupied: slots.filter(s => s.isOccupied).length,
      available: slots.filter(s => !s.isOccupied).length
    },
    floorWiseUtilization: await getFloorWiseUtilization(slots),
    slotTypeUtilization: await getSlotTypeUtilization(slots),
    hourlyUtilization: await getHourlyUtilization(vehicles),
    mostUsedSlots: await getMostUsedSlots(vehicles)
  };
}

async function generateUserActivityReport(startDate, endDate) {
  const users = await User.find().select('-password');
  const vehicles = await Vehicle.find({
    entryTime: startDate && endDate ? {
      $gte: new Date(startDate),
      $lte: new Date(endDate + 'T23:59:59.999Z')
    } : {}
  });
  
  return {
    totalUsers: users.length,
    userGrowth: await getUserGrowth(startDate, endDate),
    userActivity: await getUserActivity(users, vehicles),
    userSegmentation: await getUserSegmentation(users),
    inactiveUsers: await getInactiveUsers(users, vehicles)
  };
}

// Utility functions
function calculateAverageDuration(vehicles) {
  const durations = vehicles
    .filter(v => v.exitTime)
    .map(v => moment(v.exitTime).diff(moment(v.entryTime), 'hours', true));
  
  return durations.length > 0 
    ? durations.reduce((a, b) => a + b) / durations.length 
    : 0;
}

function calculatePeakHour(vehicles) {
  const hours = vehicles.map(v => moment(v.entryTime).hour());
  const hourCounts = hours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  
  const peakHour = Object.entries(hourCounts).reduce((a, b) => 
    a[1] > b[1] ? a : b
  );
  
  return {
    hour: parseInt(peakHour[0]),
    count: peakHour[1],
    timeRange: `${peakHour[0]}:00 - ${parseInt(peakHour[0]) + 1}:00`
  };
}

async function getDailyBreakdown(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        entryTime: startDate && endDate ? {
          $gte: new Date(startDate),
          $lte: new Date(endDate + 'T23:59:59.999Z')
        } : {}
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$entryTime" }
        },
        vehicleCount: { $sum: 1 },
        revenue: { $sum: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ];
  
  return await Vehicle.aggregate(pipeline);
}

// ... other utility functions would be defined here

function convertToCSV(data) {
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  if (Array.isArray(data)) {
    const headers = Object.keys(flattenObject(data[0] || {})).join(',');
    const rows = data.map(row => {
      const flatRow = flattenObject(row);
      return Object.values(flatRow).map(val => 
        `"${String(val).replace(/"/g, '""')}"`
      ).join(',');
    });
    return [headers, ...rows].join('\n');
  } else {
    const flatData = flattenObject(data);
    const headers = Object.keys(flatData).join(',');
    const values = Object.values(flatData).map(val => 
      `"${String(val).replace(/"/g, '""')}"`
    ).join(',');
    return [headers, values].join('\n');
  }
}

// Maintenance Operations
exports.systemMaintenance = async (req, res) => {
  try {
    const { operation, password } = req.body;
    
    // Verify admin password for critical operations
    const admin = await User.findById(req.user.id);
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    switch (operation) {
      case 'backup_database':
        // Implement database backup logic
        // This would typically involve mongodump or similar
        return res.json({
          success: true,
          message: 'Database backup initiated',
          backupId: `backup_${Date.now()}`,
          timestamp: new Date()
        });
        
      case 'clear_old_records':
        // Clear records older than 30 days
        const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
        
        const oldVehicles = await Vehicle.deleteMany({
          exitTime: { $lt: thirtyDaysAgo }
        });
        
        const oldPayments = await Payment.deleteMany({
          paymentTime: { $lt: thirtyDaysAgo }
        });
        
        return res.json({
          success: true,
          message: 'Old records cleared successfully',
          deletedVehicles: oldVehicles.deletedCount,
          deletedPayments: oldPayments.deletedCount
        });
        
      case 'recalculate_stats':
        // Recalculate all statistics
        await recalculateAllStatistics();
        
        return res.json({
          success: true,
          message: 'Statistics recalculated successfully',
          timestamp: new Date()
        });
        
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
  } catch (error) {
    console.error('System maintenance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

async function recalculateAllStatistics() {
  // Implement logic to recalculate all system statistics
  // This would update various aggregated data
  console.log('Recalculating all statistics...');
}

// Export database
exports.exportData = async (req, res) => {
  try {
    const { dataType, format = 'json' } = req.query;
    
    let data;
    let filename;
    
    switch (dataType) {
      case 'users':
        data = await User.find().select('-password');
        filename = 'users_export';
        break;
      case 'vehicles':
        data = await Vehicle.find();
        filename = 'vehicles_export';
        break;
      case 'payments':
        data = await Payment.find().populate('vehicleId');
        filename = 'payments_export';
        break;
      case 'slots':
        data = await ParkingSlot.find().populate('currentVehicle');
        filename = 'slots_export';
        break;
      case 'all':
        data = {
          users: await User.find().select('-password'),
          vehicles: await Vehicle.find(),
          payments: await Payment.find().populate('vehicleId'),
          slots: await ParkingSlot.find().populate('currentVehicle')
        };
        filename = 'complete_export';
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }
    
    if (format === 'csv') {
      const csvData = convertToCSV(Array.isArray(data) ? data : [data]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.csv`);
      return res.send(csvData);
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.json`);
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};