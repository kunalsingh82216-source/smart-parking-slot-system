const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  getMe, 
  updateProfile, 
  adminLogin,
  getAllUsers,
  getUserById,
  deleteUser,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { protect, admin, manager } = require('../middlewares/auth');

// ============ PUBLIC ROUTES ============
router.post('/signup', signup);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ============ PROTECTED ROUTES (All authenticated users) ============
 router.use(protect);  //👈 All routes below this require authentication

// User profile routes
router.get('/me', getMe);
router.put('/update', updateProfile);
router.post('/change-password', changePassword);
router.post('/logout', logout);

// ============ ADMIN ONLY ROUTES ============
router.get('/users', admin, getAllUsers);
router.get('/users/:id', admin, getUserById);
router.delete('/users/:id', admin, deleteUser);

// ============ MANAGER & ADMIN ROUTES ============
router.get('/dashboard/stats', manager, (req, res) => {
  // This will be implemented in dashboard controller
  res.json({ success: true, message: 'Dashboard stats' });
});

module.exports = router;