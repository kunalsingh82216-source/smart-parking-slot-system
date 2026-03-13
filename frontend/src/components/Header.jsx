import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate(`/${user.role}-login`);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Parking Slot System
          </h1>
          <p className="text-sm text-gray-600">Smart Parking Management</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <FaUser className="text-white" />
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600 capitalize">{user.role}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;