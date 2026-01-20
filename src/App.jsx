import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import AdminLoginPage from './AdminLoginPage/AdminLoginPage';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import ApplicationListPage from './ApplicationListPage/ApplicationListPage';
import ApplicationDetailPage from './ApplicationDetailPage/ApplicationDetailPage';
import './App.css';

// Wrapper component for ApplicationDetailPage to handle URL params
const ApplicationDetailWrapper = ({ darkMode, authToken, onBack }) => {
  const { id } = useParams();
  return (
    <ApplicationDetailPage 
      applicationId={id}
      onBack={onBack}
      darkMode={darkMode}
      authToken={authToken}
    />
  );
};

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
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
    navigate('/applications');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setMobileSidebarOpen(false);
    navigate('/login');
  };

  const handleViewApplication = (id) => {
    navigate(`/applications/${id}`);
  };

  const handleBackToList = () => {
    navigate('/applications');
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
    return (
      <Routes>
        <Route path="/login" element={<AdminLoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
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
          onNavigate={(page) => navigate(`/${page}`)}
          onExpandChange={setSidebarExpanded}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />
        
        <main className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <Routes>
            <Route 
              path="/applications" 
              element={
                <ApplicationListPage 
                  onViewApplication={handleViewApplication}
                  darkMode={darkMode}
                  authToken={authToken}
                />
              } 
            />
            
            <Route 
              path="/applications/:id" 
              element={
                <ApplicationDetailWrapper 
                  onBack={handleBackToList}
                  darkMode={darkMode}
                  authToken={authToken}
                />
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <div className="page-placeholder">
                  <h2>Dashboard</h2>
                  <p>Dashboard content coming soon...</p>
                </div>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <div className="page-placeholder">
                  <h2>Analytics</h2>
                  <p>Analytics content coming soon...</p>
                </div>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <div className="page-placeholder">
                  <h2>Settings</h2>
                  <p>Settings content coming soon...</p>
                </div>
              } 
            />
            
            <Route path="/" element={<Navigate to="/applications" replace />} />
            <Route path="*" element={<Navigate to="/applications" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;