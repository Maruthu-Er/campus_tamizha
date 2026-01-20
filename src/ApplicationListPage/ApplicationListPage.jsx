import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplicationListPage.css';

const ApplicationListPage = ({ authToken }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const itemsPerPage = 10;

  const fetchApplications = useCallback(async (searchQuery = '', isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsSearching(true);
    }
    try {
      const params = new URLSearchParams({
        skip: 0,
        limit: 100,
        sort_by: sortBy,
        order: order,
      });

      if (searchQuery) params.append('name', searchQuery);
      if (locationFilter) params.append('location', locationFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`https://campus-tamizha.onrender.com/api/applications/?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
        
        if (searchQuery) {
          const names = data.map(app => app.name).slice(0, 5);
          setSuggestions([...new Set(names)]);
        } else {
          setSuggestions([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setIsSearching(false);
      }
    }
  }, [authToken, sortBy, order, locationFilter, startDate, endDate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchApplications]);

  useEffect(() => {
    fetchApplications('', true);
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchApplications(searchTerm);
    }
  }, [sortBy, order, locationFilter, startDate, endDate]);

  const handleRefresh = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setLocationFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    fetchApplications('', false);
  };

  const handleClearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const handleViewApplication = (id) => {
    navigate(`/applications/${id}`);
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesFilter;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const getStatusConfig = (status) => {
    const configs = {
      accepted: { color: '#10b981', label: 'Accepted', icon: '✓' },
      rejected: { color: '#ef4444', label: 'Rejected', icon: '✕' },
      under_review: { color: '#3b82f6', label: 'Under Review', icon: '⟳' },
      pending: { color: '#f59e0b', label: 'Pending', icon: '⏱' }
    };
    return configs[status?.toLowerCase()] || { color: '#6b7280', label: status, icon: '•' };
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sort-icon inactive">
          <path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>
        </svg>
      );
    }
    return order === 'asc' ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sort-icon active">
        <path d="M12 5l0 14M5 12l7-7 7 7"/>
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sort-icon active">
        <path d="M12 19l0-14M5 12l7 7 7-7"/>
      </svg>
    );
  };

  return (
    <div className="list-page">
      <div className="page-header-section">
        <div className="header-content">
          <div className="header-title-group">
            <h1 className="page-title">Applications Dashboard</h1>
            <p className="page-subtitle">Manage and review all student applications</p>
          </div>
          <button className="refresh-button" onClick={handleRefresh}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <polyline points="17 11 19 13 23 9"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{applications.length}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{applications.filter(a => a.status === 'pending').length}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{applications.filter(a => a.status === 'accepted').length}</span>
            <span className="stat-label">Accepted</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{applications.filter(a => a.status === 'rejected').length}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      <div className="controls-panel">
        <div className="search-container">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="search-input"
            />
            {isSearching && (
              <div className="search-loading">
                <div className="search-spinner"></div>
              </div>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && searchTerm && (
            <ul className="suggestions-dropdown">
              {suggestions.map((name, index) => (
                <li key={index} onClick={() => handleSuggestionClick(name)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="filters-group">
          <div className="filter-item">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Location
            </label>
            <input
              type="text"
              placeholder="Filter by city..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-item">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              Status
            </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-item">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input date-input"
            />
          </div>

          <div className="filter-item">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filter-input date-input"
            />
          </div>

          {(startDate || endDate) && (
            <button className="clear-dates-button" onClick={handleClearDateFilters}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner-ring"></div>
          <p>Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="empty-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3>No Applications Found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="sortable">
                    <div className="th-content">
                      <span>ID</span>
                      <SortIcon field="id" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    <div className="th-content">
                      <span>Applicant</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>Contact</span>
                    </div>
                  </th>
                  <th onClick={() => handleSort('city')} className="sortable">
                    <div className="th-content">
                      <span>Location</span>
                      <SortIcon field="city" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    <div className="th-content">
                      <span>Status</span>
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('created_at')} className="sortable">
                    <div className="th-content">
                      <span>Submitted</span>
                      <SortIcon field="created_at" />
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((app) => {
                  const statusConfig = getStatusConfig(app.status);
                  return (
                    <tr key={app.id} onClick={() => handleViewApplication(app.id)}>
                      <td className="id-cell">#{app.id}</td>
                      <td className="applicant-cell">
                        <div className="applicant-info">
                          <div className="avatar">
                            {app.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="applicant-details">
                            <span className="applicant-name">{app.name}</span>
                            <span className="applicant-email">{app.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="contact-cell">{app.mobile}</td>
                      <td className="location-cell">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {app.city}
                      </td>
                      <td>
                        <span 
                          className="status-tag" 
                          style={{ 
                            '--status-color': statusConfig.color,
                            background: `${statusConfig.color}15`
                          }}
                        >
                          <span className="status-icon">{statusConfig.icon}</span>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(app.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewApplication(app.id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Previous
              </button>
              
              <div className="pagination-info">
                <span className="current-page">Page {currentPage}</span>
                <span className="page-separator">of</span>
                <span className="total-pages">{totalPages}</span>
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApplicationListPage;