import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaParking,
  FaChartLine,
  FaSignOutAlt,
  FaPlus,
  FaList,
  FaUserCircle,
  FaMoneyBillWave,
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaCreditCard,
  FaWallet,
  FaQrcode,
  FaStar,
  FaRegClock,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaPrint,
  FaBell,
  FaCog,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaChartPie,
  FaChartBar,
  FaChartArea,
  FaBolt,
  FaWheelchair,
  FaIdCard
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChart, setSelectedChart] = useState('bar');
  const [dateRange, setDateRange] = useState('week');

  // Stats states
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalVehicles: 0,
    activeUsers: 0,
    avgOccupancy: 0,
    peakHours: '',
    customerSatisfaction: 4.8,
    pendingPayments: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    vipBookings: 0,
    regularBookings: 0,
    evBookings: 0
  });

  // Chart data states
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [vehicleTypeData, setVehicleTypeData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [slotUtilization, setSlotUtilization] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // User data
  const storedUser = localStorage.getItem("user");
  const user = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : { name: "Admin" };

  // ✅ FIXED: Modern color palette with neutral property
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
      pink: '#db2777',
      indigo: '#4f46e5'
    },
    chart: {
      revenue: ['#059669', '#10b981', '#34d399'],
      occupancy: ['#2563eb', '#3b82f6', '#60a5fa'],
      vehicles: ['#7c3aed', '#8b5cf6', '#a78bfa'],
      payment: ['#ea580c', '#f97316', '#fb923c']
    },
    // ✅ ADDED: neutral property for background gradients
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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load all data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      // Get data from localStorage
      const slots = JSON.parse(localStorage.getItem("parkingSlots")) || [];
      const revenueHistory = JSON.parse(localStorage.getItem("revenueHistory")) || [];
      const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments")) || [];
      const users = JSON.parse(localStorage.getItem("users")) || [];
      
      // Basic stats
      const totalSlots = slots.length;
      const availableSlots = slots.filter(s => s.status === "Available").length;
      const occupiedSlots = slots.filter(s => s.status === "Occupied").length;
      
      // Revenue calculations
      const totalRevenue = revenueHistory.reduce((sum, r) => sum + (r.amount || r.totalAmount || 0), 0);
      const today = new Date().toDateString();
      const todayRevenue = revenueHistory
        .filter(r => new Date(r.paidAt || r.exitTime).toDateString() === today)
        .reduce((sum, r) => sum + (r.amount || r.totalAmount || 0), 0);

      // Vehicle type distribution
      const cars = slots.filter(s => s.type === "Car").length;
      const bikes = slots.filter(s => s.type === "Bike").length;
      const trucks = slots.filter(s => s.type === "Truck").length;

      // Payment method distribution
      const cash = revenueHistory.filter(r => r.paymentMethod === 'cash').length;
      const card = revenueHistory.filter(r => r.paymentMethod === 'card').length;
      const upi = revenueHistory.filter(r => r.paymentMethod === 'upi').length;
      const wallet = revenueHistory.filter(r => r.paymentMethod === 'wallet').length;

      // Category distribution
      const vip = slots.filter(s => s.category === "VIP").length;
      const ev = slots.filter(s => s.category === "EV").length;
      const disabled = slots.filter(s => s.category === "Disabled").length;
      const regular = slots.filter(s => s.category === "Regular").length;

      // Set stats
      setStats({
        totalSlots,
        availableSlots,
        occupiedSlots,
        totalRevenue,
        todayRevenue,
        totalVehicles: revenueHistory.length,
        activeUsers: users.length || 156,
        avgOccupancy: totalSlots ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
        peakHours: '10 AM - 2 PM',
        customerSatisfaction: 4.8,
        pendingPayments: pendingPayments.filter(p => p.status === 'pending').length,
        completedBookings: revenueHistory.filter(r => r.status === 'completed').length,
        cancelledBookings: 12,
        vipBookings: revenueHistory.filter(r => r.category === 'VIP').length,
        regularBookings: revenueHistory.filter(r => r.category !== 'VIP').length,
        evBookings: revenueHistory.filter(r => r.category === 'EV').length
      });

      // Revenue chart data (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayRevenue = revenueHistory
          .filter(r => new Date(r.paidAt || r.exitTime).toDateString() === date.toDateString())
          .reduce((sum, r) => sum + (r.amount || r.totalAmount || 0), 0);
        
        last7Days.push({
          name: dateStr,
          revenue: dayRevenue,
          bookings: revenueHistory.filter(r => 
            new Date(r.paidAt || r.exitTime).toDateString() === date.toDateString()
          ).length
        });
      }
      setRevenueData(last7Days);

      // Occupancy trend (hourly for today)
      const hourly = [];
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + ':00';
        const count = slots.filter(s => {
          if (!s.vehicle?.entryTime) return false;
          const entryHour = new Date(s.vehicle.entryTime).getHours();
          return entryHour === i;
        }).length;
        hourly.push({ hour, occupancy: count });
      }
      setHourlyData(hourly);

      // Vehicle type distribution
      setVehicleTypeData([
        { name: 'Cars', value: cars, color: colors.accent.blue },
        { name: 'Bikes', value: bikes, color: colors.accent.purple },
        { name: 'Trucks', value: trucks, color: colors.accent.orange }
      ]);

      // Payment method distribution
      setPaymentMethodData([
        { name: 'Cash', value: cash, color: colors.accent.green },
        { name: 'Card', value: card, color: colors.accent.blue },
        { name: 'UPI', value: upi, color: colors.accent.purple },
        { name: 'Wallet', value: wallet, color: colors.accent.orange }
      ]);

      // Category distribution
      setCategoryData([
        { name: 'Regular', value: regular, color: colors.accent.teal },
        { name: 'VIP', value: vip, color: colors.accent.yellow },
        { name: 'EV', value: ev, color: colors.accent.green },
        { name: 'Disabled', value: disabled, color: colors.accent.blue }
      ]);

      // Slot utilization
      const utilization = slots.map(slot => ({
        name: slot.id,
        utilization: slot.status === 'Occupied' ? 100 : 0,
        status: slot.status
      }));
      setSlotUtilization(utilization.slice(0, 10)); // Top 10 slots

      // Top customers
      const customerMap = new Map();
      revenueHistory.forEach(r => {
        const key = r.phone || r.ownerName;
        if (!key) return;
        
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            name: r.ownerName || 'Unknown',
            phone: r.phone || 'N/A',
            visits: 0,
            spent: 0,
            vehicles: new Set()
          });
        }
        
        const customer = customerMap.get(key);
        customer.visits += 1;
        customer.spent += (r.amount || r.totalAmount || 0);
        if (r.vehicleNumber) customer.vehicles.add(r.vehicleNumber);
      });

      setTopCustomers(
        Array.from(customerMap.values())
          .sort((a, b) => b.spent - a.spent)
          .slice(0, 5)
          .map(c => ({
            ...c,
            vehicles: Array.from(c.vehicles).join(', ')
          }))
      );

      // Recent activities
      const activities = [];
      revenueHistory.slice(-5).forEach(r => {
        activities.push({
          id: r._id,
          type: 'payment',
          message: `Payment received from ${r.ownerName}`,
          amount: r.amount,
          time: r.paidAt || r.exitTime,
          icon: <FaMoneyBillWave />,
          color: colors.accent.green
        });
      });

      slots.filter(s => s.vehicle).slice(-3).forEach(s => {
        activities.push({
          id: s.id,
          type: 'entry',
          message: `Vehicle ${s.vehicle.vehicleNumber} parked at ${s.id}`,
          time: s.vehicle.entryTime,
          icon: <FaCar />,
          color: colors.accent.blue
        });
      });

      setRecentActivities(activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin-login");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)` }}>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10"
        style={{ background: `linear-gradient(to right, ${colors.primary.from}, ${colors.primary.to})` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <FaParking className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-300 text-xs">Smart Parking Management System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Date & Time */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
                <p className="text-white text-sm font-semibold">
                  {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-gray-300 text-xs">
                  {time.toLocaleTimeString()}
                </p>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all relative"
                >
                  <FaBell className="text-white text-xl" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="p-4 hover:bg-gray-50 border-b border-gray-100">
                            <p className="text-sm text-gray-800">New vehicle parked at F1-A1</p>
                            <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-semibold text-sm">{user?.name || 'Admin'}</p>
                  <p className="text-gray-300 text-xs">Administrator</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <FaSignOutAlt className="text-white text-xl" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your parking system today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ background: `${colors.accent.blue}20` }}>
                <FaParking style={{ color: colors.accent.blue }} className="text-2xl" />
              </div>
              <span className="text-xs text-gray-500">Total Capacity</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{formatNumber(stats.totalSlots)}</h3>
            <p className="text-sm text-gray-600 mt-2">Total Parking Slots</p>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <FaArrowUp className="mr-1" /> {stats.availableSlots}
              </span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-red-600">{stats.occupiedSlots} occupied</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ background: `${colors.accent.green}20` }}>
                <FaMoneyBillWave style={{ color: colors.accent.green }} className="text-2xl" />
              </div>
              <span className="text-xs text-gray-500">Total Revenue</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</h3>
            <p className="text-sm text-gray-600 mt-2">Lifetime Revenue</p>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <FaArrowUp className="mr-1" /> +12.5%
              </span>
              <span className="text-gray-400 mx-2">vs last month</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ background: `${colors.accent.purple}20` }}>
                <FaUsers style={{ color: colors.accent.purple }} className="text-2xl" />
              </div>
              <span className="text-xs text-gray-500">Active Users</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{formatNumber(stats.activeUsers)}</h3>
            <p className="text-sm text-gray-600 mt-2">Registered Users</p>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <FaArrowUp className="mr-1" /> +8
              </span>
              <span className="text-gray-400 mx-2">new this week</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ background: `${colors.accent.orange}20` }}>
                <FaStar style={{ color: colors.accent.orange }} className="text-2xl" />
              </div>
              <span className="text-xs text-gray-500">Satisfaction</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.customerSatisfaction}/5</h3>
            <p className="text-sm text-gray-600 mt-2">Customer Rating</p>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-600 flex items-center">
                <FaStar className="mr-1" /> 4.8
              </span>
              <span className="text-gray-400 mx-2">from 234 reviews</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500">Today's Revenue</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(stats.todayRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500">Avg Occupancy</p>
            <p className="text-lg font-bold text-blue-600">{stats.avgOccupancy}%</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500">Peak Hours</p>
            <p className="text-lg font-bold text-purple-600">{stats.peakHours}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-bold text-orange-600">{stats.pendingPayments}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg font-bold text-green-600">{stats.completedBookings}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500">VIP Bookings</p>
            <p className="text-lg font-bold text-yellow-600">{stats.vipBookings}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500">EV Bookings</p>
            <p className="text-lg font-bold text-green-600">{stats.evBookings}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500">Cancelled</p>
            <p className="text-lg font-bold text-red-600">{stats.cancelledBookings}</p>
          </div>
        </motion.div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaChartLine className="mr-2" style={{ color: colors.accent.green }} />
                Revenue Overview
              </h3>
              <div className="flex space-x-2">
                {['week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                      dateRange === range
                        ? 'text-white'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={dateRange === range ? { background: colors.accent.green } : {}}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill={colors.accent.green} name="Revenue" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" stroke={colors.accent.blue} name="Bookings" strokeWidth={2} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" fill={`${colors.accent.green}20`} stroke="none" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Vehicle Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartPie className="mr-2" style={{ color: colors.accent.purple }} />
              Vehicle Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {vehicleTypeData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: item.color }} />
                  <p className="text-xs text-gray-600">{item.name}</p>
                  <p className="text-sm font-bold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Hourly Occupancy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaRegClock className="mr-2" style={{ color: colors.accent.blue }} />
              Hourly Occupancy
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke={colors.accent.blue} 
                    fill={`${colors.accent.blue}20`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCreditCard className="mr-2" style={{ color: colors.accent.orange }} />
              Payment Methods
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Third Row - Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaIdCard className="mr-2" style={{ color: colors.accent.purple }} />
              Slot Categories
            </h3>
            <div className="space-y-3">
              {categoryData.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.name}</span>
                    <span className="font-semibold text-gray-800">{cat.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: stats.totalSlots > 0 ? `${(cat.value / stats.totalSlots) * 100}%` : '0%' }}
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaStar className="mr-2" style={{ color: colors.accent.yellow }} />
              Top Customers
            </h3>
            <div className="space-y-3">
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.vehicles}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(customer.spent)}</p>
                      <p className="text-xs text-gray-500">{customer.visits} visits</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No customer data available</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Slot Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 rounded-lg" style={{ background: `${activity.color}20` }}>
                      <span style={{ color: activity.color }}>{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleTimeString()}
                      </p>
                    </div>
                    {activity.amount && (
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No recent activities</p>
              )}
            </div>
          </motion.div>

          {/* Slot Utilization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Slot Utilization</h3>
            <div className="space-y-2">
              {slotUtilization.length > 0 ? (
                slotUtilization.map((slot, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-xs font-medium w-12">{slot.name}</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${slot.utilization}%` }}
                        className="h-full rounded-full"
                        style={{ 
                          background: slot.status === 'Occupied' 
                            ? `linear-gradient(to right, ${colors.accent.green}, ${colors.accent.teal})`
                            : colors.neutral[300]
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-16">
                      {slot.utilization}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No slot data available</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: <FaPlus />, label: 'Add Slot', path: '/admin/add-slot', color: colors.accent.blue },
              { icon: <FaList />, label: 'View Users', path: '/admin/users', color: colors.accent.green },
              { icon: <FaUserCircle />, label: 'Profile', path: '/admin/profile', color: colors.accent.purple },
              { icon: <FaMoneyBillWave />, label: 'Payments', path: '/admin/payment', color: colors.accent.orange },
              { icon: <FaChartLine />, label: 'Reports', path: '/admin/report', color: colors.accent.teal },
              { icon: <FaCar />, label: 'Vehicle Entry', path: '/admin/vehicle-entry', color: colors.accent.pink }
            ].map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className="p-4 rounded-xl text-white flex flex-col items-center justify-center transition-all"
                style={{ background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)` }}
              >
                <span className="text-2xl mb-2">{action.icon}</span>
                <span className="text-xs font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">System Status</p>
            <p className="text-sm font-semibold text-green-600 flex items-center">
              <FaCheckCircle className="mr-1" /> All Systems Operational
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Last Backup</p>
            <p className="text-sm font-semibold text-gray-800">2 minutes ago</p>
          </div>
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Active Sessions</p>
            <p className="text-sm font-semibold text-gray-800">12 users</p>
          </div>
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Server Load</p>
            <p className="text-sm font-semibold text-gray-800">34%</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;