
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ---------------- ADMIN STATS ----------------
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSlots = 100; // temporary static
    const totalRevenue = 50000; // temporary static
    const occupancyRate = 65; // temporary static %

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRevenue,
        totalSlots,
        occupancyRate
      }
    });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- RECENT USERS ----------------
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error("Admin Users Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- RECENT PAYMENTS (DUMMY) ----------------
router.get('/payments', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [
        {
          _id: "1",
          transactionId: "TXN12345",
          user: { name: "Rahul" },
          amount: 500,
          paymentMethod: "UPI",
          createdAt: new Date(),
          status: "success"
        }
      ]
    });

  } catch (error) {
    console.error("Admin Payments Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
