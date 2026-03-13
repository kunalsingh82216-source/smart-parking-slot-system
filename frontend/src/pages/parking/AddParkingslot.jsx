import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  FaCar, 
  FaMotorcycle, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaBuilding,
  FaLayerGroup,
  FaRupeeSign,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaIdCard,
  FaBolt,
  FaStar,
  FaWheelchair,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaPrint,
  FaQrcode,
  FaChartBar
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { parkingAPI } from '../../services/api';

const AddParkingSlot = () => {
  // Form States
  const [floor, setFloor] = useState("F1");
  const [area, setArea] = useState("A1");
  const [type, setType] = useState("Car");
  const [category, setCategory] = useState("Regular");
  const [price, setPrice] = useState(50);
  const [count, setCount] = useState(10);
  
  // Data States
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);

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
      teal: '#0d9488'
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

  const floors = ["F1", "F2", "F3", "F4", "F5"];
  const areas = ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E1", "E2"];
  
  const vehicleTypes = [
    { value: "Car", icon: <FaCar />, color: colors.accent.blue },
    { value: "Bike", icon: <FaMotorcycle />, color: colors.accent.purple },
    { value: "Truck", icon: <FaTruck />, color: colors.accent.orange }
  ];
  
  const categories = [
    { value: "Regular", icon: <FaIdCard />, color: colors.neutral[600] },
    { value: "VIP", icon: <FaStar />, color: colors.accent.yellow },
    { value: "EV", icon: <FaBolt />, color: colors.accent.green },
    { value: "Disabled", icon: <FaWheelchair />, color: colors.accent.blue }
  ];

  // Load slots on mount
  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const response = await parkingAPI.getAllSlots();
      if (response.data.success) {
        const loadedSlots = response.data.slots || [];
        setSlots(loadedSlots);
        localStorage.setItem("parkingSlots", JSON.stringify(loadedSlots));
        console.log('✅ Loaded slots:', loadedSlots.length);
      }
    } catch (error) {
      console.log('⚠️ Using localStorage');
      const stored = JSON.parse(localStorage.getItem("parkingSlots")) || [];
      setSlots(stored);
    } finally {
      setLoading(false);
    }
  };

  // Generate slots
  const generateSlots = async () => {
    if (!floor || !area || !type || !price || !count) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await parkingAPI.createSlots({
        floor,
        area,
        type,
        category,
        pricePerHour: Number(price),
        count: Number(count)
      });

      if (response.data.success) {
        toast.success(`✅ ${response.data.message}`);
        await loadSlots();
        
        // Reset form
        setFloor("F1");
        setArea("A1");
        setType("Car");
        setCategory("Regular");
        setPrice(50);
        setCount(10);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error.response?.data?.message || 'Failed to create slots');
    } finally {
      setLoading(false);
    }
  };

  // Delete single slot
  const deleteSlot = async (slotId) => {
    if (!window.confirm(`Delete slot ${slotId}?`)) return;
    
    const updated = slots.filter(slot => slot.id !== slotId);
    localStorage.setItem("parkingSlots", JSON.stringify(updated));
    setSlots(updated);
    toast.success(`Slot ${slotId} deleted`);
    
    if (selectedSlot?.id === slotId) {
      setShowPreview(false);
    }
  };

  // Clear all slots
  const clearAllSlots = () => {
    if (!window.confirm('Delete ALL slots?')) return;
    
    localStorage.setItem("parkingSlots", JSON.stringify([]));
    setSlots([]);
    toast.success('All slots cleared');
    setShowPreview(false);
  };

  // Update slot price
  const updateSlotPrice = (slotId, newPrice) => {
    if (!newPrice || newPrice < 10) {
      toast.error('Price must be at least ₹10');
      return;
    }

    const updated = slots.map(slot => 
      slot.id === slotId 
        ? { ...slot, pricePerHour: Number(newPrice), lastUpdated: new Date().toISOString() }
        : slot
    );
    
    localStorage.setItem("parkingSlots", JSON.stringify(updated));
    setSlots(updated);
    toast.success(`Price updated for ${slotId}`);
    
    if (selectedSlot?.id === slotId) {
      setSelectedSlot({ ...selectedSlot, pricePerHour: Number(newPrice) });
    }
  };

  // Filter slots with safety checks
  const filteredSlots = (slots || []).filter(slot => {
    if (!slot) return false;
    
    const matchesSearch = 
      (slot.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (slot.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (slot.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || slot.type === filterType;
    const matchesStatus = filterStatus === 'all' || slot.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || slot.category === filterCategory;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Statistics
  const stats = {
    total: slots?.length || 0,
    available: slots?.filter(s => s?.status === "Available").length || 0,
    occupied: slots?.filter(s => s?.status === "Occupied").length || 0,
    car: slots?.filter(s => s?.type === "Car").length || 0,
    bike: slots?.filter(s => s?.type === "Bike").length || 0,
    truck: slots?.filter(s => s?.type === "Truck").length || 0,
    vip: slots?.filter(s => s?.category === "VIP").length || 0,
    ev: slots?.filter(s => s?.category === "EV").length || 0,
    disabled: slots?.filter(s => s?.category === "Disabled").length || 0
  };

  // Helper functions
  const getStatusColor = (status) => {
    return status === "Available" ? colors.accent.green : colors.accent.red;
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Car': return <FaCar />;
      case 'Bike': return <FaMotorcycle />;
      case 'Truck': return <FaTruck />;
      default: return <FaCar />;
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'VIP': return <FaStar />;
      case 'EV': return <FaBolt />;
      case 'Disabled': return <FaWheelchair />;
      default: return <FaIdCard />;
    }
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
                <FaBuilding className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Parking Slot Management</h1>
                <p className="text-gray-300 text-sm mt-1">Generate and manage parking slots</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Total Slots</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Available</p>
                <p className="text-2xl font-bold text-white">{stats.available}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Occupied</p>
                <p className="text-2xl font-bold text-white">{stats.occupied}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mb-8"
        >
          <div className="p-6 border-b border-gray-200" style={{ background: colors.primary.light }}>
            <h2 className="text-xl font-semibold flex items-center" style={{ color: colors.primary.from }}>
              <FaPlus className="mr-2" />
              Generate New Parking Slots
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Floor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaLayerGroup className="inline mr-1" /> Floor
                </label>
                <select 
                  value={floor} 
                  onChange={(e) => setFloor(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {floors.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-1" /> Area
                </label>
                <select 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {areas.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCar className="inline mr-1" /> Vehicle Type
                </label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {vehicleTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.value}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.value}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaRupeeSign className="inline mr-1" /> Price Per Hour
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="10"
                  step="5"
                />
              </div>

              {/* Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Slots
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateSlots}
                disabled={loading}
                className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg flex items-center disabled:opacity-50"
                style={{ background: `linear-gradient(to right, ${colors.accent.green}, ${colors.accent.teal})` }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" />
                    Generate {count} Slots
                  </>
                )}
              </motion.button>

              {slots.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAllSlots}
                  className="px-8 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Clear All
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {slots.length > 0 && (
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
              <p className="text-xs text-gray-500">Available</p>
              <p className="text-xl font-bold text-green-600">{stats.available}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Occupied</p>
              <p className="text-xl font-bold text-red-600">{stats.occupied}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center"><FaCar className="mr-1" /> Car</p>
              <p className="text-xl font-bold" style={{ color: colors.accent.blue }}>{stats.car}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center"><FaMotorcycle className="mr-1" /> Bike</p>
              <p className="text-xl font-bold" style={{ color: colors.accent.purple }}>{stats.bike}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center"><FaTruck className="mr-1" /> Truck</p>
              <p className="text-xl font-bold" style={{ color: colors.accent.orange }}>{stats.truck}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center"><FaStar className="mr-1" /> VIP</p>
              <p className="text-xl font-bold" style={{ color: colors.accent.yellow }}>{stats.vip}</p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        {slots.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search slots..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <FaFilter />
                Filters
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <FaBuilding />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <FaChartBar />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden"
                >
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 border rounded-lg">
                    <option value="all">All Types</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                  </select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded-lg">
                    <option value="all">All Status</option>
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                  </select>
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="p-2 border rounded-lg">
                    <option value="all">All Categories</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="EV">EV</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Slot Display */}
        {slots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.primary.light}, ${colors.neutral[200]})` }}
            >
              <FaBuilding className="text-4xl" style={{ color: colors.primary.from }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Parking Slots</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Generate parking slots using the form above to start managing your parking system
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                : 'grid-cols-1 gap-2'
            }`}
          >
            <AnimatePresence>
              {filteredSlots.map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setShowPreview(true);
                  }}
                >
                  <div
                    className={`bg-white rounded-xl shadow-lg border-2 transition-all hover:shadow-xl p-4`}
                    style={{ 
                      borderColor: slot.status === 'Available' ? colors.accent.green : colors.accent.red,
                      borderLeftWidth: '4px'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{slot.id}</h3>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          background: slot.status === 'Available' ? `${colors.accent.green}20` : `${colors.accent.red}20`,
                          color: slot.status === 'Available' ? colors.accent.green : colors.accent.red
                        }}
                      >
                        {slot.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="flex items-center"><FaLayerGroup className="mr-1" /> {slot.floor}</span>
                      <span className="flex items-center"><FaMapMarkerAlt className="mr-1" /> {slot.area}</span>
                      <span className="flex items-center" style={{ color: colors.accent.green }}>
                        <FaRupeeSign className="mr-1" /> {slot.pricePerHour}/hr
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                        style={{
                          background: `${getCategoryIcon(slot.category)?.props?.color || colors.neutral[400]}20`,
                          color: getCategoryIcon(slot.category)?.props?.color || colors.neutral[600]
                        }}
                      >
                        {getCategoryIcon(slot.category)}
                        <span className="ml-1">{slot.category}</span>
                      </span>
                      
                      {slot.vehicle && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          <FaCar className="inline mr-1" /> Occupied
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newPrice = prompt('Enter new price:', slot.pricePerHour);
                            if (newPrice) updateSlotPrice(slot.id, newPrice);
                          }}
                          className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlot(slot.id);
                          }}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredSlots.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No slots match your filters</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && selectedSlot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Slot Details</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FaTimesCircle className="text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Slot ID</p>
                      <p className="text-xl font-bold text-gray-800">{selectedSlot.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-lg">Floor {selectedSlot.floor}, Area {selectedSlot.area}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Type</p>
                      <p className="text-lg flex items-center">
                        {getTypeIcon(selectedSlot.type)}
                        <span className="ml-2">{selectedSlot.type}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-lg font-semibold" style={{ color: getStatusColor(selectedSlot.status) }}>
                        {selectedSlot.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price Per Hour</p>
                      <p className="text-2xl font-bold text-green-600">₹{selectedSlot.pricePerHour}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="text-lg flex items-center">
                        {getCategoryIcon(selectedSlot.category)}
                        <span className="ml-2">{selectedSlot.category}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {selectedSlot.vehicle && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-700 mb-3">Current Vehicle</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Vehicle</p>
                        <p className="font-medium">{selectedSlot.vehicle.vehicleNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Owner</p>
                        <p className="font-medium">{selectedSlot.vehicle.ownerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium">{selectedSlot.vehicle.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Entry Time</p>
                        <p className="font-medium">{new Date(selectedSlot.vehicle.entryTime).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      const newPrice = prompt('Enter new price:', selectedSlot.pricePerHour);
                      if (newPrice) {
                        updateSlotPrice(selectedSlot.id, newPrice);
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Edit Price
                  </button>
                  <button
                    onClick={() => {
                      deleteSlot(selectedSlot.id);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete Slot
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AddParkingSlot;