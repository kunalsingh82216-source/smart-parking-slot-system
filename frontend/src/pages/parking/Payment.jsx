import React, { useState, useEffect } from 'react';
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
  FaPhoneAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Payment = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showQR, setShowQR] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/payment/pending',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingPayments(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending payments');
    }
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast.error('Please select a payment');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/payment/process',
        {
          paymentId: selectedPayment._id,
          method: paymentMethod,
          upiId: paymentMethod === 'upi' ? upiId : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Payment processed successfully!');
      setShowReceipt(true);
      
      setTimeout(() => {
        setSelectedPayment(null);
        setPaymentMethod('cash');
        setShowQR(false);
        setShowReceipt(false);
        fetchPendingPayments();
      }, 3000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const generatePDF = () => {
    if (!selectedPayment) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PARKING RECEIPT', 105, 25, { align: 'center' });
    
    // Receipt Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Receipt No: ${selectedPayment._id.slice(-8).toUpperCase()}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 57);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 64);
    
    // Customer Details Table
    doc.autoTable({
      startY: 75,
      head: [['Vehicle Details', 'Information']],
      body: [
        ['Vehicle Number', selectedPayment.vehicleNumber],
        ['Owner Name', selectedPayment.ownerName],
        ['Phone', selectedPayment.phone || 'N/A'],
        ['Slot Number', selectedPayment.slotNumber],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    // Timing Details
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Timing Details', '']],
      body: [
        ['Entry Time', new Date(selectedPayment.entryTime).toLocaleString()],
        ['Exit Time', new Date(selectedPayment.exitTime).toLocaleString()],
        ['Duration', `${Math.ceil((new Date(selectedPayment.exitTime) - new Date(selectedPayment.entryTime)) / (1000 * 60 * 60))} hours`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    // Payment Details
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Payment Details', '']],
      body: [
        ['Amount', `₹${selectedPayment.amount}`],
        ['Payment Method', paymentMethod.toUpperCase()],
        ['Status', 'PAID'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      foot: [['Total Amount', `₹${selectedPayment.amount}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFillColor(79, 70, 229);
    doc.rect(0, finalY, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Thank you for parking with us! Visit again.', 105, finalY + 12, { align: 'center' });
    
    // Save PDF
    doc.save(`receipt_${selectedPayment.vehicleNumber}_${Date.now()}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const filteredPayments = pendingPayments.filter(payment =>
    payment.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'cash': return <FaMoneyBillWave className="text-2xl" />;
      case 'card': return <FaCreditCard className="text-2xl" />;
      case 'upi': return <FaMobileAlt className="text-2xl" />;
      case 'wallet': return <FaWallet className="text-2xl" />;
      default: return <FaRupeeSign className="text-2xl" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Payment Processing</h1>
              <p className="text-indigo-100">Process payments securely and generate receipts</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">₹{pendingPayments.reduce((sum, p) => sum + p.amount, 0)}</div>
              <p className="text-indigo-100">Pending Amount</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Payments List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <FaClock className="mr-2" />
                Pending Payments
                <span className="ml-auto bg-white text-indigo-600 px-3 py-1 rounded-full text-sm">
                  {pendingPayments.length}
                </span>
              </h3>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search by vehicle or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {filteredPayments.map((payment, index) => (
                  <motion.div
                    key={payment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedPayment(payment)}
                    className={`p-6 cursor-pointer transition-all hover:bg-indigo-50 ${
                      selectedPayment?._id === payment._id
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <FaCar />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-800">{payment.vehicleNumber}</h4>
                          <span className="text-2xl font-bold text-green-600">₹{payment.amount}</span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <FaUser className="mr-1 text-xs" />
                          {payment.ownerName}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaMapMarkerAlt className="mr-1" />
                            Slot {payment.slotNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.exitTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredPayments.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTimesCircle className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-500">No pending payments found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Payment Processing Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          {selectedPayment ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Success Animation */}
              <AnimatePresence>
                {showReceipt && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-green-500 text-white p-4 text-center"
                  >
                    <FaCheckCircle className="inline mr-2" />
                    Payment Successful! Redirecting...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h3 className="text-2xl font-bold text-white mb-4">Process Payment</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-indigo-200 text-sm">Amount</p>
                    <p className="text-3xl font-bold text-white">₹{selectedPayment.amount}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-indigo-200 text-sm">Vehicle</p>
                    <p className="text-xl font-bold text-white">{selectedPayment.vehicleNumber}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-indigo-200 text-sm">Owner</p>
                    <p className="text-xl font-bold text-white">{selectedPayment.ownerName}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-indigo-200 text-sm">Slot</p>
                    <p className="text-xl font-bold text-white">{selectedPayment.slotNumber}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Payment Methods */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Select Payment Method</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'cash', label: 'Cash', icon: <FaMoneyBillWave />, color: 'green' },
                      { id: 'card', label: 'Card', icon: <FaCreditCard />, color: 'blue' },
                      { id: 'upi', label: 'UPI', icon: <FaGooglePay />, color: 'purple' },
                      { id: 'wallet', label: 'Wallet', icon: <FaWallet />, color: 'orange' },
                    ].map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setPaymentMethod(method.id);
                          setShowQR(method.id === 'upi');
                        }}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === method.id
                            ? `border-${method.color}-500 bg-${method.color}-50 shadow-lg`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`text-3xl mb-2 text-${method.color}-600`}>
                          {method.icon}
                        </div>
                        <p className={`font-semibold text-${method.color}-600`}>{method.label}</p>
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
                      className="mb-8 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200"
                    >
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">Scan QR Code to Pay</h4>
                        <div className="flex justify-center mb-6">
                          <div className="bg-white p-4 rounded-2xl shadow-xl">
                            <QRCode 
                              value={`upi://pay?pa=${upiId || 'merchant@okhdfcbank'}&pn=ParkingSystem&am=${selectedPayment.amount}&cu=INR`}
                              size={200}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                        </div>
                        <div className="max-w-md mx-auto">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter UPI ID
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., merchant@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center min-w-[200px]"
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
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generatePDF}
                    className="bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    PDF
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg flex items-center"
                  >
                    <FaPrint className="mr-2" />
                    Print
                  </motion.button>
                </div>

                {/* Receipt Preview */}
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-700 flex items-center">
                      <FaReceipt className="mr-2" />
                      Receipt Preview
                    </h4>
                  </div>
                  <div className="p-6 bg-gray-900">
                    <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                      {`══════════════════════════════
     PARKING RECEIPT
══════════════════════════════
Receipt: ${selectedPayment._id.slice(-8).toUpperCase()}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
────────────────────────────
Vehicle: ${selectedPayment.vehicleNumber}
Owner: ${selectedPayment.ownerName}
Slot: ${selectedPayment.slotNumber}
────────────────────────────
Entry: ${new Date(selectedPayment.entryTime).toLocaleString()}
Exit: ${new Date(selectedPayment.exitTime).toLocaleString()}
────────────────────────────
Amount: ₹${selectedPayment.amount}
Method: ${paymentMethod.toUpperCase()}
Status: PAID
────────────────────────────
Thank you for parking with us!
══════════════════════════════`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaReceipt className="text-4xl text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Payment Selected</h3>
              <p className="text-gray-600 mb-6">Select a payment from the list to process</p>
              <div className="text-sm text-gray-500">
                <p>• Click on any pending payment to view details</p>
                <p>• Choose your preferred payment method</p>
                <p>• Generate receipt after successful payment</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;