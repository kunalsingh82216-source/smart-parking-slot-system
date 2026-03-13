import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaChartBar, 
  FaFilePdf, 
  FaDownload, 
  FaPrint, 
  FaFilter,
  FaRupeeSign,
  FaCar,
  FaUsers,
  FaClock,
  FaCalendarAlt,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaChartPie,
  FaChartLine,
  FaChartArea,
  FaTable,
  FaFileExcel,
  FaFileCsv,
  FaEnvelope,
  FaShare,
  FaEye,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegChartBar,
  FaRegBuilding,
  FaRegCreditCard,
  FaWallet,
  FaMoneyBillWave,
  FaGooglePay,
  FaTruck,
  FaMotorcycle,
  FaUserTie,
  FaStar,
  FaAward,
  FaDownload as FaDownloadIcon,
  FaPrint as FaPrintIcon,
  FaFilePdf as FaFilePdfIcon,
  FaUser,
  FaPhone,
  FaIdCard,
  FaHistory,
  FaPaperPlane,
  FaMailBulk,
  FaWhatsapp,
  FaSms,
  FaCopy,
  FaExternalLinkAlt,
  FaReply,
  FaReplyAll,
  FaForward,
  FaTrash,
  FaStar as FaStarIcon,
  FaStarHalf,
  FaRegStar,
  FaPaperclip,
  FaImage,
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileWord,
  FaFileExcel as FaFileExcelIcon,
  FaFilePdf as FaFilePdfIcon2,
  FaInbox,
  FaPaperPlane as FaSentIcon,
  FaRegSave,  // ✅ FIXED: Using FaRegSave instead of FaSave
  FaSpam,
  FaTrashAlt,
  FaArchive,
  FaTag,
  FaBell,
  FaBellSlash,
  FaCheckDouble,
  FaUndoAlt,
  FaRedoAlt,
  FaCog,
  FaQuestionCircle,
  FaTimesCircle as FaTimesCircleIcon
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Report = () => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChart, setSelectedChart] = useState('bar');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('today');
  
  // Search and Filter
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [allVehicles, setAllVehicles] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  
  // Email States - Gmail Style
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailView, setEmailView] = useState('compose'); // compose, inbox, sent, drafts, trash
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
    cc: '',
    bcc: '',
    attachments: [],
    isStarred: false,
    isImportant: false,
    labels: []
  });
  
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emailTemplate, setEmailTemplate] = useState('thankyou');
  const [emailCopied, setEmailCopied] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyData, setReplyData] = useState({
    to: '',
    subject: '',
    message: ''
  });

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

  useEffect(() => {
    generateReportFromLocal();
    loadEmailHistory();
  }, []);

  // Load email history from localStorage
  const loadEmailHistory = () => {
    const history = JSON.parse(localStorage.getItem('emailHistory')) || [];
    setEmailHistory(history);
  };

  // Save email to history
  const saveEmailToHistory = (emailData, folder = 'sent') => {
    const history = JSON.parse(localStorage.getItem('emailHistory')) || [];
    const newEntry = {
      ...emailData,
      id: `EMAIL${Date.now()}${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString(),
      status: 'sent',
      folder,
      read: false,
      starred: emailData.isStarred || false,
      important: emailData.isImportant || false,
      labels: emailData.labels || []
    };
    history.push(newEntry);
    localStorage.setItem('emailHistory', JSON.stringify(history));
    setEmailHistory(history);
    return newEntry;
  };

  // Generate professional thank you email template
  const generateThankYouEmail = (payment) => {
    const paymentMethod = payment.paymentMethod || 'CASH';
    const totalAmount = payment.totalAmount || payment.amount || 0;
    const subtotal = payment.amount || 0;
    const tax = payment.tax || Math.round(subtotal * 0.18);
    
    let paymentEmoji = '💰';
    if (paymentMethod === 'upi') paymentEmoji = '📱';
    if (paymentMethod === 'card') paymentEmoji = '💳';
    if (paymentMethod === 'cash') paymentEmoji = '💵';
    
    const subject = `🧾 Payment Confirmation - ${payment.vehicleNumber} - Smart Parking System`;
    
    const message = `
Dear ${payment.ownerName},

Thank you for choosing Smart Parking System! Your payment has been successfully processed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PARKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Vehicle Number : ${payment.vehicleNumber}
👤 Owner Name     : ${payment.ownerName}
📞 Phone Number   : ${payment.phone || 'N/A'}
🅿️ Slot Number    : ${payment.slotNumber || payment.slotId || 'N/A'}
⏰ Entry Time     : ${payment.entryTime ? new Date(payment.entryTime).toLocaleString() : 'N/A'}
⏱️ Exit Time      : ${payment.exitTime ? new Date(payment.exitTime).toLocaleString() : 'N/A'}
⌛ Duration       : ${payment.hours || 1} hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 Subtotal       : ₹${subtotal}
📊 GST (18%)      : ₹${tax}
💳 Total Amount   : ₹${totalAmount}
🪙 Payment Method : ${paymentMethod.toUpperCase()}
🆔 Transaction ID : ${payment.transactionId || `TXN${Date.now().toString().slice(-8)}`}
📅 Payment Date   : ${payment.paidAt ? new Date(payment.paidAt).toLocaleString() : new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email  : support@smartparking.com
📞 Phone  : +91 98765 43210
📍 Address: Smart Parking System, Mumbai

We look forward to serving you again!

Best regards,
Team Smart Parking
🚗 Smart Parking Management System
    `;
    
    return { subject, message };
  };

  // Generate WhatsApp message
  const generateWhatsAppMessage = (payment) => {
    const totalAmount = payment.totalAmount || payment.amount || 0;
    const message = `🚗 *Smart Parking System* - Payment Confirmation\n\n` +
      `Dear ${payment.ownerName},\n\n` +
      `✅ Your payment has been successfully processed.\n\n` +
      `*Parking Details:*\n` +
      `📍 Vehicle: ${payment.vehicleNumber}\n` +
      `🅿️ Slot: ${payment.slotNumber || payment.slotId}\n` +
      `⏰ Entry: ${payment.entryTime ? new Date(payment.entryTime).toLocaleString() : 'N/A'}\n` +
      `⏱️ Exit: ${payment.exitTime ? new Date(payment.exitTime).toLocaleString() : 'N/A'}\n\n` +
      `*Payment Details:*\n` +
      `💰 Amount: ₹${totalAmount}\n` +
      `💳 Method: ${(payment.paymentMethod || 'CASH').toUpperCase()}\n\n` +
      `Thank you for choosing Smart Parking! 🌟`;
    
    return message;
  };

  // Handle send email
  const handleSendEmail = async () => {
    if (!emailData.to) {
      toast.error('Please enter email address');
      return;
    }

    setSendingEmail(true);

    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to history
      const savedEmail = saveEmailToHistory({
        ...emailData,
        customerName: selectedVehicle?.ownerName,
        vehicleNumber: selectedVehicle?.vehicleNumber,
        amount: selectedVehicle?.totalAmount || selectedVehicle?.amount,
        paymentMethod: selectedVehicle?.paymentMethod,
        from: 'admin@smartparking.com',
        type: 'manual'
      }, 'sent');
      
      toast.success(
        <div className="flex items-center">
          <FaCheckCircle className="text-green-500 mr-2" />
          <div>
            <p className="font-semibold">Email Sent Successfully!</p>
            <p className="text-xs">To: {emailData.to}</p>
            <p className="text-xs">Vehicle: {selectedVehicle?.vehicleNumber}</p>
          </div>
        </div>
      );
      
      setEmailView('inbox');
      setSelectedEmail(savedEmail);
      
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle reply to email
  const handleReply = (email) => {
    setReplyData({
      to: email.from || email.to,
      subject: `Re: ${email.subject}`,
      message: `\n\n\n-------- Original Message --------\nFrom: ${email.from || 'admin@smartparking.com'}\nDate: ${new Date(email.sentAt).toLocaleString()}\nSubject: ${email.subject}\n\n${email.message}`
    });
    setShowReply(true);
  };

  // Handle reply all
  const handleReplyAll = (email) => {
    setReplyData({
      to: email.from || email.to,
      cc: email.cc || '',
      subject: `Re: ${email.subject}`,
      message: `\n\n\n-------- Original Message --------\nFrom: ${email.from || 'admin@smartparking.com'}\nDate: ${new Date(email.sentAt).toLocaleString()}\nSubject: ${email.subject}\n\n${email.message}`
    });
    setShowReply(true);
  };

  // Handle forward
  const handleForward = (email) => {
    setReplyData({
      to: '',
      subject: `Fwd: ${email.subject}`,
      message: `\n\n\n-------- Forwarded Message --------\nFrom: ${email.from || 'admin@smartparking.com'}\nDate: ${new Date(email.sentAt).toLocaleString()}\nSubject: ${email.subject}\n\n${email.message}`
    });
    setShowReply(true);
  };

  // Handle delete
  const handleDelete = (emailId) => {
    const updatedHistory = emailHistory.map(e => 
      e.id === emailId ? { ...e, folder: 'trash' } : e
    );
    localStorage.setItem('emailHistory', JSON.stringify(updatedHistory));
    setEmailHistory(updatedHistory);
    toast.success('Email moved to trash');
  };

  // Handle star toggle
  const handleStarToggle = (emailId) => {
    const updatedHistory = emailHistory.map(e => 
      e.id === emailId ? { ...e, starred: !e.starred } : e
    );
    localStorage.setItem('emailHistory', JSON.stringify(updatedHistory));
    setEmailHistory(updatedHistory);
  };

  // Handle mark as read
  const handleMarkAsRead = (emailId) => {
    const updatedHistory = emailHistory.map(e => 
      e.id === emailId ? { ...e, read: true } : e
    );
    localStorage.setItem('emailHistory', JSON.stringify(updatedHistory));
    setEmailHistory(updatedHistory);
  };

  // Open email modal for specific vehicle
  const openEmailModal = (payment) => {
    setSelectedVehicle(payment);
    setEmailView('compose');
    
    const { subject, message } = generateThankYouEmail(payment);
    
    // Generate email from phone number or use default
    const emailFromPhone = payment.phone ? 
      (payment.phone.includes('@') ? payment.phone : `${payment.phone}@customer.com`) : 
      '';
    
    setEmailData({
      to: emailFromPhone,
      subject,
      message,
      cc: '',
      bcc: '',
      attachments: [],
      isStarred: false,
      isImportant: false,
      labels: []
    });
    
    setEmailTemplate('thankyou');
    setShowEmailModal(true);
  };

  // Open email to view
  const openEmail = (email) => {
    setSelectedEmail(email);
    handleMarkAsRead(email.id);
    setEmailView('view');
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  // Open WhatsApp
  const openWhatsApp = (payment) => {
    const message = generateWhatsAppMessage(payment);
    const phone = payment.phone?.replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      toast.error('Phone number not available');
    }
  };

  // Filter emails based on view
  const getFilteredEmails = () => {
    let filtered = emailHistory;
    
    // Filter by folder
    if (emailView === 'inbox') {
      filtered = filtered.filter(e => e.folder === 'sent' || !e.folder);
    } else if (emailView === 'sent') {
      filtered = filtered.filter(e => e.folder === 'sent');
    } else if (emailView === 'trash') {
      filtered = filtered.filter(e => e.folder === 'trash');
    } else if (emailView === 'starred') {
      filtered = filtered.filter(e => e.starred);
    } else if (emailView === 'drafts') {
      filtered = filtered.filter(e => e.folder === 'draft');
    }
    
    // Search
    if (emailSearch) {
      filtered = filtered.filter(e => 
        e.subject?.toLowerCase().includes(emailSearch.toLowerCase()) ||
        e.to?.toLowerCase().includes(emailSearch.toLowerCase()) ||
        e.message?.toLowerCase().includes(emailSearch.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  };

  // Generate report from localStorage
  const generateReportFromLocal = () => {
    try {
      const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
      const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
      const parkingSlots = JSON.parse(localStorage.getItem('parkingSlots')) || [];
      
      const allCompletedPayments = revenueHistory.filter(p => p.status === 'completed' || p.paidAt);
      
      setAllVehicles(allCompletedPayments);
      setFilteredPayments(allCompletedPayments);
      
      const report = {
        totalRevenue: allCompletedPayments.reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0),
        totalParkings: allCompletedPayments.length,
        activeCustomers: [...new Set(allCompletedPayments.map(p => p.phone))].length,
        
        vehicleTypeDistribution: {
          car: allCompletedPayments.filter(p => p.vehicleType === 'Car' || !p.vehicleType).length,
          bike: allCompletedPayments.filter(p => p.vehicleType === 'Bike').length,
          truck: allCompletedPayments.filter(p => p.vehicleType === 'Truck').length
        },
        
        paymentMethodDistribution: {
          cash: allCompletedPayments.filter(p => p.paymentMethod === 'cash').length,
          card: allCompletedPayments.filter(p => p.paymentMethod === 'card').length,
          upi: allCompletedPayments.filter(p => p.paymentMethod === 'upi').length,
          wallet: allCompletedPayments.filter(p => p.paymentMethod === 'wallet').length
        },
        
        slotUtilization: parkingSlots.map(slot => ({
          slotId: slot.id,
          utilization: slot.status === 'Occupied' ? 100 : 0
        })),
        
        topCustomers: calculateTopCustomers(allCompletedPayments),
        
        hourlyDistribution: calculateHourlyDistribution(allCompletedPayments),
        
        dailyRevenue: calculateDailyRevenue(allCompletedPayments),
        
        summary: {
          averageRevenue: allCompletedPayments.length > 0 
            ? (allCompletedPayments.reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0) / allCompletedPayments.length).toFixed(2)
            : 0,
          peakHours: '10 AM - 2 PM',
          mostUsedSlot: findMostUsedSlot(parkingSlots),
          averageDuration: calculateAverageDuration(allCompletedPayments)
        },
        
        allPayments: allCompletedPayments,
        customerPayments: filteredPayments,
        emailHistory
      };
      
      setReportData(report);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report from local data');
    }
  };

  // Search for specific vehicle
  const handleSearchVehicle = () => {
    if (!searchVehicle && !searchCustomer) {
      toast.error('Please enter vehicle number or customer name');
      return;
    }

    const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
    const allCompletedPayments = revenueHistory.filter(p => p.status === 'completed' || p.paidAt);
    
    let filtered = allCompletedPayments;
    
    if (searchVehicle) {
      filtered = filtered.filter(p => 
        p.vehicleNumber?.toLowerCase().includes(searchVehicle.toLowerCase())
      );
    }
    
    if (searchCustomer) {
      filtered = filtered.filter(p => 
        p.ownerName?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        p.phone?.includes(searchCustomer)
      );
    }
    
    setFilteredPayments(filtered);
    
    if (filtered.length === 1) {
      setSelectedVehicle(filtered[0]);
      toast.success(`Found vehicle: ${filtered[0].vehicleNumber}`);
    } else if (filtered.length > 1) {
      toast.success(`Found ${filtered.length} vehicles`);
    } else {
      toast.error('No vehicles found');
    }
    
    if (reportData) {
      setReportData({
        ...reportData,
        customerPayments: filtered
      });
    }
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchVehicle('');
    setSearchCustomer('');
    setSelectedVehicle(null);
    
    const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
    const allCompletedPayments = revenueHistory.filter(p => p.status === 'completed' || p.paidAt);
    
    setFilteredPayments(allCompletedPayments);
    
    if (reportData) {
      setReportData({
        ...reportData,
        customerPayments: allCompletedPayments
      });
    }
    
    toast.success('Showing all vehicles');
  };

  // Download PDF for SPECIFIC vehicle
  const downloadSingleVehiclePDF = (payment) => {
    if (!payment) {
      toast.error('No vehicle selected');
      return;
    }

    try {
      const doc = new jsPDF();
      
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('VEHICLE REPORT', 105, 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 35, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Details', 20, 55);
      
      autoTable(doc, {
        startY: 60,
        head: [['Field', 'Information']],
        body: [
          ['Vehicle Number', payment.vehicleNumber || 'N/A'],
          ['Owner Name', payment.ownerName || 'N/A'],
          ['Phone Number', payment.phone || 'N/A'],
          ['Slot Number', payment.slotNumber || payment.slotId || 'N/A'],
          ['Vehicle Type', payment.vehicleType || payment.slotType || 'Car'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      
      const finalY1 = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Parking Details', 20, finalY1);
      
      autoTable(doc, {
        startY: finalY1 + 5,
        head: [['Detail', 'Information']],
        body: [
          ['Entry Time', payment.entryTime ? new Date(payment.entryTime).toLocaleString() : 'N/A'],
          ['Exit Time', payment.exitTime ? new Date(payment.exitTime).toLocaleString() : 'N/A'],
          ['Duration', payment.hours ? `${payment.hours} hours` : 'N/A'],
          ['Exact Duration', payment.exactHours ? `${payment.exactHours}h ${payment.exactMinutes || 0}m` : 'N/A'],
          ['Price Per Hour', `₹${payment.pricePerHour || 50}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      });
      
      const finalY2 = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Details', 20, finalY2);
      
      const subtotal = payment.amount || 0;
      const tax = payment.tax || Math.round(subtotal * 0.18);
      const total = payment.totalAmount || (subtotal + tax);
      
      autoTable(doc, {
        startY: finalY2 + 5,
        head: [['Description', 'Amount']],
        body: [
          ['Subtotal', `₹${subtotal}`],
          ['GST (18%)', `₹${tax}`],
          ['Total Amount', `₹${total}`],
          ['Payment Method', (payment.paymentMethod || 'CASH').toUpperCase()],
          ['Transaction ID', payment.transactionId || `TXN${Date.now().toString().slice(-8)}`],
          ['Payment Date', payment.paidAt ? new Date(payment.paidAt).toLocaleString() : new Date().toLocaleString()],
        ],
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
        foot: [['TOTAL PAID', `₹${total}`]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      });
      
      const footerY = doc.lastAutoTable.finalY + 15;
      doc.setFillColor(17, 24, 39);
      doc.rect(0, footerY, 210, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Thank you for using Parking Management System', 105, footerY + 12, { align: 'center' });
      
      doc.save(`vehicle_${payment.vehicleNumber}_report.pdf`);
      toast.success('Vehicle report downloaded!');
      
    } catch (error) {
      console.error('PDF Error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Download ALL vehicles PDF
  const downloadAllVehiclesPDF = () => {
    if (!reportData || !reportData.allPayments || reportData.allPayments.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const doc = new jsPDF();
      
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPLETE PARKING REPORT', 105, 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 35, { align: 'center' });
      
      let finalY = 50;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 20, finalY);
      finalY += 5;
      
      autoTable(doc, {
        startY: finalY,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', `₹${reportData.totalRevenue}`],
          ['Total Parkings', reportData.totalParkings.toString()],
          ['Active Customers', reportData.topCustomers.length.toString()],
        ],
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      });
      
      finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('All Vehicles', 20, finalY);
      finalY += 5;
      
      const vehicleRows = reportData.allPayments.map(p => [
        p.vehicleNumber || 'N/A',
        p.ownerName || 'N/A',
        p.phone || 'N/A',
        `₹${p.totalAmount || p.amount || 0}`,
        p.paymentMethod || 'N/A',
        p.exitTime ? new Date(p.exitTime).toLocaleDateString() : 'N/A'
      ]);
      
      autoTable(doc, {
        startY: finalY,
        head: [['Vehicle', 'Owner', 'Phone', 'Amount', 'Payment', 'Date']],
        body: vehicleRows,
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      });
      
      const footerY = doc.lastAutoTable.finalY + 15;
      doc.setFillColor(17, 24, 39);
      doc.rect(0, footerY, 210, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Complete Parking Report', 105, footerY + 12, { align: 'center' });
      
      doc.save('complete_parking_report.pdf');
      toast.success('Complete report downloaded!');
      
    } catch (error) {
      console.error('PDF Error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Helper functions
  const calculateTopCustomers = (payments) => {
    const customerMap = new Map();
    
    payments.forEach(p => {
      const key = p.phone || p.ownerName;
      if (!key) return;
      
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          customerId: key,
          name: p.ownerName || 'Unknown',
          phone: p.phone || 'N/A',
          visits: 0,
          totalSpent: 0,
          vehicles: new Set(),
        });
      }
      
      const customer = customerMap.get(key);
      customer.visits += 1;
      customer.totalSpent += (p.totalAmount || p.amount || 0);
      if (p.vehicleNumber) customer.vehicles.add(p.vehicleNumber);
    });
    
    return Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(c => ({
        ...c,
        vehicles: Array.from(c.vehicles).join(', '),
      }));
  };

  const calculateHourlyDistribution = (payments) => {
    const hours = Array(24).fill(0);
    payments.forEach(p => {
      if (p.exitTime) {
        const hour = new Date(p.exitTime).getHours();
        hours[hour] += 1;
      }
    });
    return hours;
  };

  const calculateDailyRevenue = (payments) => {
    const dailyMap = new Map();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      dailyMap.set(dateStr, 0);
      last7Days.push(dateStr);
    }
    
    payments.forEach(p => {
      if (p.paidAt || p.exitTime) {
        const date = new Date(p.paidAt || p.exitTime);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, dailyMap.get(dateStr) + (p.totalAmount || p.amount || 0));
        }
      }
    });
    
    return last7Days.map(day => ({
      day,
      revenue: dailyMap.get(day) || 0
    }));
  };

  const findMostUsedSlot = (slots) => 'A1';

  const calculateAverageDuration = (payments) => {
    if (payments.length === 0) return 0;
    const totalHours = payments.reduce((sum, p) => {
      if (p.hours) return sum + p.hours;
      if (p.entryTime && p.exitTime) {
        const entry = new Date(p.entryTime);
        const exit = new Date(p.exitTime);
        return sum + Math.ceil((exit - entry) / (1000 * 60 * 60));
      }
      return sum;
    }, 0);
    return (totalHours / payments.length).toFixed(1);
  };

  const generateReport = async () => {
    if (reportType === 'custom' && (!startDate || !endDate)) {
      toast.error('Please select date range');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.post(
          'http://localhost:5000/api/reports/generate',
          {
            type: reportType,
            startDate: reportType === 'custom' ? startDate : undefined,
            endDate: reportType === 'custom' ? endDate : undefined
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReportData(response.data.data);
        toast.success('Report generated successfully');
      } catch (error) {
        generateReportFromLocal();
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Revenue', `₹${reportData.totalRevenue}`],
        ['Total Parkings', reportData.totalParkings],
        ['Active Customers', reportData.topCustomers.length],
        ['Generated On', new Date().toLocaleString()]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
      
      if (filteredPayments.length > 0) {
        const vehicleData = [
          ['Vehicle Number', 'Owner Name', 'Phone', 'Slot', 'Amount', 'Payment Method', 'Date', 'Hours'],
          ...filteredPayments.map(p => [
            p.vehicleNumber,
            p.ownerName,
            p.phone,
            p.slotNumber,
            `₹${p.totalAmount || p.amount}`,
            p.paymentMethod,
            p.exitTime ? new Date(p.exitTime).toLocaleDateString() : 'N/A',
            `${p.hours || 1}h`
          ])
        ];
        
        const vehicleSheet = XLSX.utils.aoa_to_sheet(vehicleData);
        XLSX.utils.book_append_sheet(wb, vehicleSheet, 'Vehicles');
      }
      
      XLSX.writeFile(wb, `parking_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download Excel');
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: colors.neutral[700], font: { size: 12 } } },
      tooltip: { backgroundColor: colors.primary.from, titleColor: 'white', bodyColor: 'white', padding: 10 }
    }
  };

  const barChartData = {
    labels: ['Car', 'Bike', 'Truck'],
    datasets: [{
      label: 'Vehicle Distribution',
      data: reportData ? [
        reportData.vehicleTypeDistribution.car || 0,
        reportData.vehicleTypeDistribution.bike || 0,
        reportData.vehicleTypeDistribution.truck || 0
      ] : [],
      backgroundColor: [colors.accent.blue, colors.accent.purple, colors.accent.orange],
      borderRadius: 8
    }]
  };

  const pieChartData = {
    labels: ['Cash', 'Card', 'UPI', 'Wallet'],
    datasets: [{
      data: reportData ? [
        reportData.paymentMethodDistribution.cash || 0,
        reportData.paymentMethodDistribution.card || 0,
        reportData.paymentMethodDistribution.upi || 0,
        reportData.paymentMethodDistribution.wallet || 0
      ] : [],
      backgroundColor: [colors.accent.green, colors.accent.blue, colors.accent.purple, colors.accent.orange],
      borderWidth: 0
    }]
  };

  const lineChartData = {
    labels: reportData?.dailyRevenue?.map(d => d.day) || [],
    datasets: [{
      label: 'Daily Revenue',
      data: reportData?.dailyRevenue?.map(d => d.revenue) || [],
      borderColor: colors.accent.green,
      backgroundColor: `${colors.accent.green}20`,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: colors.primary.from,
      pointBorderColor: 'white'
    }]
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
                <FaChartBar className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Reports & Analytics</h1>
                <p className="text-gray-300 text-sm mt-1">Comprehensive parking performance insights</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Total Revenue</p>
                <p className="text-2xl font-bold text-white">₹{reportData?.totalRevenue || 0}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3">
                <p className="text-gray-300 text-xs">Parkings</p>
                <p className="text-2xl font-bold text-white">{reportData?.totalParkings || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaSearch className="mr-2" style={{ color: colors.accent.blue }} />
            Search Specific Vehicle
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Vehicle Number</label>
              <input
                type="text"
                value={searchVehicle}
                onChange={(e) => setSearchVehicle(e.target.value)}
                placeholder="e.g., MH12AB1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Customer Name/Phone</label>
              <input
                type="text"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder="Name or phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearchVehicle}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FaSearch className="mr-2" />
                Search
              </button>
              <button
                onClick={handleResetSearch}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
          
          {selectedVehicle && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">Selected Vehicle: {selectedVehicle.vehicleNumber}</p>
                  <p className="text-sm text-green-600">Owner: {selectedVehicle.ownerName} | Phone: {selectedVehicle.phone}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadSingleVehiclePDF(selectedVehicle)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FaFilePdf className="mr-2" />
                    PDF Report
                  </button>
                  <button
                    onClick={() => openEmailModal(selectedVehicle)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FaEnvelope className="mr-2" />
                    Send Email
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="mt-3 text-sm text-gray-500">
            {filteredPayments.length > 0 ? (
              <span>Found {filteredPayments.length} vehicle(s)</span>
            ) : (
              <span>No vehicles found</span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 sticky top-24">
              
              <div className="p-6 border-b border-gray-200" style={{ background: colors.primary.light }}>
                <h3 className="text-lg font-semibold flex items-center" style={{ color: colors.primary.from }}>
                  <FaFilter className="mr-2" />
                  Report Filters
                </h3>
              </div>

              <div className="p-6 space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['daily', 'weekly', 'monthly', 'custom'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setReportType(type)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                          reportType === type
                            ? 'text-white'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={reportType === type ? { background: colors.primary.from } : {}}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {reportType === 'custom' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['today', 'week', 'month', 'year'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-3 py-2 rounded-lg text-xs capitalize transition-all ${
                          dateRange === range
                            ? 'text-white'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={dateRange === range ? { background: colors.accent.blue } : {}}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center disabled:opacity-50"
                  style={{ background: `linear-gradient(to right, ${colors.primary.from}, ${colors.primary.to})` }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaChartBar className="mr-2" />
                      Generate Report
                    </>
                  )}
                </button>

                <button
                  onClick={generateReportFromLocal}
                  className="w-full py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  <FaRegClock className="mr-2" />
                  Load from Local Data
                </button>

                <button
                  onClick={downloadAllVehiclesPDF}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center justify-center"
                >
                  <FaFilePdf className="mr-2" />
                  Download Complete Report
                </button>

                {/* Email History Button */}
                <button
                  onClick={() => {
                    setEmailView('inbox');
                    setSelectedEmail(null);
                    setShowEmailModal(true);
                  }}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
                >
                  <FaMailBulk className="mr-2" />
                  Email Inbox ({emailHistory.filter(e => !e.read).length})
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {!reportData ? (
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
                    <FaChartBar className="text-4xl" style={{ color: colors.primary.from }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Report Generated</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Generate a report to view comprehensive parking analytics and insights
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Export Actions */}
                  <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Export as:</span>
                        <button
                          onClick={downloadAllVehiclesPDF}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm"
                        >
                          <FaFilePdf /> PDF (All)
                        </button>
                        <button
                          onClick={downloadExcel}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                        >
                          <FaFileExcel /> Excel
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                        >
                          <FaPrintIcon /> Print
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg" style={{ background: `${colors.accent.green}20` }}>
                          <FaRupeeSign style={{ color: colors.accent.green }} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-800">₹{reportData.totalRevenue}</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg" style={{ background: `${colors.accent.blue}20` }}>
                          <FaCar style={{ color: colors.accent.blue }} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Total Parkings</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.totalParkings}</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg" style={{ background: `${colors.accent.purple}20` }}>
                          <FaClock style={{ color: colors.accent.purple }} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Avg Duration</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.summary.averageDuration}h</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg" style={{ background: `${colors.accent.orange}20` }}>
                          <FaUsers style={{ color: colors.accent.orange }} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Active Customers</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.topCustomers.length}</p>
                    </motion.div>
                  </div>

                  {/* Vehicle List Table */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaCar className="mr-2" style={{ color: colors.accent.blue }} />
                      {filteredPayments.length === reportData?.allPayments?.length 
                        ? 'All Vehicles' 
                        : `Search Results (${filteredPayments.length} vehicles)`}
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="py-3 text-left text-sm font-semibold text-gray-600">Vehicle</th>
                            <th className="py-3 text-left text-sm font-semibold text-gray-600">Owner</th>
                            <th className="py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                            <th className="py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                            <th className="py-3 text-left text-sm font-semibold text-gray-600">Payment</th>
                            <th className="py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                            <th className="py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments.map((payment, index) => (
                            <motion.tr
                              key={payment._id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 font-medium">{payment.vehicleNumber || 'N/A'}</td>
                              <td className="py-3">{payment.ownerName || 'N/A'}</td>
                              <td className="py-3">{payment.phone || 'N/A'}</td>
                              <td className="py-3 font-semibold" style={{ color: colors.accent.green }}>
                                ₹{payment.totalAmount || payment.amount || 0}
                              </td>
                              <td className="py-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {payment.paymentMethod || 'CASH'}
                                </span>
                              </td>
                              <td className="py-3 text-sm">
                                {payment.exitTime ? new Date(payment.exitTime).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => downloadSingleVehiclePDF(payment)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs flex items-center"
                                    title="Download PDF"
                                  >
                                    <FaFilePdf className="mr-1" /> PDF
                                  </button>
                                  <button
                                    onClick={() => openEmailModal(payment)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs flex items-center"
                                    title="Send Email"
                                  >
                                    <FaEnvelope className="mr-1" /> Email
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {filteredPayments.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No vehicles found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Distribution</h4>
                      <div className="h-64">
                        <Bar data={barChartData} options={chartOptions} />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h4>
                      <div className="h-64">
                        <Pie data={pieChartData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Gmail-like Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gmail-style Sidebar */}
              <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                <button
                  onClick={() => {
                    setEmailView('compose');
                    setSelectedVehicle(null);
                    setEmailData({
                      to: '',
                      subject: '',
                      message: '',
                      cc: '',
                      bcc: '',
                      attachments: []
                    });
                  }}
                  className="w-full mb-4 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 flex items-center justify-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Compose
                </button>
                
                <div className="space-y-1">
                  <button
                    onClick={() => setEmailView('inbox')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${
                      emailView === 'inbox' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <FaInbox />
                    <span>Inbox</span>
                    <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {emailHistory.filter(e => !e.read).length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setEmailView('starred')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${
                      emailView === 'starred' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <FaStarIcon />
                    <span>Starred</span>
                  </button>
                  
                  <button
                    onClick={() => setEmailView('sent')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${
                      emailView === 'sent' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <FaPaperPlane />
                    <span>Sent</span>
                  </button>
                  
                  <button
                    onClick={() => setEmailView('drafts')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${
                      emailView === 'drafts' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <FaRegSave />  {/* ✅ FIXED: Using FaRegSave */}
                    <span>Drafts</span>
                  </button>
                  
                  <button
                    onClick={() => setEmailView('trash')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${
                      emailView === 'trash' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <FaTrashAlt />
                    <span>Trash</span>
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaCheckDouble />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaUndoAlt />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaRedoAlt />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaArchive />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaTrashAlt />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search emails..."
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaCog />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaQuestionCircle />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4">
                  {emailView === 'compose' ? (
                    /* Compose Email */
                    <div className="space-y-4">
                      {selectedVehicle && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-blue-800">Sending to: {selectedVehicle.ownerName}</p>
                              <p className="text-sm text-blue-600">Vehicle: {selectedVehicle.vehicleNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">₹{selectedVehicle.totalAmount || selectedVehicle.amount || 0}</p>
                              <p className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                {selectedVehicle.paymentMethod?.toUpperCase() || 'CASH'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          value={emailData.to}
                          onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                          placeholder="recipient@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CC</label>
                          <input
                            type="email"
                            value={emailData.cc}
                            onChange={(e) => setEmailData({...emailData, cc: e.target.value})}
                            placeholder="cc@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">BCC</label>
                          <input
                            type="email"
                            value={emailData.bcc}
                            onChange={(e) => setEmailData({...emailData, bcc: e.target.value})}
                            placeholder="bcc@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                          type="text"
                          value={emailData.subject}
                          onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea
                          value={emailData.message}
                          onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                          rows="12"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="Type your message here..."
                        />
                      </div>

                      {/* Attachments */}
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <FaPaperclip />
                          <span className="text-sm">Attachments</span>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          Add files...
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                          onClick={() => setShowEmailModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Discard
                        </button>
                        <button
                          onClick={handleSendEmail}
                          disabled={sendingEmail || !emailData.to}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          {sendingEmail ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <FaPaperPlane className="mr-2" />
                              Send
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : selectedEmail ? (
                    /* View Email */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{selectedEmail.subject}</h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStarToggle(selectedEmail.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            {selectedEmail.starred ? <FaStarIcon className="text-yellow-500" /> : <FaRegStar />}
                          </button>
                          <button
                            onClick={() => handleReply(selectedEmail)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Reply"
                          >
                            <FaReply />
                          </button>
                          <button
                            onClick={() => handleReplyAll(selectedEmail)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Reply All"
                          >
                            <FaReplyAll />
                          </button>
                          <button
                            onClick={() => handleForward(selectedEmail)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Forward"
                          >
                            <FaForward />
                          </button>
                          <button
                            onClick={() => handleDelete(selectedEmail.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                            title="Delete"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {selectedEmail.from?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-semibold">{selectedEmail.from || 'Smart Parking'}</p>
                            <p className="text-sm text-gray-500">to {selectedEmail.to}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(selectedEmail.sentAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="prose max-w-none p-4 whitespace-pre-wrap">
                        {selectedEmail.message}
                      </div>
                    </div>
                  ) : (
                    /* Email List */
                    <div className="space-y-2">
                      {getFilteredEmails().map((email) => (
                        <motion.div
                          key={email.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => openEmail(email)}
                          className={`p-4 border border-gray-200 rounded-xl hover:shadow-md cursor-pointer transition-all ${
                            !email.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="w-4 h-4" />
                            <button onClick={(e) => { e.stopPropagation(); handleStarToggle(email.id); }}>
                              {email.starred ? <FaStarIcon className="text-yellow-500" /> : <FaRegStar className="text-gray-400" />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className={`font-semibold ${!email.read ? 'text-blue-600' : ''}`}>
                                  {email.from || 'Smart Parking'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(email.sentAt).toLocaleString()}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-gray-800">{email.subject}</p>
                              <p className="text-sm text-gray-500 truncate">{email.message.substring(0, 100)}...</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Report;