import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserTie, FaSignOutAlt, FaCar, FaParking, 
  FaMoneyBillWave, FaChartBar, FaUsers, FaClipboardList,
  FaSearch, FaFilter, FaDownload, FaEye,
  FaCalendarAlt, FaClock, FaExclamationTriangle
} from 'react-icons/fa';

import toast from 'react-hot-toast';



const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeParkings: 0,
    todayRevenue: 0,
    availableSlots: 0,
    todayEntries: 0
  });
  const [activeParkings, setActiveParkings] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'manager') {
      navigate('/manager/login');
      return;
    }
    setUser(userData);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activeRes, entriesRes] = await Promise.all([
        api.get('/manager/stats'),
        api.get('/manager/active-parkings'),
        api.get('/manager/recent-entries?limit=5')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (activeRes.data.success) setActiveParkings(activeRes.data.data);
      if (entriesRes.data.success) setRecentEntries(entriesRes.data.data);
    } catch (error) {
      console.error('Error fetching manager data:', error);
      toast.error('Failed to load manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/manager/login');
  };

  const handleViewDetails = (parkingId) => {
    // Implement view details
    toast.success('View details functionality coming soon');
  };

  const handleCheckout = (parkingId) => {
    // Implement checkout
    toast.success('Checkout functionality coming soon');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateDuration = (entryTime) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffHours = Math.floor((now - entry) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((now - entry) / (1000 * 60)) % 60;
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading manager dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="main-content">
        <Header 
          title="Manager Dashboard"
          showSearch={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section manager">
            <div className="welcome-text">
              <h1>Welcome, Manager {user?.name}</h1>
              <p>Monitor parking operations and manage daily activities</p>
            </div>
            <div className="user-avatar manager">
              <FaUserTie size={40} />
              <span className="user-badge">Manager</span>
            </div>
          </div>

          {/* Manager Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon primary">
                <FaCar />
              </div>
              <div className="stat-info">
                <h3>{stats.activeParkings}</h3>
                <p>Active Parkings</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">
                <FaMoneyBillWave />
              </div>
              <div className="stat-info">
                <h3>{formatCurrency(stats.todayRevenue)}</h3>
                <p>Today's Revenue</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <FaParking />
              </div>
              <div className="stat-info">
                <h3>{stats.availableSlots}</h3>
                <p>Available Slots</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon info">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h3>{stats.todayEntries}</h3>
                <p>Today's Entries</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="section">
            <div className="section-header">
              <h2>Manager Actions</h2>
              <p className="section-subtitle">Quick access to daily operations</p>
            </div>
            <div className="actions-grid">
              <button className="action-btn primary" onClick={() => navigate('/manager/entries')}>
                <FaCar className="action-icon" />
                <span>New Entry</span>
              </button>
              
              <button className="action-btn success" onClick={() => navigate('/manager/exits')}>
                <FaSignOutAlt className="action-icon" />
                <span>Process Exit</span>
              </button>
              
              <button className="action-btn warning" onClick={() => navigate('/manager/slots')}>
                <FaParking className="action-icon" />
                <span>View Slots</span>
              </button>
              
              <button className="action-btn info" onClick={() => navigate('/manager/reports')}>
                <FaChartBar className="action-icon" />
                <span>Daily Report</span>
              </button>
              
              <button className="action-btn dark" onClick={() => navigate('/manager/payments')}>
                <FaMoneyBillWave className="action-icon" />
                <span>Payment Records</span>
              </button>
              
              <button className="action-btn secondary" onClick={() => navigate('/manager/attendance')}>
                <FaClipboardList className="action-icon" />
                <span>Staff Attendance</span>
              </button>
            </div>
          </div>

          {/* Active Parkings */}
          <div className="section">
            <div className="section-header">
              <h2>Currently Parked Vehicles</h2>
              <div className="header-actions">
                <span className="badge">{activeParkings.length} active</span>
                <button className="btn-outline">
                  <FaFilter /> Filter
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle No.</th>
                    <th>Slot No.</th>
                    <th>Entry Time</th>
                    <th>Duration</th>
                    <th>Owner</th>
                    <th>Contact</th>
                    <th>Estimated Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeParkings.map(parking => (
                    <tr key={parking._id}>
                      <td>
                        <div className="vehicle-cell">
                          <FaCar className="icon" />
                          {parking.vehicle?.vehicleNumber || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className="slot-badge">
                          {parking.slot?.slotNumber || 'N/A'}
                        </span>
                      </td>
                      <td>{formatDate(parking.entryTime)}</td>
                      <td>
                        <span className="duration-badge">
                          <FaClock /> {calculateDuration(parking.entryTime)}
                        </span>
                      </td>
                      <td>{parking.user?.name || 'N/A'}</td>
                      <td>{parking.user?.mobile || 'N/A'}</td>
                      <td className="amount">{formatCurrency(parking.estimatedAmount || 0)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn-icon primary"
                            onClick={() => handleViewDetails(parking._id)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="action-btn-icon success"
                            onClick={() => handleCheckout(parking._id)}
                            title="Checkout"
                          >
                            <FaSignOutAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="section">
            <div className="section-header">
              <h2>Recent Vehicle Entries</h2>
              <button className="btn-outline">
                <FaDownload /> Export
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Vehicle No.</th>
                    <th>Slot No.</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map(entry => (
                    <tr key={entry._id}>
                      <td>
                        <div className="time-cell">
                          <FaCalendarAlt className="icon" />
                          {formatDate(entry.entryTime)}
                        </div>
                      </td>
                      <td>
                        <span className="vehicle-tag">
                          {entry.vehicle?.vehicleNumber || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`slot-tag ${entry.slot?.status}`}>
                          {entry.slot?.slotNumber || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`vehicle-type ${entry.vehicle?.vehicleType}`}>
                          {entry.vehicle?.vehicleType || 'N/A'}
                        </span>
                      </td>
                      <td>{entry.user?.name || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${entry.status}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts and Notifications */}
          <div className="section">
            <div className="section-header">
              <h2>Alerts & Notifications</h2>
              <FaExclamationTriangle className="alert-icon" />
            </div>
            <div className="alerts-container">
              <div className="alert-card warning">
                <div className="alert-header">
                  <FaExclamationTriangle />
                  <h3>Maintenance Required</h3>
                </div>
                <p>Slot GF-C-05 requires maintenance. Scheduled for tomorrow.</p>
              </div>
              
              <div className="alert-card info">
                <div className="alert-header">
                  <FaClock />
                  <h3>Peak Hours Alert</h3>
                </div>
                <p>Peak hours approaching (5 PM - 8 PM). Ensure sufficient staff.</p>
              </div>
              
              <div className="alert-card success">
                <div className="alert-header">
                  <FaMoneyBillWave />
                  <h3>Revenue Target</h3>
                </div>
                <p>Daily revenue target achieved! Current: ₹25,430 / ₹20,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>Manager Dashboard | Shift: Day Shift | Today: {new Date().toLocaleDateString()}</p>
          <div className="footer-links">
            <span>Active Parkings: {stats.activeParkings}</span>
            <span>Available Slots: {stats.availableSlots}</span>
            <span>Today's Revenue: {formatCurrency(stats.todayRevenue)}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ManagerDashboard;