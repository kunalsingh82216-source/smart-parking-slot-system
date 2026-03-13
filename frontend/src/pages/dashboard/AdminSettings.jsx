import React, { useState, useEffect } from "react";
import { 
  FaCog,
  FaSave,
  FaTimes,
  FaDollarSign,
  FaClock,
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
  FaQrcode,
  FaBell,
  FaEnvelope,
  FaMobileAlt,
  FaShieldAlt,
  FaLock,
  FaUnlock,
  FaDatabase,
  FaCloudUploadAlt,
  FaHistory,
  FaUndo,
  FaRedo,
  FaDownload,
  FaUpload,
  FaTrash,
  FaEdit,
  FaPlus,
  FaMinus,
  FaToggleOn,
  FaToggleOff,
  FaMoon,
  FaSun,
  FaLanguage,
  FaGlobe,
  FaCalendarAlt,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaUserCog,
  FaUserShield,
  FaKey,
  FaPlug,
  FaWifi,
  FaBluetooth,
  FaPrint,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaSlidersH,
  FaTools,
  FaWrench,
  FaServer,
  FaNetworkWired,
  FaPalette,
  FaFont,
  FaImage,
  FaVideo,
  FaMusic,
  FaHeadphones,
  FaMicrophone,
  FaCamera,
  FaVideoCamera
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "Smart Parking System",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    language: "English",
    currency: "INR",
    weekStart: "Monday",
    businessHours: {
      start: "08:00",
      end: "22:00"
    }
  });

  // Parking Rates
  const [parkingRates, setParkingRates] = useState({
    car: {
      hourly: 50,
      daily: 300,
      weekly: 1800,
      monthly: 5000,
      vip: 100
    },
    bike: {
      hourly: 20,
      daily: 100,
      weekly: 500,
      monthly: 1500,
      vip: 40
    },
    truck: {
      hourly: 100,
      daily: 600,
      weekly: 3500,
      monthly: 10000,
      vip: 200
    },
    ev: {
      hourly: 30,
      daily: 150,
      weekly: 800,
      monthly: 2500,
      chargingRate: 20
    },
    disabled: {
      hourly: 25,
      daily: 120,
      weekly: 600,
      monthly: 1800
    },
    tax: {
      gst: 18,
      serviceTax: 5
    },
    discounts: {
      seniorCitizen: 10,
      student: 15,
      member: 20
    }
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    methods: {
      cash: true,
      card: true,
      upi: true,
      wallet: true,
      qrCode: true
    },
    upi: {
      id: "parking@okhdfcbank",
      qrEnabled: true
    },
    card: {
      visa: true,
      mastercard: true,
      amex: true,
      rupay: true
    },
    wallet: {
      paytm: true,
      phonepe: true,
      googlepay: true,
      amazonpay: true
    },
    refund: {
      policy: "24h",
      autoRefund: true
    }
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: true,
      payment: true,
      entry: true,
      exit: true,
      reminder: true,
      promo: false
    },
    sms: {
      enabled: true,
      payment: true,
      entry: true,
      exit: true,
      otp: true
    },
    push: {
      enabled: false,
      payment: true,
      entry: false,
      exit: false
    },
    inApp: {
      enabled: true,
      payment: true,
      entry: true,
      exit: true
    }
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSpecialChars: true,
      requireUppercase: true,
      expiryDays: 90
    },
    ipWhitelist: [],
    backupCodes: [],
    auditLog: true
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    backupSchedule: "daily",
    retentionPeriod: 30, // days
    maxSlots: 1000,
    maxUsers: 10000,
    apiRateLimit: 100, // requests per minute
    environment: "production"
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "dark",
    primaryColor: "#0f172a",
    accentColor: "#059669",
    fontFamily: "Inter",
    fontSize: "medium",
    borderRadius: "medium",
    animations: true,
    compactMode: false,
    showSidebarIcons: true
  });

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setGeneralSettings(parsed.general || generalSettings);
      setParkingRates(parsed.parkingRates || parkingRates);
      setPaymentSettings(parsed.payment || paymentSettings);
      setNotificationSettings(parsed.notifications || notificationSettings);
      setSecuritySettings(parsed.security || securitySettings);
      setSystemSettings(parsed.system || systemSettings);
      setAppearanceSettings(parsed.appearance || appearanceSettings);
    }
  }, []);

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(true);
  }, [generalSettings, parkingRates, paymentSettings, notificationSettings, securitySettings, systemSettings, appearanceSettings]);

  const handleSave = () => {
    const allSettings = {
      general: generalSettings,
      parkingRates,
      payment: paymentSettings,
      notifications: notificationSettings,
      security: securitySettings,
      system: systemSettings,
      appearance: appearanceSettings
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(allSettings));
    setUnsavedChanges(false);
    setShowConfirmModal(false);
  };

  const handleReset = () => {
    // Reset to defaults
    setGeneralSettings({
      systemName: "Smart Parking System",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      language: "English",
      currency: "INR",
      weekStart: "Monday",
      businessHours: { start: "08:00", end: "22:00" }
    });
    // Reset other settings to defaults...
    setShowResetModal(false);
  };

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

  const tabs = [
    { id: 'general', label: 'General', icon: <FaCog /> },
    { id: 'parking', label: 'Parking Rates', icon: <FaCar /> },
    { id: 'payment', label: 'Payment', icon: <FaCreditCard /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
    { id: 'system', label: 'System', icon: <FaServer /> },
    { id: 'appearance', label: 'Appearance', icon: <FaPalette /> }
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
                <FaCog className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">System Settings</h1>
                <p className="text-gray-300 text-sm mt-1">Configure and manage system preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {unsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-yellow-300 text-sm">Unsaved changes</span>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white hover:bg-white/20 transition-all flex items-center"
                  >
                    <FaUndo className="mr-2" />
                    Reset
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-all flex items-center"
                  >
                    <FaSave className="mr-2" />
                    Save All
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-2 mb-6 border border-gray-200 overflow-x-auto"
        >
          <div className="flex space-x-2 min-w-max">
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
          </div>
        </motion.div>

        {/* Settings Panels */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">General Settings</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                  <input
                    type="text"
                    value={generalSettings.systemName}
                    onChange={(e) => setGeneralSettings({...generalSettings, systemName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>Asia/Kolkata</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Dubai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                  <select
                    value={generalSettings.timeFormat}
                    onChange={(e) => setGeneralSettings({...generalSettings, timeFormat: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  >
                    <option>24h</option>
                    <option>12h</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  >
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Hours</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                    <input
                      type="time"
                      value={generalSettings.businessHours.start}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings, 
                        businessHours: {...generalSettings.businessHours, start: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                    <input
                      type="time"
                      value={generalSettings.businessHours.end}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings, 
                        businessHours: {...generalSettings.businessHours, end: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parking Rates */}
          {activeTab === 'parking' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Parking Rates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Car Rates */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FaCar className="text-2xl" style={{ color: colors.accent.blue }} />
                    <h3 className="font-semibold text-gray-800">Car Rates</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Hourly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.car.hourly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          car: {...parkingRates.car, hourly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Daily (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.car.daily}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          car: {...parkingRates.car, daily: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Weekly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.car.weekly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          car: {...parkingRates.car, weekly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Monthly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.car.monthly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          car: {...parkingRates.car, monthly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">VIP Rate (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.car.vip}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          car: {...parkingRates.car, vip: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Bike Rates */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FaMotorcycle className="text-2xl" style={{ color: colors.accent.purple }} />
                    <h3 className="font-semibold text-gray-800">Bike Rates</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Hourly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.bike.hourly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          bike: {...parkingRates.bike, hourly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Daily (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.bike.daily}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          bike: {...parkingRates.bike, daily: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Weekly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.bike.weekly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          bike: {...parkingRates.bike, weekly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Monthly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.bike.monthly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          bike: {...parkingRates.bike, monthly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">VIP Rate (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.bike.vip}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          bike: {...parkingRates.bike, vip: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Truck Rates */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FaTruck className="text-2xl" style={{ color: colors.accent.orange }} />
                    <h3 className="font-semibold text-gray-800">Truck Rates</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Hourly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.truck.hourly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          truck: {...parkingRates.truck, hourly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Daily (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.truck.daily}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          truck: {...parkingRates.truck, daily: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Weekly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.truck.weekly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          truck: {...parkingRates.truck, weekly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Monthly (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.truck.monthly}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          truck: {...parkingRates.truck, monthly: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">VIP Rate (₹)</label>
                      <input
                        type="number"
                        value={parkingRates.truck.vip}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          truck: {...parkingRates.truck, vip: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax & Discounts */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Tax Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">GST (%)</label>
                      <input
                        type="number"
                        value={parkingRates.tax.gst}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          tax: {...parkingRates.tax, gst: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Service Tax (%)</label>
                      <input
                        type="number"
                        value={parkingRates.tax.serviceTax}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          tax: {...parkingRates.tax, serviceTax: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Discounts</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Senior Citizen (%)</label>
                      <input
                        type="number"
                        value={parkingRates.discounts.seniorCitizen}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          discounts: {...parkingRates.discounts, seniorCitizen: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Student (%)</label>
                      <input
                        type="number"
                        value={parkingRates.discounts.student}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          discounts: {...parkingRates.discounts, student: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Member (%)</label>
                      <input
                        type="number"
                        value={parkingRates.discounts.member}
                        onChange={(e) => setParkingRates({
                          ...parkingRates,
                          discounts: {...parkingRates.discounts, member: Number(e.target.value)}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Settings</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    {Object.entries(paymentSettings.methods).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{key}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={value}
                            onChange={() => setPaymentSettings({
                              ...paymentSettings,
                              methods: {...paymentSettings.methods, [key]: !value}
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">UPI Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">UPI ID</label>
                      <input
                        type="text"
                        value={paymentSettings.upi.id}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          upi: {...paymentSettings.upi, id: e.target.value}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Enable QR Code</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={paymentSettings.upi.qrEnabled}
                          onChange={() => setPaymentSettings({
                            ...paymentSettings,
                            upi: {...paymentSettings.upi, qrEnabled: !paymentSettings.upi.qrEnabled}
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings - Maintenance Mode */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">System Settings</h2>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Maintenance Mode</h3>
                    <p className="text-sm text-gray-500">Put the system into maintenance mode</p>
                  </div>
                  <button
                    onClick={() => setSystemSettings({...systemSettings, maintenanceMode: !systemSettings.maintenanceMode})}
                    className={`px-6 py-3 rounded-xl font-semibold text-white transition-all flex items-center ${
                      systemSettings.maintenanceMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {systemSettings.maintenanceMode ? (
                      <>
                        <FaToggleOn className="mr-2" />
                        ON
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="mr-2" />
                        OFF
                      </>
                    )}
                  </button>
                </div>
                
                {systemSettings.maintenanceMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Maintenance mode is ON. Users cannot access the system until you turn it off.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">System Configuration</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Debug Mode</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={systemSettings.debugMode}
                          onChange={() => setSystemSettings({...systemSettings, debugMode: !systemSettings.debugMode})}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Cache Enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={systemSettings.cacheEnabled}
                          onChange={() => setSystemSettings({...systemSettings, cacheEnabled: !systemSettings.cacheEnabled})}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Backup Schedule</label>
                      <select
                        value={systemSettings.backupSchedule}
                        onChange={(e) => setSystemSettings({...systemSettings, backupSchedule: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      >
                        <option>hourly</option>
                        <option>daily</option>
                        <option>weekly</option>
                        <option>monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Environment</label>
                      <select
                        value={systemSettings.environment}
                        onChange={(e) => setSystemSettings({...systemSettings, environment: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      >
                        <option>development</option>
                        <option>staging</option>
                        <option>production</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Limits & Thresholds</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Max Slots</label>
                      <input
                        type="number"
                        value={systemSettings.maxSlots}
                        onChange={(e) => setSystemSettings({...systemSettings, maxSlots: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Max Users</label>
                      <input
                        type="number"
                        value={systemSettings.maxUsers}
                        onChange={(e) => setSystemSettings({...systemSettings, maxUsers: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">API Rate Limit (per minute)</label>
                      <input
                        type="number"
                        value={systemSettings.apiRateLimit}
                        onChange={(e) => setSystemSettings({...systemSettings, apiRateLimit: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Data Retention (days)</label>
                      <input
                        type="number"
                        value={systemSettings.retentionPeriod}
                        onChange={(e) => setSystemSettings({...systemSettings, retentionPeriod: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add other tabs similarly... */}
          
        </motion.div>
      </div>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Save Settings?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to save all changes? This will update the system configuration.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-3xl text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Reset Settings?</h3>
                <p className="text-gray-600 mb-6">
                  This will reset all settings to their default values. This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSettings;