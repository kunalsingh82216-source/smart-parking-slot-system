const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
return jwt.sign({ id }, process.env.JWT_SECRET, {
expiresIn: process.env.JWT_EXPIRE || '7d'
});
};

// ============ AUTH FUNCTIONS ============

// @desc    Register user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
try {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ success: false, errors: errors.array() });
}

const { name, email, phone, password, vehicleNumber, role } = req.body;  

// Required fields check  
if (!name || !email || !phone || !password || !vehicleNumber) {  
  return res.status(400).json({  
    success: false,  
    message: "All fields are required"  
  });  
}  

// Phone validation  
if (phone.length !== 10) {  
  return res.status(400).json({  
    success: false,  
    message: "Phone must be exactly 10 digits"  
  });  
}  

// Check duplicate email  
const userExists = await User.findOne({ email });  
if (userExists) {  
  return res.status(400).json({  
    success: false,  
    message: 'Email already registered'  
  });  
}  

// Check duplicate phone  
const phoneExists = await User.findOne({ phone });  
if (phoneExists) {  
  return res.status(400).json({  
    success: false,  
    message: 'Phone already registered'  
  });  
}  

// Create user (password will be hashed by model pre-save hook)  
const user = await User.create({  
  name,  
  email,  
  phone,  
  password, // Don't hash here, let model do it  
  vehicleNumber,  
  role: role || 'customer'  
});  

console.log("✅ New User Created:", user.email);  

const token = generateToken(user._id);  

res.status(201).json({  
  success: true,  
  message: 'User registered successfully',  
  token,  
  user: {  
    id: user._id,  
    name: user.name,  
    email: user.email,  
    phone: user.phone,  
    role: user.role,  
    vehicleNumber: user.vehicleNumber  
  }  
});

} catch (error) {
console.error("❌ Signup Error:", error);
res.status(500).json({
success: false,
message: 'Server error',
error: error.message
});
}
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
try {
const { email, password } = req.body;

if (!email || !password) {  
  return res.status(400).json({  
    success: false,  
    message: 'Please provide email and password'  
  });  
}  

const user = await User.findOne({ email }).select('+password');  
  
if (!user) {  
  return res.status(401).json({  
    success: false,  
    message: 'Invalid credentials'  
  });  
}  

// Check if account is active  
if (user.status === 'Inactive' || user.status === 'Suspended') {  
  return res.status(403).json({  
    success: false,  
    message: `Account is ${user.status}. Please contact admin.`  
  });  
}  

// Compare password using model method  
const isMatch = await user.comparePassword(password);  
if (!isMatch) {  
  return res.status(401).json({  
    success: false,  
    message: 'Invalid credentials'  
  });  
}  

// Update last login  
user.lastLogin = Date.now();  
await user.save({ validateBeforeSave: false });  

const token = generateToken(user._id);  

res.status(200).json({  
  success: true,  
  message: 'Login successful',  
  token,  
  user: {  
    id: user._id,  
    name: user.name,  
    email: user.email,  
    phone: user.phone,  
    role: user.role,  
    vehicleNumber: user.vehicleNumber  
  }  
});

} catch (error) {
console.error("❌ Login Error:", error);
res.status(500).json({
success: false,
message: 'Server error',
error: error.message
});
}
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
exports.adminLogin = async (req, res) => {
try {
const { email, password } = req.body;

const user = await User.findOne({ email }).select('+password');  

if (!user) {  
  return res.status(401).json({  
    success: false,  
    message: 'Invalid credentials'  
  });  
}  

// Check if user has admin or manager role  
if (user.role !== 'admin' && user.role !== 'manager') {  
  return res.status(403).json({  
    success: false,  
    message: 'Not authorized as admin/manager'  
  });  
}  

const isMatch = await user.comparePassword(password);  
if (!isMatch) {  
  return res.status(401).json({  
    success: false,  
    message: 'Invalid credentials'  
  });  
}  

user.lastLogin = Date.now();  
await user.save({ validateBeforeSave: false });  

const token = generateToken(user._id);  

res.json({  
  success: true,  
  message: 'Admin login successful',  
  token,  
  user: {  
    id: user._id,  
    name: user.name,  
    email: user.email,  
    phone: user.phone,  
    role: user.role  
  }  
});

} catch (error) {
console.error("❌ Admin Login Error:", error);
res.status(500).json({
success: false,
message: 'Server error',
error: error.message
});
}
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
try {
const user = await User.findById(req.user._id)
.select('-password')
.populate('parkingHistory')
.populate('paymentHistory');

res.status(200).json({  
  success: true,  
  user  
});

} catch (error) {
console.error("❌ GetMe Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};

// @desc    Update user profile
// @route   PUT /api/auth/update
exports.updateProfile = async (req, res) => {
try {
const { name, phone, vehicleNumber } = req.body;

// Optional phone validation  
if (phone && phone.length !== 10) {  
  return res.status(400).json({  
    success: false,  
    message: "Phone must be exactly 10 digits"  
  });  
}  

const user = await User.findByIdAndUpdate(  
  req.user._id,  
  {   
    name,   
    phone,   
    vehicleNumber,  
    updatedAt: Date.now()  
  },  
  { new: true, runValidators: true }  
).select('-password');  

res.status(200).json({  
  success: true,  
  message: 'Profile updated successfully',  
  user  
});

} catch (error) {
console.error("❌ Update Profile Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};

// @desc    Change password
// @route   POST /api/auth/change-password
exports.changePassword = async (req, res) => {
try {
const { currentPassword, newPassword } = req.body;

const user = await User.findById(req.user._id).select('+password');  

if (!user) {  
  return res.status(404).json({  
    success: false,  
    message: 'User not found'  
  });  
}  

// Check current password  
const isMatch = await user.comparePassword(currentPassword);  
if (!isMatch) {  
  return res.status(401).json({  
    success: false,  
    message: 'Current password is incorrect'  
  });  
}  

// Update password  
user.password = newPassword;  
await user.save();  

res.json({  
  success: true,  
  message: 'Password changed successfully'  
});

} catch (error) {
console.error("❌ Change Password Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
try {
const { email } = req.body;

const user = await User.findOne({ email });  

if (!user) {  
  return res.status(404).json({  
    success: false,  
    message: 'User not found with this email'  
  });  
}  

// Generate reset token  
const resetToken = crypto.randomBytes(20).toString('hex');  
user.resetPasswordToken = resetToken;  
user.resetPasswordExpire = Date.now() + 3600000; // 1 hour  

await user.save();  

// In production, send email here  
// For development, return token  
res.json({  
  success: true,  
  message: 'Password reset email sent',  
  resetToken // Remove in production  
});

} catch (error) {
console.error("❌ Forgot Password Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
try {
const { token } = req.params;
const { password } = req.body;

const user = await User.findOne({  
  resetPasswordToken: token,  
  resetPasswordExpire: { $gt: Date.now() }  
});  

if (!user) {  
  return res.status(400).json({  
    success: false,  
    message: 'Invalid or expired token'  
  });  
}  

// Update password  
user.password = password;  
user.resetPasswordToken = undefined;  
user.resetPasswordExpire = undefined;  
await user.save();  

res.json({  
  success: true,  
  message: 'Password reset successful'  
});

} catch (error) {
console.error("❌ Reset Password Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
try {
// In token-based auth, client just removes token
res.json({
success: true,
message: 'Logged out successfully'
});
} catch (error) {
console.error("❌ Logout Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};

// ============ ADMIN FUNCTIONS ============

// @desc    Get all users
// @route   GET /api/auth/users
exports.getAllUsers = async (req, res) => {
try {
const users = await User.find({})
.select('-password')
.sort({ createdAt: -1 });

res.json({  
  success: true,  
  count: users.length,  
  users  
});

} catch (error) {
console.error("❌ Get All Users Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
exports.getUserById = async (req, res) => {
try {
const user = await User.findById(req.params.id)
.select('-password')
.populate('parkingHistory')
.populate('paymentHistory');

if (!user) {  
  return res.status(404).json({  
    success: false,  
    message: 'User not found'  
  });  
}  

res.json({  
  success: true,  
  user  
});

} catch (error) {
console.error("❌ Get User By ID Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
exports.deleteUser = async (req, res) => {
try {
const user = await User.findById(req.params.id);

if (!user) {  
  return res.status(404).json({  
    success: false,  
    message: 'User not found'  
  });  
}  

await user.deleteOne();  

res.json({  
  success: true,  
  message: 'User deleted successfully'  
});

} catch (error) {
console.error("❌ Delete User Error:", error);
res.status(500).json({
success: false,
message: 'Server error'
});
}
};