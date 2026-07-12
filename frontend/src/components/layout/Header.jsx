import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Icon from '../common/Icon/Icon';
import { useAuth } from '../../context/AuthContext';
import { fileUrl } from '../../services/api';
import { NAV_ITEMS } from './Sidebar';
import '../../styles/dashboard/header.css';

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

function Header({ onOpenMobileSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const currentItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
  const pageTitle = location.pathname.startsWith('/dashboard/profile')
    ? 'My Profile'
    : currentItem?.label || 'Dashboard';

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handlePointer = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
          <Icon name="menu" size={20} />
        </button>
        <h2 className="header__title">{pageTitle}</h2>
      </div>

      <div className="header__right">
        <div className="header__search">
          <Icon name="search" size={17} className="header__search-icon" />
          <input type="search" placeholder="Search" aria-label="Search" />
        </div>

        <button type="button" className="header__icon-btn" aria-label="Notifications">
          <Icon name="bell" size={19} />
          <span className="header__notif-dot" aria-hidden="true" />
        </button>

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
            <Icon name="chevronDown" size={15} className="header__user-chevron" />
          </button>

          {menuOpen && (
            <div className="header__menu" role="menu">
              <div className="header__menu-info">
                <strong>{user?.fullName}</strong>
                <span>{user?.email}</span>
              </div>
              <Link
                to="/dashboard/profile"
                className="header__menu-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="user" size={17} /> My Profile
              </Link>
              <button
                type="button"
                className="header__menu-item header__menu-item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <Icon name="logout" size={17} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
