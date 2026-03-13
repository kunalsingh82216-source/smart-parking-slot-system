import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaCar,
  FaSignOutAlt,
  FaChartBar,
  FaUserPlus,
  FaParking,
  FaMoneyBillWave,
  FaUser,
  FaCog,
  FaUsers,
  FaCreditCard
} from 'react-icons/fa';

const Sidebar = ({ role }) => {

  // CUSTOMER LINKS
  const customerLinks = [
    { to: '/customer', icon: <FaHome />, label: 'Dashboard' },
    { to: '/customer/entry', icon: <FaCar />, label: 'Vehicle Entry' },
    { to: '/customer/exit', icon: <FaSignOutAlt />, label: 'Vehicle Exit' },
    { to: '/customer/payment', icon: <FaMoneyBillWave />, label: 'Payment' },
    { to: '/customer/slots', icon: <FaParking />, label: 'View Slots' },
  ];

  // ADMIN LINKS (UPDATED ✅)
  const adminLinks = [
    { to: '/admin/dashboard', icon: <FaHome />, label: 'Dashboard' },

    // ✅ Added Vehicle Entry & Exit
    { to: '/customer/entry', icon: <FaCar />, label: 'Vehicle Entry' },
    { to: '/customer/exit', icon: <FaSignOutAlt />, label: 'Vehicle Exit' },

    { to: '/admin/add-slot', icon: <FaParking />, label: 'Add Slot' },
    { to: '/admin/slots', icon: <FaParking />, label: 'View Slots' },
    { to: '/admin/reports', icon: <FaChartBar />, label: 'Reports' },
    { to: '/admin/payment', icon: <FaCreditCard />, label: 'Payment' },
    { to: '/admin/users', icon: <FaUsers />, label: 'User View' },
    { to: '/admin/profile', icon: <FaUser />, label: 'Profile' },
    { to: '/admin/settings', icon: <FaCog />, label: 'Settings' },
    { to: '/customer-signup', icon: <FaUserPlus />, label: 'Add Customer' },
  ];

  // MANAGER LINKS
  const managerLinks = [
    { to: '/manager', icon: <FaHome />, label: 'Dashboard' },
    { to: '/manager/reports', icon: <FaChartBar />, label: 'Reports' },
    { to: '/customer/entry', icon: <FaCar />, label: 'Vehicle Entry' },
    { to: '/customer/exit', icon: <FaSignOutAlt />, label: 'Vehicle Exit' },
    { to: '/customer/payment', icon: <FaMoneyBillWave />, label: 'Payment' },
    { to: '/customer/slots', icon: <FaParking />, label: 'View Slots' },
  ];

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'manager'
      ? managerLinks
      : customerLinks;

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white shadow-lg">
      
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold tracking-wide text-yellow-400">
          Parking System
        </h2>
      </div>

      <nav className="mt-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-3 mx-3 my-1 rounded-lg transition-all duration-300
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-gray-800 hover:pl-8'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;