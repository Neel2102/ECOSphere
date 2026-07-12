import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Onboarding from '../../pages/dashboard/Onboarding';
import '../../styles/dashboard/main-layout.css';

function MainLayout() {
  // Desktop: sidebar is collapsed by default, expands on hover
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && user.role === 'employee' && (location.pathname === '/dashboard' || location.pathname === '/dashboard/')) {
      navigate('/dashboard/gamification', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const onboardingKey = user ? `ecosphere_onboarding_completed_${user.id}` : 'ecosphere_onboarding_completed_guest';
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem(onboardingKey) === 'true';
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem(onboardingKey, 'true');
    setOnboardingCompleted(true);
  };

  const handleHoverEnter = useCallback(() => {
    // Only expand on hover for desktop (check via matchMedia)
    if (window.matchMedia('(min-width: 1025px)').matches) {
      setCollapsed(false);
    }
  }, []);

  const handleHoverLeave = useCallback(() => {
    if (window.matchMedia('(min-width: 1025px)').matches) {
      setCollapsed(true);
    }
  }, []);

  if (user && !onboardingCompleted) {
    return (
      <div className="main-layout onboarding-mode">
        <div className="main-layout__body" style={{ marginLeft: 0 }}>
          <header className="header" style={{ padding: '0 24px', justifyContent: 'center' }}>
            <div className="header__title-wrap" style={{ textAlign: 'center' }}>
              <h2 className="header__title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-indigo)' }}>
                Welcome to EcoSphere, {user.fullName}! Let's complete your onboarding.
              </h2>
            </div>
          </header>
          <main className="main-layout__content" style={{ padding: '24px' }}>
            <Onboarding onComplete={handleOnboardingComplete} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`main-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onHoverEnter={handleHoverEnter}
        onHoverLeave={handleHoverLeave}
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
