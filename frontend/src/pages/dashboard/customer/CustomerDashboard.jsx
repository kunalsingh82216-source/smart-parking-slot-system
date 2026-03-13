import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { FaCar, FaParking, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CustomerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  const { data: dashboardData, isLoading } = useQuery(
    'customerDashboard',
    async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/customer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  );

  const stats = [
    {
      title: 'Active Parking',
      value: dashboardData?.activeParkings || 0,
      icon: <FaCar className="text-2xl" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Available Slots',
      value: dashboardData?.availableSlots || 0,
      icon: <FaParking className="text-2xl" />,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Total Spent',
      value: `₹${dashboardData?.totalSpent || 0}`,
      icon: <FaMoneyBillWave className="text-2xl" />,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    },
    {
      title: 'Parking History',
      value: dashboardData?.parkingHistory || 0,
      icon: <FaHistory className="text-2xl" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    }
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Parking Hours',
        data: [2, 4, 3, 5, 6, 8, 4],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const vehicleData = {
    labels: ['Car', 'Bike', 'Truck'],
    datasets: [
      {
        data: [60, 25, 15],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ]
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        <p className="mt-2 opacity-90">Manage your vehicle parking efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <div className="text-white">{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <h3 className="text-xl font-semibold mb-4">Weekly Parking Activity</h3>
          <Line data={chartData} />
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <h3 className="text-xl font-semibold mb-4">Vehicle Distribution</h3>
          <div className="h-64">
            <Doughnut data={vehicleData} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">Date & Time</th>
                <th className="p-3 text-left">Vehicle</th>
                <th className="p-3 text-left">Slot</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentActivities?.map((activity, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{new Date(activity.entryTime).toLocaleString()}</td>
                  <td className="p-3">{activity.vehicleNumber}</td>
                  <td className="p-3">{activity.slotNumber}</td>
                  <td className="p-3">{activity.duration}</td>
                  <td className="p-3">₹{activity.amount}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      activity.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;