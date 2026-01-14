// ============= ApplicationListPage.jsx (Updated) =============
import { useState, useEffect } from 'react';
import './ApplicationListPage.css';

const ApplicationListPage = ({ onViewApplication, darkMode, authToken }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchApplications();
  }, [sortBy, order]);

  const fetchApplications = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      skip: 0,
      limit: 100,
      sort_by: sortBy,
      order: order
    });

    const response = await fetch(`http://localhost:8000/api/applications/?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', data); // ADD THIS LINE
      console.log('Data type:', typeof data, 'Is array:', Array.isArray(data)); // ADD THIS LINE
      setApplications(data);
    } else if (response.status === 401) {
      alert('Session expired. Please log in again.');
    }
  } catch (err) {
    console.error('Failed to fetch applications:', err);
  } finally {
    setLoading(false);
  }
};
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'accepted': return '#4caf50';      // Changed from 'approved'
    case 'rejected': return '#f44336';
    case 'under_review': return '#2196f3';  // Added new status
    case 'pending': return '#ff9800';
    default: return '#999';
  }
};

  return (
    <div className="list-page">
      <div className="page-header">
        <div>
          <h1>Applications Dashboard</h1>
          <p>Manage and review all applications</p>
        </div>
        <button className="refresh-btn" onClick={fetchApplications}>
          <span>↻</span> Refresh
        </button>
      </div>

      <div className="controls-panel">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
  <option value="all">All Status</option>
  <option value="pending">Pending</option>
  <option value="under_review">Under Review</option>
  <option value="accepted">Accepted</option>
  <option value="rejected">Rejected</option>
</select>
        </div>

        <div className="filter-group">
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Created Date</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="city">City</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order:</label>
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading applications...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="table-row"
                    onClick={() => onViewApplication(app.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{app.id}</td>
                    <td className="name-cell">{app.name}</td>
                    <td>{app.email}</td>
                    <td>{app.mobile}</td>
                    <td>{app.city}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {app.status || 'pending'}
                      </span>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewApplication(app.id);
                        }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="empty-state">
              <p>📭 No applications found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
                ← Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApplicationListPage;