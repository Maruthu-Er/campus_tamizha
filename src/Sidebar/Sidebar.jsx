// ============= Sidebar.jsx =============
import './Sidebar.css';

const Sidebar = ({ isOpen, currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'applications', icon: '📋', label: 'View Applications' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;