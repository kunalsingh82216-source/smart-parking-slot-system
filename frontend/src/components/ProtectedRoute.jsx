import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  try {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user) {
      return <Navigate to={`/${role}-login`} replace />;
    }

    if (role && user.role !== role) {
      return <Navigate to={`/${user.role}`} replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('user');
    return <Navigate to={`/${role}-login`} replace />;
  }
};

export default ProtectedRoute;