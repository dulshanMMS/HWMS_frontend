import React from 'react';
import LeftSidebar from './LeftSidebar';

const UserLayout = ({ children }) => (
  <div className="flex h-screen w-screen overflow-hidden">
    <div className="w-64 flex-none">
      <LeftSidebar />
    </div>
    <div className="flex-1 bg-gray-100 overflow-y-auto p-10">
      {children}
    </div>
  </div>
);

export default UserLayout;