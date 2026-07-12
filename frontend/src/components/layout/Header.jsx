import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fileUrl } from '../../services/api';
import Icon from '../common/Icon/Icon';
import { NAV_ITEMS, ESG_MODULES } from './Sidebar';
import notificationService from '../../services/notificationService';
import '../../styles/dashboard/header.css';

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

function resolvePageTitle(pathname) {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'ESG Dashboard';
  if (pathname.includes('/profile')) return 'My Profile';
  if (pathname.includes('/reports')) return 'Reports';
  if (pathname.includes('/settings')) return 'Settings';

  // Check sub-links first
  const subMatch = NAV_ITEMS.find((item) => pathname.startsWith(item.to));
  if (subMatch) return subMatch.label;

  // Fall back to module name
  const moduleMatch = ESG_MODULES.find((m) => pathname.startsWith(m.base));
  if (moduleMatch) return moduleMatch.label;

  return 'EcoSphere';
}

function Header({ onOpenMobileSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const pageTitle = resolvePageTitle(location.pathname);

  // Fetch notifications
  const fetchNotifs = () => {
    if (!user) return;
    notificationService
      .listMine()
      .then((data) => {
        setNotifications(data?.items || []);
        setUnreadCount(Number(data?.unread) || 0);
      })
      .catch((err) => console.error('[Header] Could not load notifications:', err));
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 30 seconds for live notifications in the hackathon platform
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click away listeners
  useEffect(() => {
    const handlePointer = (event) => {
      if (menuOpen && !menuRef.current?.contains(event.target)) setMenuOpen(false);
      if (notifOpen && !notifRef.current?.contains(event.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [menuOpen, notifOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleMarkAllRead = () => {
    notificationService
      .markAllRead()
      .then(() => {
        fetchNotifs();
      })
      .catch((err) => console.error('[Header] Mark all read failed:', err));
  };

  const handleMarkRead = (id) => {
    notificationService
      .markRead(id)
      .then(() => {
        fetchNotifs();
      })
      .catch((err) => console.error('[Header] Mark read failed:', err));
  };

  const avatarSrc = fileUrl(user?.profileImagePath);

  return (
    <header className="header">
      <div className="header__left">
        <button
          type="button"
          className="header__burger"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <div className="header__title-wrap">
          <span className="header__brand">EcoSphere</span>
          <h2 className="header__title">{pageTitle}</h2>
        </div>
      </div>

      <div className="header__right">
        {/* Notifications Popover */}
        <div className="header__notif-container" ref={notifRef}>
          <button
            type="button"
            className="header__icon-btn"
            aria-label="Notifications"
            onClick={() => setNotifOpen((open) => !open)}
          >
            <Icon name="bell" size={20} />
            {unreadCount > 0 && <span className="header__notif-dot" aria-hidden="true" />}
          </button>

          {notifOpen && (
            <div className="header__notif-menu">
              <div className="header__notif-header">
                <strong>Notifications</strong>
                {unreadCount > 0 && (
                  <button type="button" className="header__notif-clear" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <ul className="header__notif-list">
                {notifications.length === 0 ? (
                  <li className="header__notif-empty">No notifications yet.</li>
                ) : (
                  notifications.map((item) => (
                    <li
                      key={item.id}
                      className={`header__notif-item${!item.is_read ? ' is-unread' : ''}`}
                      onClick={() => !item.is_read && handleMarkRead(item.id)}
                    >
                      <div className="header__notif-title-row">
                        <span className="header__notif-item-title">{item.title}</span>
                        {!item.is_read && <span className="header__notif-unread-dot" />}
                      </div>
                      <p className="header__notif-item-msg">{item.message}</p>
                      <span className="header__notif-item-time">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="header__user" ref={menuRef}>
          <button
            type="button"
            className="header__user-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {avatarSrc ? (
              <img className="header__avatar" src={avatarSrc} alt="" />
            ) : (
              <span className="header__avatar header__avatar--initials">
                {initialsOf(user?.fullName)}
              </span>
            )}
            <span className="header__user-name">{user?.fullName}</span>
            <span className="header__user-chevron">▾</span>
          </button>

          {menuOpen && (
            <div className="header__menu" role="menu">
              <div className="header__menu-info">
                <strong>{user?.fullName}</strong>
                <span>{user?.email}</span>
                <span className="header__menu-role">
                  {{
                    admin: 'Organization Admin',
                    manager: 'Department Admin',
                    employee: 'Employee',
                    client: 'Client',
                  }[user?.role] || user?.role}
                </span>
              </div>
              <Link
                to="/dashboard/profile"
                className="header__menu-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="user" size={16} style={{ marginRight: 8 }} /> My Profile
              </Link>
              <button
                type="button"
                className="header__menu-item header__menu-item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <Icon name="logout" size={16} style={{ marginRight: 8 }} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
