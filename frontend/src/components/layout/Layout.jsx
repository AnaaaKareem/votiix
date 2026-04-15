import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
