import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaUserTie, FaShieldAlt, FaHome, FaCar } from 'react-icons/fa';

const ManagerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        ...formData,
        role: 'manager'
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success('Manager login successful!');
      navigate('/manager');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserTie className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Manager Login</h2>
          <p className="text-gray-600 mt-2">Access manager dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">
              <FaEnvelope className="mr-2" />
              Manager Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="manager@parking.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaLock className="mr-2" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg"
          >
            Login to Manager Dashboard
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="text-center">
            <Link to="/" className="text-purple-600 hover:underline text-sm">
              <FaHome className="inline mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="border-t pt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Access other portals:</p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/customer-login" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <FaCar className="inline mr-1" />
                Customer Portal
              </Link>
              <Link 
                to="/admin-login" 
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                <FaShieldAlt className="inline mr-1" />
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800 text-center">
            <FaShieldAlt className="inline mr-2" />
            Restricted Manager Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagerLogin;