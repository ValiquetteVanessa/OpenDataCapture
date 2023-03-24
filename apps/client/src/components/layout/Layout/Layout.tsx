import React, { useState } from 'react';

import { Outlet } from 'react-router-dom';

import { Footer } from '../Footer';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';

export const Layout = () => {
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  return (
    <React.Fragment>
      <div className="md:hidden">
        <Navbar onToggleClick={() => setShowSidebarMobile(true)} />
      </div>
      <div
        className="absolute top-0 -left-72 h-screen w-72 md:left-0"
        style={showSidebarMobile ? { left: 0 } : undefined}
      >
        <Sidebar />
      </div>
      <div className="absolute left-0 flex h-screen w-full flex-col overflow-scroll pt-5 md:left-72 md:w-[calc(100vw-theme(spacing.72))]">
        <main className="flex-grow sm:container">
          <Outlet />
        </main>
        <Footer />
      </div>
    </React.Fragment>
  );
};
