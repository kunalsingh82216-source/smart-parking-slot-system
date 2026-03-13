import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { 
  FaRupeeSign, 
  FaCreditCard, 
  FaWallet, 
  FaQrcode,
  FaPrint,
  FaDownload,
  FaCar,
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaReceipt,
  FaMoneyBillWave,
  FaMobileAlt,
  FaGooglePay,
  FaPhoneAlt,
  FaArrowRight,
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaEye,
  FaTrash,
  FaEdit,
  FaPlus,
  FaMinus,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegCreditCard,
  FaRegMoneyBillAlt,
  FaRegBuilding,
  FaFilePdf,
  FaPrint as FaPrintIcon
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Payment = () => {
  const location = useLocation();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showQR, setShowQR] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // Auto-select payment from Vehicle Exit
  useEffect(() => {
    if (location.state?.selectedPaymentId && pendingPayments.length > 0) {
      const paymentId = location.state.selectedPaymentId;
      const payment = pendingPayments.find(p => p._id === paymentId);
      
      if (payment) {
        setSelectedPayment(payment);
        toast.success(
          <div className="flex items-center">
            <FaCar className="mr-2 text-green-500" />
            <div>
              <p className="font-semibold">Vehicle Ready for Payment!</p>
              <p className="text-sm">{payment.vehicleNumber} - ₹{payment.amount}</p>
            </div>
          </div>,
          { duration: 5000 }
        );
        
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, pendingPayments]);

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const localPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
      
      const onlyPending = localPayments.filter(p => p.status === "pending");
      
      if (onlyPending.length > 0) {
        setPendingPayments(onlyPending);
      } else {
        try {
          const response = await axios.get(
            'http://localhost:5000/api/payment/pending',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const apiPending = response.data.filter(p => p.status === "pending");
          setPendingPayments(apiPending);
        } catch (error) {
          console.log('Using local storage for payments');
          setPendingPayments([]);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch pending payments');
      setPendingPayments([]);
    }
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast.error('Please select a payment');
      return;
    }

    setProcessing(true);
    try {
      const allPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
      
      const updatedPayments = allPayments.map(p => 
        p._id === selectedPayment._id 
          ? { 
              ...p, 
              status: 'completed', 
              paymentMethod, 
              upiId: paymentMethod === 'upi' ? upiId : undefined,
              paidAt: new Date().toISOString() 
            }
          : p
      );
      
      localStorage.setItem('pendingPayments', JSON.stringify(updatedPayments));

      const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
      revenueHistory.push({
        ...selectedPayment,
        paymentMethod,
        upiId: paymentMethod === 'upi' ? upiId : undefined,
        paidAt: new Date().toISOString(),
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
      });
      localStorage.setItem('revenueHistory', JSON.stringify(revenueHistory));

      toast.success(
        <div className="flex items-center">
          <FaCheckCircle className="text-green-500 mr-2" />
          <div>
            <p className="font-semibold">Payment Successful!</p>
            <p className="text-sm">Amount: ₹{selectedPayment.amount}</p>
          </div>
        </div>
      );
      
      setShowReceipt(true);
      
      setTimeout(() => {
        setSelectedPayment(null);
        setPaymentMethod('cash');
        setShowQR(false);
        setShowReceipt(false);
        setUpiId('');
        fetchPendingPayments();
      }, 2000);
      
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  // ✅ NEW: Generate Payment Receipt PDF with ALL details
  const generatePaymentPDF = () => {
    if (!selectedPayment) {
      toast.error('No payment selected');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Header with gradient effect
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT RECEIPT', 105, 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Parking Payment Receipt', 105, 35, { align: 'center' });
      
      // Receipt Details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('RECEIPT INFORMATION', 20, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      const transactionId = `TXN${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
      const receiptNo = selectedPayment._id?.slice(-8).toUpperCase() || 'N/A';
      
      doc.text(`Receipt No: ${receiptNo}`, 20, 62);
      doc.text(`Transaction ID: ${transactionId}`, 20, 69);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 76);
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 83);
      doc.text(`Payment Status: COMPLETED`, 20, 90);
      
      // Customer Details Table
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER DETAILS', 20, 105);
      
      autoTable(doc, {
        startY: 110,
        head: [['Field', 'Details']],
        body: [
          ['Customer Name', selectedPayment.ownerName || 'N/A'],
          ['Phone Number', selectedPayment.phone || 'N/A'],
          ['Vehicle Number', selectedPayment.vehicleNumber || 'N/A'],
          ['Vehicle Type', selectedPayment.vehicleType || selectedPayment.slotType || 'Car'],
          ['Slot Number', selectedPayment.slotNumber || selectedPayment.slotId || 'N/A'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      
      // Timing Details
      const finalY1 = doc.lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('PARKING DURATION', 20, finalY1);
      
      autoTable(doc, {
        startY: finalY1 + 5,
        head: [['Detail', 'Information']],
        body: [
          ['Entry Time', selectedPayment.entryTime ? new Date(selectedPayment.entryTime).toLocaleString() : 'N/A'],
          ['Exit Time', selectedPayment.exitTime ? new Date(selectedPayment.exitTime).toLocaleString() : 'N/A'],
          ['Duration', selectedPayment.hours ? `${selectedPayment.hours} hours` : 'N/A'],
          ['Exact Duration', selectedPayment.exactHours ? `${selectedPayment.exactHours}h ${selectedPayment.exactMinutes || 0}m` : 'N/A'],
          ['Price Per Hour', `₹${selectedPayment.pricePerHour || 50}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      });
      
      // Payment Details
      const finalY2 = doc.lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS', 20, finalY2);
      
      const subtotal = selectedPayment.amount || 0;
      const tax = selectedPayment.tax || Math.round(subtotal * 0.18);
      const total = selectedPayment.totalAmount || (subtotal + tax);
      
      const paymentRows = [
        ['Subtotal', `₹${subtotal}`],
        ['GST (18%)', `₹${tax}`],
        ['Total Amount', `₹${total}`],
        ['Payment Method', paymentMethod.toUpperCase()],
      ];
      
      // Add UPI ID if payment method is UPI
      if (paymentMethod === 'upi') {
        paymentRows.push(['UPI Transaction ID', upiId || 'N/A']);
        paymentRows.push(['UPI Reference', `UPI${Date.now().toString().slice(-8)}`]);
      } else if (paymentMethod === 'card') {
        paymentRows.push(['Card Type', 'VISA/MasterCard']);
        paymentRows.push(['Card Reference', `CARD${Date.now().toString().slice(-8)}`]);
      } else if (paymentMethod === 'cash') {
        paymentRows.push(['Cash Reference', `CASH${Date.now().toString().slice(-8)}`]);
        paymentRows.push(['Received By', 'Admin']);
      } else if (paymentMethod === 'wallet') {
        paymentRows.push(['Wallet Type', 'Digital Wallet']);
        paymentRows.push(['Wallet Reference', `WALLET${Date.now().toString().slice(-8)}`]);
      }
      
      autoTable(doc, {
        startY: finalY2 + 5,
        head: [['Description', 'Amount/Info']],
        body: paymentRows,
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
        foot: [['TOTAL PAID', `₹${total}`]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      });
      
      // Terms and Conditions
      const finalY3 = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Terms & Conditions:', 20, finalY3);
      doc.text('1. This is a computer generated receipt and is valid without signature.', 20, finalY3 + 5);
      doc.text('2. Payment received for parking services at Smart Parking System.', 20, finalY3 + 10);
      doc.text('3. For any disputes, please contact the parking administrator.', 20, finalY3 + 15);
      
      // Footer
      const footerY = finalY3 + 25;
      doc.setFillColor(17, 24, 39);
      doc.rect(0, footerY, 210, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Thank you for using Smart Parking System!', 105, footerY + 12, { align: 'center' });
      doc.text('This receipt is valid for payment verification.', 105, footerY + 17, { align: 'center' });
      
      // Save PDF
      const fileName = `payment_receipt_${selectedPayment.vehicleNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('Payment receipt downloaded successfully!');
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const filteredPayments = pendingPayments
    .filter(payment => {
      const matchesSearch = payment.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.exitTime) - new Date(a.exitTime);
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else if (sortBy === 'name') {
        return a.ownerName.localeCompare(b.ownerName);
      }
      return 0;
    });

  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

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
                <FaCreditCard className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Payment Processing</h1>
                <p className="text-gray-300 text-sm mt-1">Manage and process parking payments</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Total Pending</p>
                <p className="text-2xl font-bold text-white">₹{totalPendingAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Pending Transactions</p>
                <p className="text-2xl font-bold text-white">{pendingPayments.length}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Pending Payments List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              
              <div className="p-5 border-b border-gray-200" style={{ background: colors.primary.light }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: colors.primary.from }}>
                    Pending Payments
                  </h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FaFilter className="text-gray-600" />
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search vehicle or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 space-y-3 overflow-hidden"
                    >
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                        <option value="name">Sort by Name</option>
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {filteredPayments.map((payment, index) => (
                    <motion.div
                      key={payment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedPayment(payment)}
                      className={`p-5 cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedPayment?._id === payment._id
                          ? 'bg-blue-50 border-l-4'
                          : ''
                      }`}
                      style={selectedPayment?._id === payment._id ? { borderColor: colors.accent.blue } : {}}
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
                            <h4 className="font-bold text-gray-900 truncate">{payment.vehicleNumber}</h4>
                            <span className="text-lg font-bold" style={{ color: colors.accent.green }}>
                              ₹{payment.amount}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <FaUser className="mr-1 text-xs" style={{ color: colors.accent.blue }} />
                            {payment.ownerName}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 flex items-center">
                              <FaMapMarkerAlt className="mr-1" style={{ color: colors.accent.purple }} />
                              Slot {payment.slotNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.exitTime).toLocaleTimeString()}
                            </p>
                          </div>
                          
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                            <FaRegClock className="mr-1" />
                            Pending
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredPayments.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheckCircle className="text-3xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No pending payments</p>
                    <p className="text-sm text-gray-400 mt-1">All payments are completed</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Payment Processing */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {selectedPayment ? (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                >
                  {/* Success Banner */}
                  <AnimatePresence>
                    {showReceipt && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-emerald-500 text-white p-4 text-center"
                      >
                        <div className="flex items-center justify-center">
                          <FaCheckCircle className="mr-2" />
                          <span className="font-semibold">Payment Successful! Redirecting...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Header */}
                  <div className="p-6" style={{ background: `linear-gradient(to right, ${colors.primary.from}, ${colors.primary.to})` }}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <FaCreditCard className="mr-2" />
                      Process Payment
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Amount', value: `₹${selectedPayment.amount}`, icon: <FaRupeeSign /> },
                        { label: 'Vehicle', value: selectedPayment.vehicleNumber, icon: <FaCar /> },
                        { label: 'Owner', value: selectedPayment.ownerName, icon: <FaUser /> },
                        { label: 'Slot', value: selectedPayment.slotNumber, icon: <FaMapMarkerAlt /> }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-3">
                          <div className="flex items-center text-white/70 text-xs mb-1">
                            {item.icon}
                            <span className="ml-1">{item.label}</span>
                          </div>
                          <p className="text-white font-semibold truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="p-6 space-y-6">
                    
                    {/* Time Details */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaRegCalendarAlt className="mr-1" style={{ color: colors.accent.blue }} />
                          Entry Time
                        </p>
                        <p className="font-medium text-gray-800">
                          {selectedPayment.entryTime ? new Date(selectedPayment.entryTime).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaRegClock className="mr-1" style={{ color: colors.accent.orange }} />
                          Exit Time
                        </p>
                        <p className="font-medium text-gray-800">
                          {selectedPayment.exitTime ? new Date(selectedPayment.exitTime).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-700 mb-3">Customer Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Owner Name</p>
                          <p className="font-medium">{selectedPayment.ownerName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium">{selectedPayment.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Vehicle Type</p>
                          <p className="font-medium">{selectedPayment.vehicleType || selectedPayment.slotType || 'Car'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-medium">{selectedPayment.hours || 1} hours</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'cash', label: 'Cash', icon: <FaMoneyBillWave />, color: colors.accent.green },
                          { id: 'card', label: 'Card', icon: <FaCreditCard />, color: colors.accent.blue },
                          { id: 'upi', label: 'UPI', icon: <FaGooglePay />, color: colors.accent.purple },
                          { id: 'wallet', label: 'Wallet', icon: <FaWallet />, color: colors.accent.orange },
                        ].map((method) => (
                          <motion.button
                            key={method.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setPaymentMethod(method.id);
                              setShowQR(method.id === 'upi');
                            }}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              paymentMethod === method.id
                                ? 'border-gray-900 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={paymentMethod === method.id ? { backgroundColor: colors.primary.light } : {}}
                          >
                            <div className="text-2xl mb-2" style={{ color: method.color }}>
                              {method.icon}
                            </div>
                            <p className="font-medium text-sm" style={{ color: colors.neutral[700] }}>
                              {method.label}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* UPI QR Code */}
                    <AnimatePresence>
                      {paymentMethod === 'upi' && showQR && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200"
                        >
                          <div className="text-center">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Scan QR Code to Pay</h4>
                            <div className="flex justify-center mb-4">
                              <div className="bg-white p-4 rounded-2xl shadow-lg">
                                <QRCode 
                                  value={`upi://pay?pa=${upiId || 'merchant@okhdfcbank'}&pn=ParkingSystem&am=${selectedPayment.amount}&cu=INR`}
                                  size={180}
                                  level="H"
                                  includeMargin={true}
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              placeholder="Enter UPI ID (e.g., merchant@okhdfcbank)"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Price Summary */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">₹{selectedPayment.amount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">GST (18%)</span>
                          <span className="font-medium">₹{selectedPayment.tax || Math.round((selectedPayment.amount || 0) * 0.18)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300">
                          <span className="font-semibold text-gray-800">Total Amount</span>
                          <span className="text-xl font-bold" style={{ color: colors.accent.green }}>
                            ₹{selectedPayment.totalAmount || (selectedPayment.amount + Math.round((selectedPayment.amount || 0) * 0.18))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - UPDATED with PDF button */}
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePayment}
                        disabled={processing}
                        className="flex-1 py-4 px-6 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center min-w-[200px] transition-all disabled:opacity-50"
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
                            <FaCheckCircle className="mr-2" />
                            Process Payment
                          </>
                        )}
                      </motion.button>
                      
                      {/* ✅ NEW: PDF Download Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generatePaymentPDF}
                        className="px-6 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg flex items-center"
                      >
                        <FaFilePdf className="mr-2" />
                        Receipt PDF
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.print()}
                        className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center"
                      >
                        <FaPrintIcon className="mr-2" />
                        Print
                      </motion.button>
                    </div>

                    {/* Receipt Preview */}
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                        <h4 className="font-semibold text-gray-700 flex items-center">
                          <FaReceipt className="mr-2" style={{ color: colors.accent.purple }} />
                          Receipt Preview
                        </h4>
                      </div>
                      <div className="p-4 bg-gray-900">
                        <pre className="text-emerald-400 font-mono text-xs sm:text-sm whitespace-pre-wrap">
{`┌─────────────────────────────────┐
│      PARKING RECEIPT            │
├─────────────────────────────────┤
│ Receipt: ${(selectedPayment._id?.slice(-8).toUpperCase() || 'N/A').padEnd(16)} │
│ Date: ${new Date().toLocaleDateString().padEnd(18)} │
│ Time: ${new Date().toLocaleTimeString().padEnd(18)} │
├─────────────────────────────────┤
│ Vehicle: ${(selectedPayment.vehicleNumber || 'N/A').padEnd(18)} │
│ Owner: ${(selectedPayment.ownerName || 'N/A').substring(0, 15).padEnd(19)} │
│ Phone: ${(selectedPayment.phone || 'N/A').padEnd(19)} │
│ Slot: ${(selectedPayment.slotNumber || 'N/A').padEnd(22)} │
├─────────────────────────────────┤
│ Entry: ${selectedPayment.entryTime ? new Date(selectedPayment.entryTime).toLocaleTimeString().padEnd(18) : 'N/A'.padEnd(18)} │
│ Exit:  ${selectedPayment.exitTime ? new Date(selectedPayment.exitTime).toLocaleTimeString().padEnd(18) : 'N/A'.padEnd(18)} │
├─────────────────────────────────┤
│ Subtotal: ₹${(selectedPayment.amount || 0).toString().padEnd(18)} │
│ GST (18%): ₹${(selectedPayment.tax || Math.round((selectedPayment.amount || 0) * 0.18)).toString().padEnd(14)} │
│ Total: ₹${(selectedPayment.totalAmount || (selectedPayment.amount + Math.round((selectedPayment.amount || 0) * 0.18))).toString().padEnd(19)} │
├─────────────────────────────────┤
│ Method: ${(paymentMethod || 'CASH').toUpperCase().padEnd(20)} │
│ Status: PAID${' '.repeat(17)}│
├─────────────────────────────────┤
│   Thank you for parking with us! │
└─────────────────────────────────┘`}
                        </pre>
                      </div>
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
                    <FaCreditCard className="text-4xl" style={{ color: colors.primary.from }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Payment Selected</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Select a payment from the list to process and generate receipt
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                    {[
                      'Click on any pending payment',
                      'Choose payment method',
                      'Generate receipt'
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

export default Payment;