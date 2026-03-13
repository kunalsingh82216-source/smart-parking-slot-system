import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  FaCar, 
  FaUser, 
  FaPhone, 
  FaClock, 
  FaRupeeSign,
  FaArrowRight,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaDatabase
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { parkingAPI } from '../../services/api';

const VehicleEntry = () => {
  // Form States
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [expectedHours, setExpectedHours] = useState(1);
  
  // Data States
  const [slots, setSlots] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingSlotId, setEditingSlotId] = useState(null);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Colors
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
      yellow: '#d97706'
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

  // ============ LOAD SLOTS ============
  useEffect(() => {
    fetchAllSlots();
  }, []);

  const fetchAllSlots = async () => {
    try {
      setBackendStatus('checking');
      const response = await parkingAPI.getAllSlots();
      
      if (response.data.success) {
        setSlots(response.data.slots);
        setBackendStatus('connected');
        console.log('✅ Slots loaded from backend:', response.data.slots.length);
        
        // Also save to localStorage as backup
        localStorage.setItem("parkingSlots", JSON.stringify(response.data.slots));
      }
    } catch (error) {
      console.log('❌ Backend not available, loading from localStorage');
      loadFromLocalStorage();
      setBackendStatus('disconnected');
    }
  };

  const loadFromLocalStorage = () => {
    const stored = JSON.parse(localStorage.getItem("parkingSlots")) || [];
    const uniqueSlots = removeDuplicateSlots(stored);
    setSlots(uniqueSlots);
    console.log('📦 Loaded from localStorage:', uniqueSlots.length, 'slots');
  };

  const removeDuplicateSlots = (slotsArray) => {
    const uniqueMap = new Map();
    slotsArray.forEach(slot => {
      if (!uniqueMap.has(slot.Id)) {
        uniqueMap.set(slot.slotId, slot);
      }
    });
    return Array.from(uniqueMap.values());
  };

  // Available slots for selection
  const availableSlots = slots.filter(
    slot => slot.type === vehicleType && slot.status === "Available"
  );

  // Occupied slots for display
  const occupiedSlots = slots.filter(
    slot => slot.status === "Occupied" && slot.vehicle
  );

  const filteredOccupiedSlots = occupiedSlots.filter(slot => {
    const matchesSearch = 
      slot.vehicle?.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.vehicle?.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || slot.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const generateVehicleId = () => Date.now() + Math.floor(Math.random() * 1000);

  // ============ ✅ SINGLE HANDLE ENTRY FUNCTION ============
  const handleEntry = async () => {
    // Validation
    if (!vehicleNumber || !ownerName || !phone || !selectedSlot) {
      toast.error("Please fill all fields");
      return;
    }

    if (phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    const selectedSlotData = slots.find(slot => slot.slotId === selectedSlot);
    if (selectedSlotData?.status === "Occupied") {
      toast.error("This slot is already occupied!");
      return;
    }

    const existingVehicle = slots.find(
      slot => slot.status === "Occupied" && 
      slot.currentvehicle?.vehicleNumber === vehicleNumber
    );
    
    if (existingVehicle) {
      toast.error("Vehicle already parked!");
      return;
    }

    setLoading(true);

    try {
      // ✅ TRY BACKEND FIRST
      const response = await parkingAPI.vehicleEntry({
        slotId: selectedSlot,
        vehicleNumber: vehicleNumber.toUpperCase(),
        ownerName,
        phone,
        expectedHours: Number(expectedHours),
        vehicleType
      });

      if (response.data.success) {
        toast.success(`✅ Vehicle Parked in slot ${selectedSlot}`);
        await fetchAllSlots();
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to save to database");
    }
      
    setLoading(false);
  };

  const resetForm = () => {
    setVehicleNumber("");
    setOwnerName("");
    setPhone("");
    setVehicleType("Car");
    setSelectedSlot("");
    setExpectedHours(1);
    setEditingId(null);
    setEditingSlotId(null);
  };

  const handleExit = async (slotId) => {
    const slotToExit = slots.find(slot => slot.Id === slotId);
    if (!slotToExit?.currentvehicle) {
      toast.error("No vehicle found!");
      return;
    }

    // Try backend
    try {
      await parkingAPI.vehicleExit({ slotId });
      toast.success('vehicle Exited  from $ {slotId}');
      await fetchAllSlots();
    } catch (error) {
      toast.error('Exit failed');
    }

    if (editingSlotId === slotId) resetForm();
  };

  const handleDelete = (slotId) => {
    const updatedSlots = slots.map(slot =>
      slot.id === slotId
        ? { ...slot, status: "Available", vehicle: null }
        : slot
    );
    
    localStorage.setItem("parkingSlots", JSON.stringify(updatedSlots));
    setSlots(updatedSlots);
    toast.error("Vehicle deleted");
    
    if (editingSlotId === slotId) resetForm();
  };

  const handleEdit = (slot) => {
    if (!slot.vehicle) return;
    setVehicleNumber(slot.currentvehicle.vehicleNumber);
    setOwnerName(slot.currentvehicle.ownerName);
    setPhone(slot.currentvehicle.phone);
    setVehicleType(slot.type);
    setSelectedSlot(slot.id);
    setExpectedHours(slot.currentvehicle.expectedHours || 1);
    setEditingSlotId(slot.id);
  };

  const getDuration = (entryTime) => {
    if (!entryTime) return "0.00";
    const diffMs = new Date() - new Date(entryTime);
    return (diffMs / (1000 * 60 * 60)).toFixed(2);
  };

  const stats = {
    available: slots.filter(s => s.status === "Available").length,
    occupied: slots.filter(s => s.status ==="occupied").length,
    revenue: slots.filter(s => s.status === "occupied").reduce((sum, s) => sum +((s.currentvehicle?.expectedHours || 0) * (s.pricePerHour || 50)),0)
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)` }}>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 shadow-md"
        style={{ background: `linear-gradient(to right, ${colors.primary.from}, ${colors.primary.to})` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FaCar className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Vehicle Entry</h1>
                <p className="text-gray-300 text-xs">Park and manage vehicles</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1.5 rounded-lg flex items-center text-sm ${
                backendStatus === 'connected' ? 'bg-green-500/20 text-green-300' : 
                backendStatus === 'disconnected' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'
              }`}>
                <FaDatabase className="mr-1.5 text-xs" />
                <span>
                  {backendStatus === 'connected' ? 'Online' : 
                   backendStatus === 'disconnected' ? 'Offline' : '...'}
                </span>
              </div>

              <div className="bg-white/10 px-3 py-1.5 rounded-lg text-center">
                <p className="text-gray-300 text-xs">Available</p>
                <p className="text-white font-bold text-lg">{stats.available}</p>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-lg text-center">
                <p className="text-gray-300 text-xs">Occupied</p>
                <p className="text-white font-bold text-lg">{stats.occupied}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Entry Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              
              {/* Form Header */}
              <div className="px-5 py-4 border-b border-gray-200" style={{ background: colors.primary.light }}>
                <h3 className="text-lg font-semibold flex items-center" style={{ color: colors.primary.from }}>
                  {editingId ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
                  {editingId ? "Edit Vehicle" : "New Vehicle Entry"}
                </h3>
              </div>

              {/* Form Content */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number
                  </label>
                  <div className="relative">
                    <input
                      placeholder="e.g., GJ-01-1234"
                      value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <FaCar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name
                  </label>
                  <div className="relative">
                    <input
                      placeholder="Full name"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPhone(value);
                      }}
                      maxLength="10"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Car</option>
                      <option>Bike</option>
                      <option>Truck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={expectedHours}
                      onChange={e => setExpectedHours(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Slot
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">Choose a parking slot</option>
                    {availableSlots.map(slot => (
                      <option key={slot.slotId || slot.id} value={slot.slotId || slot.id}>
                        {slot.slotId || slot.id} - {slot.type} (₹{slot.pricePerHour}/hr)
                      </option>
                    ))}
                  </select>
                  {availableSlots.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No slots available for {vehicleType}</p>
                  )}
                </div>

                <button
                  onClick={handleEntry}
                  disabled={loading || availableSlots.length === 0}
                  className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" />
                      {editingId ? "Update Vehicle" : "Park Vehicle"}
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    onClick={resetForm}
                    className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Active Vehicles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-gray-200" style={{ background: colors.primary.light }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center" style={{ color: colors.primary.from }}>
                    <FaClock className="mr-2" />
                    Active Vehicles
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-indigo-100" style={{ color: colors.primary.from }}>
                      {occupiedSlots.length}
                    </span>
                  </h3>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FaFilter className="text-gray-600 text-sm" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search vehicle, owner or slot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </div>
                
                {/* Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3"
                    >
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                      >
                        <option value="all">All Vehicles</option>
                        <option value="Car">Cars</option>
                        <option value="Bike">Bikes</option>
                        <option value="Truck">Trucks</option>
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Vehicle List */}
              <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                <AnimatePresence>
                  {filteredOccupiedSlots.map((slot) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow-sm shrink-0"
                          style={{ background: `linear-gradient(135deg, ${colors.primary.from}, ${colors.primary.to})` }}
                        >
                          <FaCar />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          {/* Vehicle Number and Slot */}
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900 text-base">{slot.vehicle?.vehicleNumber}</h4>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 rounded-full" style={{ color: colors.accent.blue }}>
                              {slot.id}
                            </span>
                          </div>
                          
                          {/* Owner and Phone */}
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">{slot.vehicle?.ownerName}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-600">{slot.vehicle?.phone}</span>
                          </p>
                          
                          {/* Entry Time */}
                          <p className="text-xs text-gray-500 mb-2 flex items-center">
                            <FaRegClock className="mr-1" />
                            {slot.vehicle?.entryTime ? new Date(slot.vehicle.entryTime).toLocaleString() : 'N/A'}
                          </p>
                          
                          {/* Duration Badges */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Exp: {slot.vehicle?.expectedHours || 0}h
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Current: {slot.vehicle?.entryTime ? getDuration(slot.vehicle.entryTime) : '0.00'}h
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(slot)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleExit(slot.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Exit"
                            >
                              <FaArrowRight size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredOccupiedSlots.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaTimesCircle className="text-2xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No active vehicles</p>
                    <p className="text-sm text-gray-400 mt-1">Park a vehicle to see it here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VehicleEntry;