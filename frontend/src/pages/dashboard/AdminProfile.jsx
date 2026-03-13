import React, { useState, useEffect, useRef } from "react";
import { 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone,
  FaEdit,
  FaCamera,
  FaSave,
  FaTimes,
  FaKey,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
  FaUserTie,
  FaCheckCircle,
  FaExclamationTriangle,
  FaIdCard,
  FaGlobe,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaMoon,
  FaSun,
  FaBell,
  FaShieldAlt,
  FaHistory,
  FaFileAlt,
  FaCreditCard,
  FaDownload,
  FaPrint,
  FaArrowLeft,
  FaArrowRight,
  FaLock,
  FaUnlock
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: "Admin Name",
    email: "admin@parking.com",
    phone: "+91 9876543210",
    designation: "Parking System Administrator",
    department: "Operations",
    employeeId: "EMP001",
    joinDate: "2024-01-15",
    location: "Mumbai, India",
    bio: "Experienced parking system administrator with 5+ years of expertise in managing smart parking solutions and customer service.",
    website: "www.parkingsystem.com",
    twitter: "@admin",
    linkedin: "linkedin.com/in/admin",
    github: "github.com/admin",
    notifications: true,
    twoFactorAuth: false,
    language: "English",
    timezone: "IST (UTC+5:30)",
    lastLogin: new Date().toLocaleString(),
    totalLogins: 156,
    accountStatus: "Active",
    role: "Super Admin"
  });

  // Form state for editing
  const [editForm, setEditForm] = useState({ ...profileData });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Modern color palette
  const colors = {
    primary: {
      from: '#0f172a',
      to: '#1e293b',
      light: '#f8fafc',
      dark: '#020617'
    },
    accent: {
      green: '#059669',
      blue: '#2563eb',
      purple: '#7c3aed',
      orange: '#ea580c',
      red: '#dc2626',
      yellow: '#d97706',
      teal: '#0d9488',
      pink: '#db2777'
    },
    neutral: {
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit save
  const handleSave = () => {
    setProfileData(editForm);
    setIsEditing(false);
    // Here you would also save to localStorage/backend
    localStorage.setItem('adminProfile', JSON.stringify(editForm));
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditForm({ ...profileData });
    setIsEditing(false);
    setImagePreview(null);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Here you would update password
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    // Here you would delete account
    setShowDeleteConfirm(false);
    // Redirect to login
  };

  // Load saved profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('adminProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData(parsed);
      setEditForm(parsed);
    }
  }, []);

  // Tabs configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUserCircle /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
    { id: 'activity', label: 'Activity', icon: <FaHistory /> },
    { id: 'preferences', label: 'Preferences', icon: <FaBell /> }
  ];

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)` }}>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10"
        style={{ background: `linear-gradient(to right, ${colors.primary.from}, ${colors.primary.to})` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <FaUserTie className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Profile</h1>
                <p className="text-gray-300 text-sm mt-1">Manage your account settings and preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.print()}
                className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white hover:bg-white/20 transition-all flex items-center"
              >
                <FaPrint className="mr-2" />
                Print
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white hover:bg-white/20 transition-all flex items-center"
              >
                <FaDownload className="mr-2" />
                Export
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-2 mb-6 border border-gray-200 inline-flex"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={activeTab === tab.id ? { background: colors.primary.from } : {}}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 sticky top-24">
              
              {/* Profile Header */}
              <div className="h-32" style={{ background: `linear-gradient(to right, ${colors.primary.from}, ${colors.primary.to})` }} />
              
              {/* Profile Image */}
              <div className="relative px-6 pb-6">
                <div className="flex justify-center -mt-16">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl">
                      {imagePreview || profileImage ? (
                        <img 
                          src={imagePreview || profileImage} 
                          alt={profileData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                          {profileData.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Camera icon for upload */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-all shadow-lg"
                    >
                      <FaCamera className="text-sm" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="text-center mt-4">
                  <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                  <p className="text-gray-500 text-sm">{profileData.designation}</p>
                  
                  {/* Status badge */}
                  <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      background: `${colors.accent.green}20`,
                      color: colors.accent.green 
                    }}
                  >
                    <FaCheckCircle className="mr-1" />
                    {profileData.accountStatus}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{profileData.totalLogins}</p>
                    <p className="text-xs text-gray-500">Logins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">156</p>
                    <p className="text-xs text-gray-500">Actions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">98%</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <FaEnvelope className="text-gray-500" />
                    <span className="text-sm text-gray-700">{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <FaPhone className="text-gray-500" />
                    <span className="text-sm text-gray-700">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <FaMapMarkerAlt className="text-gray-500" />
                    <span className="text-sm text-gray-700">{profileData.location}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(to right, ${colors.accent.blue}, ${colors.accent.purple})` }}
                  >
                    <FaEdit className="mr-2" />
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
                  >
                    <FaKey className="mr-2" />
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Detailed Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {activeTab === 'profile' && (
              <>
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUserCircle className="mr-2" style={{ color: colors.accent.blue }} />
                    Personal Information
                  </h3>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                          <input
                            type="text"
                            value={editForm.designation}
                            onChange={(e) => setEditForm({...editForm, designation: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          rows="3"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSave}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center"
                        >
                          <FaSave className="mr-2" />
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center"
                        >
                          <FaTimes className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-800">{profileData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Designation</p>
                        <p className="font-medium text-gray-800">{profileData.designation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{profileData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800">{profileData.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Bio</p>
                        <p className="font-medium text-gray-800">{profileData.bio}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Work Information */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaBuilding className="mr-2" style={{ color: colors.accent.purple }} />
                    Work Information
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Employee ID</p>
                      <p className="font-medium text-gray-800">{profileData.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-800">{profileData.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Join Date</p>
                      <p className="font-medium text-gray-800">{new Date(profileData.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-800">{profileData.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium text-gray-800">{profileData.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium text-gray-800">{new Date(profileData.lastLogin).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaGlobe className="mr-2" style={{ color: colors.accent.orange }} />
                    Social Links
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <FaGlobe className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <p className="font-medium text-gray-800">{profileData.website}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaTwitter className="text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-500">Twitter</p>
                        <p className="font-medium text-gray-800">{profileData.twitter}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaLinkedin className="text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">LinkedIn</p>
                        <p className="font-medium text-gray-800">{profileData.linkedin}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaGithub className="text-gray-800" />
                      <div>
                        <p className="text-sm text-gray-500">GitHub</p>
                        <p className="font-medium text-gray-800">{profileData.github}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                {/* Security Settings */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaShieldAlt className="mr-2" style={{ color: colors.accent.blue }} />
                    Security Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={profileData.twoFactorAuth}
                          onChange={() => setProfileData({...profileData, twoFactorAuth: !profileData.twoFactorAuth})}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">Login Alerts</p>
                        <p className="text-sm text-gray-500">Get notified on new login attempts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center"
                    >
                      <FaKey className="mr-2" />
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Recent Devices */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Devices</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FaShieldAlt className="text-green-600" />
                        <div>
                          <p className="font-medium text-gray-800">Windows PC - Chrome</p>
                          <p className="text-xs text-gray-500">Mumbai, India · Current device</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Active Now</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FaShieldAlt className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">iPhone 13 - Safari</p>
                          <p className="text-xs text-gray-500">Mumbai, India · 2 days ago</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">Last seen 2d ago</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'activity' && (
              <>
                {/* Activity Log */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaHistory className="mr-2" style={{ color: colors.accent.purple }} />
                    Recent Activity
                  </h3>

                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((_, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaHistory className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">Profile Updated</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                        <span className="text-xs text-gray-400">IP: 192.168.1.1</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Login History */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Login History</h3>
                  
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-xs text-gray-500">Date</th>
                        <th className="p-3 text-left text-xs text-gray-500">Time</th>
                        <th className="p-3 text-left text-xs text-gray-500">Device</th>
                        <th className="p-3 text-left text-xs text-gray-500">Location</th>
                        <th className="p-3 text-left text-xs text-gray-500">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map((_, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3 text-sm">2024-02-20</td>
                          <td className="p-3 text-sm">10:30 AM</td>
                          <td className="p-3 text-sm">Windows PC</td>
                          <td className="p-3 text-sm">Mumbai, India</td>
                          <td className="p-3 text-sm">192.168.1.1</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'preferences' && (
              <>
                {/* Preferences */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaBell className="mr-2" style={{ color: colors.accent.orange }} />
                    Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Get alerts on your phone</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">Push Notifications</p>
                        <p className="text-sm text-gray-500">Browser notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Language & Region */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Language & Region</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select 
                        value={profileData.language}
                        onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                      >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select 
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                      >
                        <option>IST (UTC+5:30)</option>
                        <option>EST (UTC-5)</option>
                        <option>PST (UTC-8)</option>
                        <option>GMT (UTC+0)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Delete Account */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                Danger Zone
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-3xl text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Account?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProfile;