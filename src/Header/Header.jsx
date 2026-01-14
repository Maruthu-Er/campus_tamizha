// ============= Header.jsx =============
import './Header.css';

const Header = ({ onLogout, toggleSidebar, darkMode, toggleDarkMode }) => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="logo">
          <span className="logo-icon">A</span>
          <h1>Admin Portal</h1>
        </div>
      </div>
      
      <div className="header-right">
        <button className="theme-toggle-btn" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        
        <div className="user-menu">
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <span className="user-name">Admin</span>
        </div>
        
        <button className="logout-btn" onClick={onLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;