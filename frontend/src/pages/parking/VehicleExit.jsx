import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { parkingAPI } from "../../services/api";
import { 
  FaCar, 
  FaUser, 
  FaPhone, 
  FaClock, 
  FaRupeeSign,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaRegClock,
  FaRegCalendarAlt,
  FaCreditCard,
  FaWallet,
  FaMoneyBillWave,
  FaQrcode,
  FaReceipt,
  FaDownload,
  FaPrint
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const VehicleExit = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [bill, setBill] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBillPreview, setShowBillPreview] = useState(false);

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
      red: '#dc2626'
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

useEffect(() => {
  fetchActiveVehicles();
}, []);

const fetchActiveVehicles = async () => {
  try {
    const response = await parkingAPI.getActiveParkings();

    if (response.data.success) {
      // Backend data ko frontend format me convert kar rahe hain
      const formattedSlots = response.data.parkings.map((p) => ({
        id: p.slotId,
        status: "Occupied",
        type: p.vehicleType,
        pricePerHour: p.pricePerHour || 50,
        vehicle: {
          vehicleNumber: p.vehicleNumber,
          ownerName: p.ownerName,
          phone: p.phone,
          entryTime: p.entryTime,
        },
      }));

      setSlots(formattedSlots);
    }
  } catch (error) {
    console.error("Error fetching active vehicles:", error);
  }
};

  // ✅ FIX: Only show slots with valid vehicle
  const occupiedSlots = slots.filter(slot => 
    slot.status === "Occupied" && 
    slot.vehicle && 
    slot.vehicle.vehicleNumber
  );

  const filteredSlots = occupiedSlots.filter(slot =>
    slot.vehicle?.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.vehicle?.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDuration = (entryTime) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now - entry;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return { hours, minutes, totalHours: Math.ceil(diffMins / 60) };
  };

  const handleSelectSlot = (slotId) => {
    setSelectedSlotId(slotId);
    setShowBillPreview(true);

    const slot = slots.find(s => s.id === slotId);
    if (!slot || !slot.vehicle) {
      setBill(null);
      return;
    }

    const exitTime = new Date();
    const { hours, minutes, totalHours } = calculateDuration(slot.vehicle.entryTime);

    const pricePerHour = slot.pricePerHour || 50;
    const amount = totalHours * pricePerHour;
    const tax = Math.round(amount * 0.18);
    const totalAmount = amount + tax;

    setBill({
      ...slot.vehicle,
      slotId,
      slotType: slot.type,
      exactHours: hours,
      exactMinutes: minutes,
      hours: totalHours,
      pricePerHour,
      amount,
      tax,
      totalAmount,
      entryTime: slot.vehicle.entryTime,
      exitTime: exitTime.toISOString()
    });
  };

  const handleProceedToPayment = async () => {
    if (!bill || !selectedSlotId) {
      toast.error("Please select a vehicle first");
      return;
    }

    setProcessing(true);

    try {
      //backend exit API call
      const response = await parkingAPI.vehicleExit({slotId: selectedSlotId});
      if (!response.data.success) {
        toast.error("Exit failed");
        return;
      }
      const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments")) || [];

      // ✅ COMPLETE payment record with ALL customer details
      const paymentRecord = {
        _id: `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`,
        vehicleNumber: bill.vehicleNumber,
        ownerName: bill.ownerName,
        phone: bill.phone,
        slotNumber: bill.slotId,
        slotType: bill.slotType,
        amount: bill.amount,
        totalAmount: bill.totalAmount,
        tax: bill.tax,
        entryTime: bill.entryTime,
        exitTime: bill.exitTime,
        hours: bill.hours,
        exactHours: bill.exactHours,
        exactMinutes: bill.exactMinutes,
        pricePerHour: bill.pricePerHour,
        paymentMethod: "pending",
        status: "pending",
        vehicleType: bill.slotType || 'Car',
        timestamp: new Date().toISOString()
      };

      const existingIndex = pendingPayments.findIndex(
        p => p.vehicleNumber === bill.vehicleNumber && p.status === "pending"
      );

      if (existingIndex >= 0) {
        pendingPayments[existingIndex] = paymentRecord;
      } else {
        pendingPayments.push(paymentRecord);
      }

      localStorage.setItem("pendingPayments", JSON.stringify(pendingPayments));

      const updatedSlots = slots.map(slot =>
        slot.id === selectedSlotId
          ? { ...slot, status: "Available", vehicle: null }
          : slot
      );
      localStorage.setItem("parkingSlots", JSON.stringify(updatedSlots));

      toast.success("Vehicle moved to payment queue");

      setTimeout(() => {
        navigate("/admin/payment", { 
          state: { 
            selectedPaymentId: paymentRecord._id,
            autoSelect: true 
          } 
        });
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error("Error processing exit");
    } finally {
      setProcessing(false);
    }
  };

  const getDurationDisplay = (entryTime) => {
    const { hours, minutes } = calculateDuration(entryTime);
    return `${hours}h ${minutes}m`;
  };

  const stats = {
    occupied: occupiedSlots.length,
    estimatedRevenue: occupiedSlots.reduce((sum, s) => {
      if (!s.vehicle) return sum;
      const { totalHours } = calculateDuration(s.vehicle.entryTime);
      return sum + (totalHours * (s.pricePerHour || 50));
    }, 0)
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)` }}>
      
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
                <FaCar className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Vehicle Exit</h1>
                <p className="text-gray-300 text-sm mt-1">Process vehicle exit and send to payment</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Vehicles Inside</p>
                <p className="text-2xl font-bold text-white">{stats.occupied}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Est. Collection</p>
                <p className="text-2xl font-bold text-white">₹{stats.estimatedRevenue}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              
              <div className="p-6 border-b border-gray-200" style={{ background: colors.primary.light }}>
                <h3 className="text-xl font-semibold flex items-center" style={{ color: colors.primary.from }}>
                  <FaSearch className="mr-2" />
                  Select Vehicle to Exit
                </h3>
                
                <div className="relative mt-4">
                  <input
                    type="text"
                    placeholder="Search vehicle, owner or slot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                <AnimatePresence>
                  {filteredSlots.map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectSlot(slot.id)}
                      className={`p-5 cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedSlotId === slot.id
                          ? 'bg-blue-50 border-l-4'
                          : ''
                      }`}
                      style={selectedSlotId === slot.id ? { borderColor: colors.accent.blue } : {}}
                    >
                      <div className="flex items-start space-x-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                          style={{ background: `linear-gradient(135deg, ${colors.primary.from}, ${colors.primary.to})` }}
                        >
                          <FaCar className="text-xl" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900">{slot.vehicle?.vehicleNumber}</h4>
                            <span className="text-xs px-2 py-1 bg-blue-100 rounded-full" style={{ color: colors.accent.blue }}>
                              {slot.id}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <FaUser className="mr-1 text-xs" style={{ color: colors.accent.blue }} />
                            {slot.vehicle?.ownerName}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 flex items-center">
                              <FaRegClock className="mr-1" />
                              Parked: {slot.vehicle?.entryTime ? getDurationDisplay(slot.vehicle.entryTime) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {slot.vehicle?.entryTime ? new Date(slot.vehicle.entryTime).toLocaleTimeString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredSlots.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaTimesCircle className="text-3xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No vehicles found</p>
                    <p className="text-sm text-gray-400 mt-1">All slots are empty</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <AnimatePresence mode="wait">
              {bill && showBillPreview ? (
                <motion.div
                  key="bill"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                >
                  <div className="p-6" style={{ background: `linear-gradient(to right, ${colors.primary.from}, ${colors.primary.to})` }}>
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <FaReceipt className="mr-2" />
                      Exit Bill Summary
                    </h3>
                    <p className="text-indigo-200 text-sm mt-1">Review and proceed to payment</p>
                  </div>

                  <div className="p-6 space-y-6">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaCar className="mr-1" style={{ color: colors.accent.blue }} />
                          Vehicle
                        </p>
                        <p className="text-lg font-bold text-gray-800">{bill.vehicleNumber}</p>
                        <p className="text-sm text-gray-600">{bill.slotId}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaClock className="mr-1" style={{ color: colors.accent.orange }} />
                          Duration
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          {bill.exactHours}h {bill.exactMinutes}m
                        </p>
                        <p className="text-sm text-gray-600">Billed: {bill.hours} hrs</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <FaUser className="mr-2" style={{ color: colors.accent.purple }} />
                        Customer Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Owner</p>
                          <p className="font-medium text-gray-800">{bill.ownerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">{bill.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-3">Price Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base (₹{bill.pricePerHour}/hr × {bill.hours}hr)</span>
                          <span className="font-medium">₹{bill.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">GST (18%)</span>
                          <span className="font-medium">₹{bill.tax}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300">
                          <span className="font-semibold text-gray-800">Total Amount</span>
                          <span className="text-xl font-bold" style={{ color: colors.accent.green }}>
                            ₹{bill.totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleProceedToPayment}
                        disabled={processing}
                        className="w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center disabled:opacity-50"
                        style={{ background: `linear-gradient(to right, ${colors.accent.green}, #10b981)` }}
                      >
                        {processing ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaArrowRight className="mr-2" />
                            Proceed to Payment Page
                          </>
                        )}
                      </motion.button>

                      <p className="text-xs text-gray-500 text-center">
                        * Vehicle will be moved to payment page for processing
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${colors.primary.light}, ${colors.neutral[200]})` }}
                  >
                    <FaCar className="text-4xl" style={{ color: colors.primary.from }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Vehicle Selected</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Select a vehicle from the list to generate bill and proceed to payment
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                    {[
                      'Click on any vehicle',
                      'Review bill details',
                      'Proceed to payment'
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ background: colors.primary.from }}
                        >
                          {idx + 1}
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VehicleExit;