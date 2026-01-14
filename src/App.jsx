// ============= App.jsx (Main Component with Layout) =============
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // useEffect(() => {
  //   // Check if user is already logged in
  //   const token = localStorage.getItem('access_token');
  //   if (token) {
  //     setIsAuthenticated(true);
  //   }
  // }, []);

   const handleLogin = (tokens) => {
    setAuthToken(tokens.accessToken);
    setIsAuthenticated(true);
    setCurrentPage('applications');
  };

  const handleLogout = () => {
    setAuthToken(null); // CHANGE THIS
    setIsAuthenticated(false);
    setCurrentPage('applications');
    setSelectedAppId(null);
    // REMOVE localStorage calls
  };

  const handleViewApplication = (id) => {
    setSelectedAppId(id);
    setCurrentPage('detail');
  };

  const handleBackToList = () => {
    setCurrentPage('applications');
    setSelectedAppId(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (!isAuthenticated) {
    return <AdminLoginPage onLogin={handleLogin} />;
  }

  return (
    <div className={`admin-layout ${darkMode ? 'dark' : 'light'}`}>
      <Header 
        onLogout={handleLogout} 
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <div className="layout-container">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSelectedAppId(null);
          }}
        />
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {currentPage === 'applications' && (
             <ApplicationListPage 
              onViewApplication={handleViewApplication}
              darkMode={darkMode}
              authToken={authToken} // ADD THIS
            />
          )}
          
          {currentPage === 'detail' && selectedAppId && (
            <ApplicationDetailPage 
              applicationId={selectedAppId}
              onBack={handleBackToList}
              darkMode={darkMode}
              authToken={authToken} // ADD THIS
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;