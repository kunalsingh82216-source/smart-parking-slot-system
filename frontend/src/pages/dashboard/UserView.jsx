import React, { useState, useEffect } from "react";
import { 
  FaUser, 
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaUserCircle,
  FaUserTie,
  FaUserGraduate,
  FaUserCog,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaUserShield,
  FaDownload,
  FaPrint,
  FaEye,
  FaStar,
  FaIdCard,
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaKey
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const UserView = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("table"); // table or cards
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Customer",
    status: "Active",
    joinDate: new Date().toISOString().split('T')[0],
    address: "",
    department: "",
    lastActive: new Date().toISOString()
  });

  // Modern color palette matching other components
  const colors = {
    primary: {
      from: '#0f172a', // Slate 900
      to: '#1e293b',   // Slate 800
      light: '#f8fafc', // Slate 50
      dark: '#020617'   // Slate 950
    },
    accent: {
      green: '#059669', // Emerald 600
      blue: '#2563eb',  // Blue 600
      purple: '#7c3aed', // Violet 600
      orange: '#ea580c', // Orange 600
      red: '#dc2626',    // Red 600
      yellow: '#d97706',  // Amber 600
      teal: '#0d9488'    // Teal 600
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

  // Sample users data - in real app, this would come from API/localStorage
  useEffect(() => {
    const sampleUsers = [
      { 
        id: 1, 
        name: "Rahul Sharma", 
        email: "rahul.sharma@gmail.com", 
        phone: "+91 98765 43210",
        role: "Customer", 
        status: "Active",
        joinDate: "2024-01-15",
        lastActive: new Date().toISOString(),
        totalBookings: 12,
        totalSpent: 2450,
        address: "Mumbai, Maharashtra",
        department: "Sales",
        avatar: null
      },
      { 
        id: 2, 
        name: "Amit Verma", 
        email: "amit.verma@company.com", 
        phone: "+91 99887 76655",
        role: "Manager", 
        status: "Active",
        joinDate: "2023-11-20",
        lastActive: new Date().toISOString(),
        totalBookings: 8,
        totalSpent: 5600,
        address: "Delhi, NCR",
        department: "Operations",
        avatar: null
      },
      { 
        id: 3, 
        name: "Sneha Singh", 
        email: "sneha.singh@gmail.com", 
        phone: "+91 97654 32109",
        role: "Customer", 
        status: "Inactive",
        joinDate: "2024-02-01",
        lastActive: "2024-02-15T10:30:00",
        totalBookings: 3,
        totalSpent: 450,
        address: "Bangalore, Karnataka",
        department: "Marketing",
        avatar: null
      },
      { 
        id: 4, 
        name: "Priya Patel", 
        email: "priya.patel@company.com", 
        phone: "+91 96543 21098",
        role: "Admin", 
        status: "Active",
        joinDate: "2023-09-10",
        lastActive: new Date().toISOString(),
        totalBookings: 5,
        totalSpent: 3200,
        address: "Ahmedabad, Gujarat",
        department: "Administration",
        avatar: null
      },
      { 
        id: 5, 
        name: "Vikram Malhotra", 
        email: "vikram.m@company.com", 
        phone: "+91 95432 10987",
        role: "Manager", 
        status: "Suspended",
        joinDate: "2023-12-05",
        lastActive: "2024-02-10T15:45:00",
        totalBookings: 15,
        totalSpent: 7800,
        address: "Chennai, Tamil Nadu",
        department: "Operations",
        avatar: null
      }
    ];
    setUsers(sampleUsers);
  }, []);

  // Filter and sort users
  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.toLowerCase().includes(search.toLowerCase()) ||
        user.role?.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        return new Date(b.joinDate) - new Date(a.joinDate);
      } else if (sortBy === 'bookings') {
        return b.totalBookings - a.totalBookings;
      }
      return 0;
    });

    setFilteredUsers(filtered);
  }, [search, users, filterRole, filterStatus, sortBy]);

  const handleAddUser = () => {
    const newId = users.length + 1;
    const userToAdd = {
      ...newUser,
      id: newId,
      lastActive: new Date().toISOString()
    };
    setUsers([...users, userToAdd]);
    setShowAddForm(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "Customer",
      status: "Active",
      joinDate: new Date().toISOString().split('T')[0],
      address: "",
      department: "",
      lastActive: new Date().toISOString()
    });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      setShowModal(false);
    }
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ));
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Admin': return <FaUserShield className="text-purple-500" />;
      case 'Manager': return <FaUserTie className="text-blue-500" />;
      case 'Customer': return <FaUserGraduate className="text-green-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: colors.accent.green, bg: `${colors.accent.green}20`, icon: <FaUserCheck /> },
      'Inactive': { color: colors.neutral[500], bg: `${colors.neutral[500]}20`, icon: <FaUserClock /> },
      'Suspended': { color: colors.accent.red, bg: `${colors.accent.red}20`, icon: <FaBan /> }
    };
    
    const config = statusConfig[status] || statusConfig['Inactive'];
    
    return (
      <span 
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        <span className="mr-1">{config.icon}</span>
        {status}
      </span>
    );
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    inactive: users.filter(u => u.status === 'Inactive').length,
    suspended: users.filter(u => u.status === 'Suspended').length,
    customers: users.filter(u => u.role === 'Customer').length,
    managers: users.filter(u => u.role === 'Manager').length,
    admins: users.filter(u => u.role === 'Admin').length
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <FaUser className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">User Management</h1>
                <p className="text-gray-300 text-sm mt-1">Manage users, roles and permissions</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Active</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="bg-white/20 backdrop-blur-lg rounded-lg px-6 py-3 hover:bg-white/30 transition-all flex items-center text-white"
              >
                <FaPlus className="mr-2" />
                Add User
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200 mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name, email or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <FaIdCard />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <FaUser />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center"
              >
                <FaFilter className="mr-1" />
                Filters
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden"
              >
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Roles</option>
                  <option value="Customer">Customer</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Join Date</option>
                  <option value="bookings">Sort by Bookings</option>
                </select>

                <button
                  onClick={() => {
                    setFilterRole('all');
                    setFilterStatus('all');
                    setSortBy('name');
                    setSearch('');
                  }}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500">Inactive</p>
            <p className="text-xl font-bold text-gray-500">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500">Suspended</p>
            <p className="text-xl font-bold text-red-600">{stats.suspended}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center"><FaUserGraduate className="mr-1" /> Customers</p>
            <p className="text-xl font-bold text-green-600">{stats.customers}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center"><FaUserTie className="mr-1" /> Managers</p>
            <p className="text-xl font-bold text-blue-600">{stats.managers}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center"><FaUserShield className="mr-1" /> Admins</p>
            <p className="text-xl font-bold text-purple-600">{stats.admins}</p>
          </div>
        </motion.div>

        {/* Add User Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FaTimesCircle className="text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option>Customer</option>
                      <option>Manager</option>
                      <option>Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={newUser.status}
                      onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                    <input
                      type="date"
                      value={newUser.joinDate}
                      onChange={(e) => setNewUser({...newUser, joinDate: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={newUser.address}
                      onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="City, State"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., Sales, Operations"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add User
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Details Modal */}
        <AnimatePresence>
          {showModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                      <p className="text-gray-500 flex items-center mt-1">
                        {getRoleIcon(selectedUser.role)}
                        <span className="ml-1">{selectedUser.role}</span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(selectedUser.status)}
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center"><FaEnvelope className="mr-2" /> Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center"><FaPhone className="mr-2" /> Phone</p>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center"><FaMapMarkerAlt className="mr-2" /> Address</p>
                      <p className="font-medium">{selectedUser.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center"><FaBuilding className="mr-2" /> Department</p>
                      <p className="font-medium">{selectedUser.department}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center"><FaCalendarAlt className="mr-2" /> Join Date</p>
                      <p className="font-medium">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center"><FaClock className="mr-2" /> Last Active</p>
                      <p className="font-medium">{new Date(selectedUser.lastActive).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center"><FaStar className="mr-2" /> Total Bookings</p>
                      <p className="font-medium">{selectedUser.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center"><FaKey className="mr-2" /> Total Spent</p>
                      <p className="font-medium text-green-600">₹{selectedUser.totalSpent}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <select
                    value={selectedUser.status}
                    onChange={(e) => handleStatusChange(selectedUser.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Active">Set Active</option>
                    <option value="Inactive">Set Inactive</option>
                    <option value="Suspended">Set Suspended</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete User
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Display - Table or Cards */}
        {filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.primary.light}, ${colors.neutral[200]})` }}
            >
              <FaUser className="text-4xl" style={{ color: colors.primary.from }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              No users match your search criteria. Try adjusting your filters or add a new user.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Add New User
            </button>
          </motion.div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Join Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: colors.neutral[100] }}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className="ml-2 text-sm">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit functionality
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          /* Cards View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  setShowModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(user.status)}
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    {user.phone}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    {getRoleIcon(user.role)}
                    <span className="ml-2">{user.role}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    Joined: {new Date(user.joinDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Bookings</p>
                    <p className="font-bold text-gray-800">{user.totalBookings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Spent</p>
                    <p className="font-bold text-green-600">₹{user.totalSpent}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Quick actions
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <FaEye />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserView;