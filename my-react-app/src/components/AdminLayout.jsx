import React from 'react';
import AdminSidebar from './AdminSidebar';
import './AdminSidebar.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 