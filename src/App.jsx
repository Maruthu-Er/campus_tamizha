// ============= App.jsx =============
import { useState, useEffect } from 'react';
import AdminLoginPage from './AdminLoginPage/AdminLoginPage';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import ApplicationListPage from './ApplicationListPage/ApplicationListPage';
import ApplicationDetailPage from './ApplicationDetailPage/ApplicationDetailPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('applications');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    );
  }, [darkMode]);

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (tokens) => {
    setAuthToken(tokens.accessToken);
    setIsAuthenticated(true);
    setCurrentPage('applications');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setCurrentPage('applications');
    setSelectedAppId(null);
    setMobileSidebarOpen(false);
  };

  const handleViewApplication = (id) => {
    setSelectedAppId(id);
    setCurrentPage('detail');
  };

  const handleBackToList = () => {
    setCurrentPage('applications');
    setSelectedAppId(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return <AdminLoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="admin-layout">
      <Header 
        onLogout={handleLogout} 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onMenuToggle={toggleMobileSidebar}
        mobileMenuOpen={mobileSidebarOpen}
      />
      
      <div className="layout-container">
        <Sidebar 
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSelectedAppId(null);
          }}
          onExpandChange={setSidebarExpanded}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />
        
        <main className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          {currentPage === 'applications' && (
            <ApplicationListPage 
              onViewApplication={handleViewApplication}
              darkMode={darkMode}
              authToken={authToken}
            />
          )}
          
          {currentPage === 'detail' && selectedAppId && (
            <ApplicationDetailPage 
              applicationId={selectedAppId}
              onBack={handleBackToList}
              darkMode={darkMode}
              authToken={authToken}
            />
          )}
          
          {currentPage === 'dashboard' && (
            <div className="page-placeholder">
              <h2>Dashboard</h2>
              <p>Dashboard content coming soon...</p>
            </div>
          )}
          
          {currentPage === 'analytics' && (
            <div className="page-placeholder">
              <h2>Analytics</h2>
              <p>Analytics content coming soon...</p>
            </div>
          )}
          
          {currentPage === 'settings' && (
            <div className="page-placeholder">
              <h2>Settings</h2>
              <p>Settings content coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;