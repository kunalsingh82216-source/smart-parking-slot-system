const ParkingSlot = require('../models/ParkingSlot');
const Parking = require('../models/Parking');
const Vehicle = require('../models/Vehicle');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Create multiple parking slots
// @route   POST /api/parking/slots
exports.createSlots = async (req, res) => {
  try {
    const { floor, area, type, category, pricePerHour, count } = req.body;

    if (!floor || !area || !type || !pricePerHour || !count) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const slots = [];
    const errors = [];

    for (let i = 1; i <= count; i++) {
      const slotNumber = i.toString().padStart(2, '0');
      const slotId = `${floor}-${area}-${type[0]}${slotNumber}`;

      const existingSlot = await ParkingSlot.findOne({ slotId });
      if (existingSlot) {
        errors.push(`Slot ${slotId} already exists`);
        continue;
      }

      slots.push({
        slotId,
        floor,
        area,
        type,
        category: category || 'Regular',
        pricePerHour: Number(pricePerHour),
        status: 'Available'
      });
    }

    if (slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No slots created',
        errors
      });
    }

    const createdSlots = await ParkingSlot.insertMany(slots);

    res.status(201).json({
      success: true,
      message: `${createdSlots.length} slots created successfully`,
      errors: errors.length > 0 ? errors : undefined,
      slots: createdSlots
    });

  } catch (error) {
    console.error('❌ Create slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all parking slots
// @route   GET /api/parking/slots
exports.getAllSlots = async (req, res) => {
  try {
    const { floor, type, status, category } = req.query;
    
    let query = {};
    if (floor) query.floor = floor;
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;

    const slots = await ParkingSlot.find(query).sort({ slotId: 1 });
    
    const stats = {
      total: slots.length,
      available: slots.filter(s => s.status === 'Available').length,
      occupied: slots.filter(s => s.status === 'Occupied').length,
      maintenance: slots.filter(s => s.status === 'Maintenance').length,
      byType: {
        car: slots.filter(s => s.type === 'Car').length,
        bike: slots.filter(s => s.type === 'Bike').length,
        truck: slots.filter(s => s.type === 'Truck').length
      }
    };

    res.json({
      success: true,
      stats,
      slots
    });

  } catch (error) {
    console.error('❌ Get slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get available slots
// @route   GET /api/parking/available
exports.getAvailableSlots = async (req, res) => {
  try {
    const { type } = req.query;
    let query = { status: 'Available' };

    if (type) {
      query.type = { $regex: new RegExp(`^${type}$`, 'i') };
    }

    const slots = await ParkingSlot.find(query).sort({ slotId: 1 });

    res.json({
      success: true,
      count: slots.length,
      slots
    });

  } catch (error) {
    console.error('❌ Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ SINGLE parkVehicle FUNCTION
// @desc    Park vehicle
// @route   POST /api/parking/park
exports.parkVehicle = async (req, res) => {
  try {
    console.log('📥 Parking request received:', req.body);
    
    const { 
      slotId, 
      vehicleNumber, 
      ownerName, 
      phone, 
      expectedHours,
      vehicleType,
      userId 
    } = req.body;

    if (!slotId || !vehicleNumber || !ownerName || !phone || !expectedHours) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // 1. Find parking slot
    const slot = await ParkingSlot.findOne({ slotId: slotId.toUpperCase() });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // 2. Check if slot is available
    if (slot.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Slot is ${slot.status}`
      });
    }

    // 3. Check if vehicle already parked
    const existingParking = await Parking.findOne({
      vehicleNumber: vehicleNumber.toUpperCase(),
      status: 'Active'
    });

    if (existingParking) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is already parked in another slot'
      });
    }

    // 4. Create parking record
    const parking = new Parking({
      vehicleNumber: vehicleNumber.toUpperCase(),
      ownerName,
      phone,
      slotId: slot.slotId,
      slotType: slot.type,
      slotCategory: slot.category,
      entryTime: new Date(),
      expectedHours: Number(expectedHours),
      pricePerHour: slot.pricePerHour,
      userId: userId || null,
      status: 'Active'
    });
    
    await parking.save();
    console.log('✅ Parking saved to MongoDB:', parking._id);

    // 5. Update slot
    slot.status = 'Occupied';
    slot.currentVehicle = {
      vehicleNumber: vehicleNumber.toUpperCase(),
      ownerName,
      phone,
      entryTime: new Date(),
      expectedHours: Number(expectedHours),
      userId: userId || null
    };
    await slot.save();
    console.log('✅ Slot updated:', slot.slotId);

    // 6. Update or create vehicle record
    let vehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (!vehicle) {
      vehicle = new Vehicle({
        vehicleNumber: vehicleNumber.toUpperCase(),
        ownerName,
        phone,
        vehicleType: vehicleType || slot.type,
        parkingHistory: [{
          parkingId: parking._id,
          slotId: slot.slotId,
          entryTime: new Date()
        }]
      });
    } else {
      vehicle.parkingHistory.push({
        parkingId: parking._id,
        slotId: slot.slotId,
        entryTime: new Date()
      });
      vehicle.totalParkings = (vehicle.totalParkings || 0) + 1;
    }
    await vehicle.save();
    console.log('✅ Vehicle saved:', vehicle.vehicleNumber);

    // 7. Update user if logged in
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { parkingHistory: parking._id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vehicle parked successfully',
      data: {
        parking,
        slot,
        vehicle
      }
    });

  } catch (error) {
    console.error('❌ Park vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Exit vehicle
// @route   POST /api/parking/exit
exports.exitVehicle = async (req, res) => {
  try {
    console.log('📥 Exit request received:', req.body);
    
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide slot ID'
      });
    }

    const slot = await ParkingSlot.findOne({ 
      slotId: slotId.toUpperCase(), 
      status: 'Occupied' 
    });

    if (!slot || !slot.currentVehicle) {
      return res.status(404).json({
        success: false,
        message: 'No vehicle found in this slot'
      });
    }

    const parking = await Parking.findOne({
      slotId: slotId.toUpperCase(),
      status: 'Active'
    });

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: 'Active parking record not found'
      });
    }

    const exitTime = new Date();
    const entryTime = new Date(parking.entryTime);
    const diffMs = exitTime - entryTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.max(1, Math.ceil(diffMins / 60));
    const exactHours = Math.floor(diffMins / 60);
    const exactMinutes = diffMins % 60;

    const subtotal = hours * parking.pricePerHour;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    parking.exitTime = exitTime;
    parking.actualHours = hours;
    parking.exactHours = exactHours;
    parking.exactMinutes = exactMinutes;
    parking.subtotal = subtotal;
    parking.tax = tax;
    parking.totalAmount = total;
    parking.status = 'Completed';
    await parking.save();
    console.log('✅ Parking completed:', parking._id);

    const payment = new Payment({
      paymentId: 'PAY' + Date.now() + Math.floor(Math.random() * 1000),
      vehicleNumber: parking.vehicleNumber,
      ownerName: parking.ownerName,
      phone: parking.phone,
      slotNumber: slot.slotId,
      vehicleType: slot.type,
      entryTime: parking.entryTime,
      exitTime: exitTime,
      hours: hours,
      exactHours: exactHours,
      exactMinutes: exactMinutes,
      pricePerHour: parking.pricePerHour,
      amount: subtotal,
      tax: tax,
      totalAmount: total,
      status: 'pending',
      parkingId: parking._id,
      userId: parking.userId
    });
    
    await payment.save();
    console.log('✅ Payment created:', payment.paymentId);

    slot.status = 'Available';
    slot.totalParkings = (slot.totalParkings || 0) + 1;
    slot.totalRevenue = (slot.totalRevenue || 0) + total;
    slot.lastOccupied = new Date();
    slot.currentVehicle = null;
    await slot.save();
    console.log('✅ Slot updated:', slot.slotId);

    const vehicle = await Vehicle.findOne({ vehicleNumber: parking.vehicleNumber });
    if (vehicle) {
      const lastParking = vehicle.parkingHistory[vehicle.parkingHistory.length - 1];
      if (lastParking) {
        lastParking.exitTime = exitTime;
        lastParking.amount = total;
      }
      vehicle.totalSpent = (vehicle.totalSpent || 0) + total;
      vehicle.currentStatus = 'Outside';
      vehicle.currentSlot = null;
      await vehicle.save();
    }

    if (parking.userId) {
      await User.findByIdAndUpdate(parking.userId, {
        $inc: { totalSpent: total, totalVisits: 1 },
        $push: { paymentHistory: payment._id }
      });
    }

    res.json({
      success: true,
      message: 'Vehicle exited successfully',
      data: {
        parking,
        payment,
        slot
      }
    });

  } catch (error) {
    console.error('❌ Exit vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get parking history
// @route   GET /api/parking/history
exports.getParkingHistory = async (req, res) => {
  try {
    const { phone, vehicleNumber, startDate, endDate, status, limit = 100 } = req.query;
    
    let query = {};
    
    if (phone) query.phone = phone;
    if (vehicleNumber) query.vehicleNumber = vehicleNumber.toUpperCase();
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.entryTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const history = await Parking.find(query)
      .sort({ entryTime: -1 })
      .populate('paymentId')
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: history.length,
      history
    });

  } catch (error) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update slot price
// @route   PUT /api/parking/slot/:slotId/price
exports.updateSlotPrice = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { pricePerHour } = req.body;

    const slot = await ParkingSlot.findOneAndUpdate(
      { slotId: slotId.toUpperCase() },
      { 
        pricePerHour: Number(pricePerHour),
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    res.json({
      success: true,
      message: 'Price updated successfully',
      slot
    });

  } catch (error) {
    console.error('❌ Update price error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get parking stats
// @route   GET /api/parking/stats
exports.getParkingStats = async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ status: 'Available' });
    const occupiedSlots = await ParkingSlot.countDocuments({ status: 'Occupied' });
    const activeParkings = await Parking.countDocuments({ status: 'Active' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayParkings = await Parking.countDocuments({
      entryTime: { $gte: today }
    });

    const totalRevenue = await Parking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalParkingRevenue = totalRevenue[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalSlots,
        availableSlots,
        occupiedSlots,
        activeParkings,
        todayParkings,
        totalRevenue: totalParkingRevenue,
        utilizationRate: totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0
      }
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get active parkings
// @route   GET /api/parking/active
exports.getActiveParkings = async (req, res) => {
  try {
    const parkings = await Parking.find({ status: 'Active' })
      .sort({ entryTime: -1 });

    res.json({
      success: true,
      count: parkings.length,
      parkings
    });

  } catch (error) {
    console.error('❌ Get active parkings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete slot (Admin only)
// @route   DELETE /api/parking/slot/:slotId
exports.deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await ParkingSlot.findOneAndDelete({ slotId: slotId.toUpperCase() });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    res.json({
      success: true,
      message: 'Slot deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get vehicle details by number
// @route   GET /api/parking/vehicle/:vehicleNumber
exports.getVehicleDetails = async (req, res) => {
  try {
    const { vehicleNumber } = req.params;

    const vehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() })
      .populate('parkingHistory.parkingId');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      vehicle
    });

  } catch (error) {
    console.error('❌ Get vehicle details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};