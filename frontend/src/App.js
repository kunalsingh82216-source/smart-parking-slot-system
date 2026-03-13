import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/App.css';

// AUTH
import CustomerLogin from './pages/auth/CustomerLogin.jsx';
import CustomerSignup from './pages/auth/CustomerSignup.jsx';
import AdminLogin from './pages/auth/AdminLogin.jsx';
import ManagerLogin from './pages/auth/ManagerLogin.jsx';

// DASHBOARD
import CustomerDashboard from './pages/dashboard/customer/CustomerDashboard.jsx';

import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';
import AdminProfile from './pages/dashboard/AdminProfile.jsx';
import AdminSettings from './pages/dashboard/AdminSettings.jsx';
import AdminPayment from './pages/dashboard/AdminPayment.jsx';
import UserView from './pages/dashboard/UserView.jsx';

import ManagerDashboard from './pages/dashboard/manager/ManagerDashboard.jsx';

// PARKING
import AddParkingSlot from './pages/parking/AddParkingslot.jsx';
import VehicleEntry from './pages/parking/VehicleEntry.jsx';
import VehicleExit from './pages/parking/VehicleExit.jsx';
import Payment from './pages/parking/Payment.jsx';
import SlotView from './pages/parking/SlotView.jsx';

// REPORT
import Report from './pages/reports/Report.jsx';

// LAYOUT
import Layout from './components/Layout.jsx';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Navigate to="/customer-login" />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-signup" element={<CustomerSignup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/manager-login" element={<ManagerLogin />} />

        {/* CUSTOMER */}
        <Route path="/customer" element={<Layout><CustomerDashboard /></Layout>} />
        <Route path="/customer/entry" element={<Layout><VehicleEntry /></Layout>} />
        <Route path="/customer/exit" element={<Layout><VehicleExit /></Layout>} />
        <Route path="/customer/payment" element={<Layout><Payment /></Layout>} />
        <Route path="/customer/slots" element={<Layout><SlotView /></Layout>} />

        {/* ADMIN */}
        <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/profile" element={<Layout><AdminProfile /></Layout>} />
        <Route path="/admin/settings" element={<Layout><AdminSettings /></Layout>} />
        <Route path="/admin/payment" element={<Layout><AdminPayment /></Layout>} />
        <Route path="/admin/users" element={<Layout><UserView /></Layout>} />
        <Route path="/admin/reports" element={<Layout><Report /></Layout>} />
        <Route path="/admin/add-slot" element={<Layout><AddParkingSlot /></Layout>} />
        <Route path="/admin/slots" element={<Layout><SlotView /></Layout>} />

        {/* MANAGER */}
        <Route path="/manager" element={<Layout><ManagerDashboard /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;