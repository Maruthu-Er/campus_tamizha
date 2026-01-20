import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/logo/favicon.ico';
import './Sidebar.css';

const Sidebar = ({ onNavigate, onExpandChange, mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Determine current page from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.startsWith('/applications')) return 'applications';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/analytics') return 'analytics';
    if (path === '/settings') return 'settings';
    return 'applications';
  };

  const currentPage = getCurrentPage();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      onExpandChange?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
      onExpandChange?.(false);
    }
  };

  const handleNavClick = (itemId) => {
    onNavigate(itemId);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const menuItems = [
    { 
      id: 'applications', 
      label: 'Applications',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      )
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    { 
      id: 'analytics', 
      label: 'Analytics',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"/>
          <line x1="18" y1="20" x2="18" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>
        </svg>
      )
    },
    { 
      id: 'settings', 
      label: 'Settings',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m5.2-14.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m14.2 5.2l-4.2-4.2m0-6l-4.2-4.2"/>
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`}
          onClick={onMobileClose}
        />
      )}

      <aside 
        className={`sidebar ${
          isMobile 
            ? (mobileOpen ? 'mobile-open expanded' : 'collapsed') 
            : (isHovered ? 'expanded' : 'collapsed')
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              title={!isHovered && !isMobile ? item.label : ''}
              aria-label={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className={`nav-label ${(isHovered || isMobile) ? 'show' : 'hide'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Powered by Troudz */}
        <div className="sidebar-footer">
          <div className="troudz-logo">
            <img src={logo} alt='' />
          </div>
          <span className={`troudz-text ${(isHovered || isMobile) ? 'show' : 'hide'}`}>
            Powered by <strong>Troudz</strong>
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;