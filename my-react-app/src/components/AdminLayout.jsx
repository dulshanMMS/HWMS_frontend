import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => (
  <div className="flex h-screen w-screen overflow-hidden">
    <div className="w-64 flex-none">
      <AdminSidebar />
    </div>
    <div className="flex-1 bg-gray-100 overflow-y-auto p-10">
      {children}
    </div>
  </div>
);

export default AdminLayout; 