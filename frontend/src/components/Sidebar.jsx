/**
 * Sidebar Navigation Component
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Cross, LayoutDashboard, MapPin, Activity,
  Truck, Settings, LogOut, Menu, X, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, key: 'dashboard' },
  { to: '/finder',     icon: MapPin,          key: 'hospitals' },
  { to: '/bookings',   icon: Calendar,        key: 'bookings' },
  { to: '/health',     icon: Activity,        key: 'healthMonitor' },
  { to: '/ambulance',  icon: Truck,           key: 'ambulanceTracker' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast({ type: 'info', title: 'Logged out', message: 'See you next time!' });
    navigate('/login');
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="btn btn-ghost btn-icon-only"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed', top: '16px', left: '16px',
          zIndex: 150, display: 'none',
        }}
        id="sidebar-toggle"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 99,
          }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div className="sidebar-logo-text">
            <span>Emergency</span>
            <span>Hospital Finder</span>
          </div>
          <button
            className="btn btn-ghost btn-icon-only btn-sm"
            onClick={() => setMobileOpen(false)}
            style={{ marginLeft: 'auto' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon"><Icon size={16} /></span>
              {t(key)}
            </NavLink>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: '16px' }}>System</div>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-icon"><Settings size={16} /></span>
            {t('settings')}
          </NavLink>
        </nav>

        {/* Footer user */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role || 'user'}</div>
            </div>
            <LogOut size={14} color="var(--clr-text-dim)" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
