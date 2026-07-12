import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/dashboard/main-layout.css';

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`main-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
      />
      <div className="main-layout__body">
        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="main-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
