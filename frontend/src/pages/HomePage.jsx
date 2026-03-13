import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaUserTie, FaShieldAlt, FaArrowRight, FaParking, FaCreditCard, FaChartBar, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaCar className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">EZPark</h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/customer-login" className="text-blue-600 hover:text-blue-800 font-medium">
                Customer Login
              </Link>
              <Link to="/customer-signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <FaCar className="text-white text-5xl" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Smart Parking Management System
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Efficient, automated parking management with real-time tracking, digital payments, and comprehensive reporting.
          </p>
          
          {/* Customer Actions */}
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
            <Link
              to="/customer-login"
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center space-x-2"
            >
              <FaSignInAlt />
              <span>Customer Login</span>
            </Link>
            
            <Link
              to="/customer-signup"
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center space-x-2"
            >
              <FaUserPlus />
              <span>New Customer Sign Up</span>
            </Link>
          </div>

          {/* Other Portals */}
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-16">
            <Link
              to="/manager-login"
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center space-x-2"
            >
              <FaUserTie />
              <span>Manager Portal</span>
              <FaArrowRight />
            </Link>
            
            <Link
              to="/admin-login"
              className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center space-x-2"
            >
              <FaShieldAlt />
              <span>Admin Portal</span>
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Portal Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Customer Portal Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-blue-50 p-8 rounded-xl border border-blue-200 text-center">
              <FaCar className="text-4xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Vehicle Entry/Exit</h3>
              <p className="text-gray-600">Easy vehicle entry and exit management</p>
            </div>
            
            <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center">
              <FaCreditCard className="text-4xl text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Digital Payments</h3>
              <p className="text-gray-600">Multiple payment options with QR codes</p>
            </div>
            
            <div className="bg-purple-50 p-8 rounded-xl border border-purple-200 text-center">
              <FaParking className="text-4xl text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Slot Booking</h3>
              <p className="text-gray-600">Real-time slot availability and booking</p>
            </div>
            
            <div className="bg-yellow-50 p-8 rounded-xl border border-yellow-200 text-center">
              <FaChartBar className="text-4xl text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Parking History</h3>
              <p className="text-gray-600">Complete parking history and receipts</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Ready to Park?</h2>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Link
              to="/customer-login"
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Login to Customer Dashboard
            </Link>
            <Link
              to="/customer-signup"
              className="bg-gradient-to-r from-green-600 to-green-800 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2024 EZPark - Parking Management System</p>
          <p className="text-gray-400 text-sm">College Project - Smart Parking Solution</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;