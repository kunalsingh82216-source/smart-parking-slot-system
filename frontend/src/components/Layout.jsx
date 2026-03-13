import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {

  let user = {};

  const storedUser = localStorage.getItem("user");

  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid JSON in localStorage");
      localStorage.removeItem("user");
      user = {};
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role={user?.role || "customer"} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;