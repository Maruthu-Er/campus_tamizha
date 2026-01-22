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
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // CHANGED: Use status_counts from API response instead of separate state
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    under_review: 0
  });
  const [overallTotalCount, setOverallTotalCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const itemsPerPage = 10;

  // REMOVED: fetchStatusCounts function - no longer needed

  const fetchApplications = useCallback(async (searchQuery = '', isInitialLoad = false) => {
    const isDateRangeIncomplete = (startDate && !endDate) || (!startDate && endDate);
    if (isDateRangeIncomplete) return;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsSearching(true);
    }
    
    try {
      const params = new URLSearchParams({
        page: currentPage,
        page_size: itemsPerPage,
        sort_by: sortBy,
        order: order,
      });

      if (searchQuery) params.append('name', searchQuery);
      if (locationFilter) params.append('location', locationFilter);
      if (filterStatus !== 'all') params.append('application_status', filterStatus);
      
      if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }

      const response = await fetch(`https://campus-tamizha.onrender.com/api/applications/?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const applicationsData = Array.isArray(data.items) ? data.items : [];
        setApplications(applicationsData);
        setTotalItems(data.total || 0);
        setTotalPages(data.total_pages || 0);
        
        // CHANGED: Extract status_counts from API response
        if (data.status_counts) {
          setStatusCounts({
            pending: data.status_counts.pending || 0,
            accepted: data.status_counts.accepted || 0,
            rejected: data.status_counts.rejected || 0,
            under_review: data.status_counts.under_review || 0
          });
          
          // Calculate total from status counts
          const total = Object.values(data.status_counts).reduce((sum, count) => sum + count, 0);
          setOverallTotalCount(total);
        }
        
        // Update last refresh time
        setLastRefreshTime(new Date());
        
        if (searchQuery) {
          const names = applicationsData.map(app => app.name).slice(0, 5);
          setSuggestions([...new Set(names)]);
        } else {
          setSuggestions([]);
        }
      } else {
        setApplications([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setApplications([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setIsSearching(false);
      }
    }
  }, [authToken, sortBy, order, locationFilter, startDate, endDate, currentPage, itemsPerPage, filterStatus]);

  const fetchCities = useCallback(async (query) => {
  if (query.length < 2) {
    setLocationSuggestions([]);
    return;
  }

  setIsLoadingLocations(true);
  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        country: 'india'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.error === false && Array.isArray(data.data)) {
        const filteredCities = data.data
          .filter(city => city.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10);
        setLocationSuggestions(filteredCities);
      } else {
        setLocationSuggestions([]); // Ensure empty array on error
      }
    } else {
      setLocationSuggestions([]); // Ensure empty array on failed response
    }
  } catch (err) {
    console.error('Failed to fetch cities:', err);
    setLocationSuggestions([]); // Ensure empty array on exception
  } finally {
    setIsLoadingLocations(false);
  }
}, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const isDateRangeIncomplete = (startDate && !endDate) || (!startDate && endDate);
      if (isDateRangeIncomplete) return;

      if (searchTerm.length >= 3) {
        fetchApplications(searchTerm);
      }

      if (searchTerm.length === 0) {
        fetchApplications('', false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchApplications, startDate, endDate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (locationInput.length >= 2) {
        fetchCities(locationInput);
      } else {
        setLocationSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [locationInput, fetchCities]);

  useEffect(() => {
    fetchApplications('', true);
    // REMOVED: fetchStatusCounts() call
  }, []);

  useEffect(() => {
    if (loading) return;

    const isDateRangeIncomplete = (startDate && !endDate) || (!startDate && endDate);

    if (!isDateRangeIncomplete) {
      fetchApplications(searchTerm);
    }
  }, [sortBy, order, locationFilter, startDate, endDate, currentPage, filterStatus]);



 useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the location dropdown
      const locationDropdown = document.querySelector('.location-filter-item .modern-dropdown-wrapper');
      if (locationDropdown && !locationDropdown.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
      
      // Check if click is outside the status dropdown - look for the parent filter-item
      const statusFilterItem = event.target.closest('.filter-item');
      const statusDropdownWrapper = document.querySelector('.filter-item .modern-dropdown-wrapper');
      
      if (statusDropdownWrapper && !statusDropdownWrapper.contains(event.target) && 
          (!statusFilterItem || !statusFilterItem.querySelector('.modern-dropdown-wrapper'))) {
        setShowStatusDropdown(false);
      }
    };

    // Only add listener when dropdowns are open
    if (showLocationSuggestions || showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLocationSuggestions, showStatusDropdown]);

  const handleRefresh = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setLocationFilter('');
    setLocationInput('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    fetchApplications('', false);
    // REMOVED: fetchStatusCounts() call
  };

  const handleClearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
  };

  const handleLocationSuggestionClick = (city) => {
  setLocationInput(city);
  setLocationFilter(city);
  setShowLocationSuggestions(false);
  setCurrentPage(1); // Reset to first page when filter changes
};

  const handleLocationKeyDown = (e) => {
    if (e.key === 'Enter') {
      setLocationFilter(locationInput);
      setShowLocationSuggestions(false);
    }
  };

 const handleLocationInputChange = (e) => {
  const value = e.target.value;
  setLocationInput(value);
  
  if (value === '') {
    setLocationFilter('');
    setLocationSuggestions([]); // Clear suggestions when input is empty
  }
};


  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleViewApplication = (id) => {
    navigate(`/applications/${id}`);
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesFilter;
  });

  const paginatedApplications = applications;

  const getStatusConfig = (status) => {
    const configs = {
      accepted: { color: '#10b981', label: 'Accepted', icon: '✓' },
      rejected: { color: '#ef4444', label: 'Rejected', icon: '✕' },
      under_review: { color: '#3b82f6', label: 'Under Review', icon: '⟳' },
      pending: { color: '#f59e0b', label: 'Pending', icon: '⏱' }
    };
    return configs[status?.toLowerCase()] || { color: '#6b7280', label: status, icon: '•' };
  };

  const formatLastRefreshTime = () => {
    if (!lastRefreshTime) return 'Never';
    
    return lastRefreshTime.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: '◉', color: '#6b7280' },
    { value: 'pending', label: 'Pending', icon: '⏱', color: '#f59e0b' },
    { value: 'under_review', label: 'Under Review', icon: '⟳', color: '#3b82f6' },
    { value: 'accepted', label: 'Accepted', icon: '✓', color: '#10b981' },
    { value: 'rejected', label: 'Rejected', icon: '✕', color: '#ef4444' }
  ];

  const getSelectedStatusLabel = () => {
    return statusOptions.find(opt => opt.value === filterStatus)?.label || 'All Status';
  };

  const getSelectedStatusIcon = () => {
    return statusOptions.find(opt => opt.value === filterStatus)?.icon || '◉';
  };

  const getSelectedStatusColor = () => {
    return statusOptions.find(opt => opt.value === filterStatus)?.color || '#6b7280';
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
          <div className="refresh-section">
            <button className="refresh-button" onClick={handleRefresh}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              <span>Refresh</span>
            </button>
            {lastRefreshTime && (
              <p className="last-refresh">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatLastRefreshTime()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div 
          className={`stat-card ${filterStatus === 'all' ? 'active-filter' : ''}`} 
          onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <polyline points="17 11 19 13 23 9"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{overallTotalCount}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>

        <div 
          className={`stat-card ${filterStatus === 'pending' ? 'active-filter' : ''}`}
          onClick={() => { setFilterStatus('pending'); setCurrentPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{statusCounts.pending}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>

        <div 
          className={`stat-card ${filterStatus === 'under_review' ? 'active-filter' : ''}`}
          onClick={() => { setFilterStatus('under_review'); setCurrentPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{statusCounts.under_review}</span>
            <span className="stat-label">Under Review</span>
          </div>
        </div>

        <div 
          className={`stat-card ${filterStatus === 'accepted' ? 'active-filter' : ''}`}
          onClick={() => { setFilterStatus('accepted'); setCurrentPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{statusCounts.accepted}</span>
            <span className="stat-label">Accepted</span>
          </div>
        </div>

        <div 
          className={`stat-card ${filterStatus === 'rejected' ? 'active-filter' : ''}`}
          onClick={() => { setFilterStatus('rejected'); setCurrentPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{statusCounts.rejected}</span>
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
            {searchTerm && !isSearching && (
              <button 
                className="clear-search-button"
                onClick={() => {
                  setSearchTerm('');
                  setShowSuggestions(false);
                }}
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
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
         <div className="filter-item location-filter-item">
  <label>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
    Location
  </label>
  <div className="modern-dropdown-wrapper">
    <button 
      className="modern-dropdown-trigger"
      onClick={() => setShowLocationSuggestions(!showLocationSuggestions)}
      type="button"
    >
       <span className="dropdown-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ color: '#6b7280' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </span>
      <span className="dropdown-label">
        {locationFilter || 'Select city...'}
      </span>
      <svg 
        className={`dropdown-arrow ${showLocationSuggestions ? 'open' : ''}`}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    
    {showLocationSuggestions && (
      <div 
        className="modern-dropdown-menu location-menu"
        onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking inside
      >
        <div className="search-wrapper-in-dropdown">
          <svg className="search-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search cities..."
            value={locationInput}
            onChange={handleLocationInputChange}
            onKeyDown={handleLocationKeyDown}
            className="search-input-dropdown"
            autoFocus
          />
          {isLoadingLocations && (
            <div className="search-loading-small">
              <div className="search-spinner"></div>
            </div>
          )}
        </div>
        
        {Array.isArray(locationSuggestions) && locationSuggestions.length > 0 ? (
          <ul className="location-suggestions-list">
            {locationSuggestions.map((city, index) => (
              <li 
                key={index}
                className={`dropdown-option ${locationFilter === city ? 'selected' : ''}`}
                onClick={() => handleLocationSuggestionClick(city)}
              >
                <span className="option-icon">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: '#fcfdff' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span className="option-label">{city}</span>
                {locationFilter === city && (
                  <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </li>
            ))}
          </ul>
        ) : locationInput.length >= 2 && !isLoadingLocations ? (
          <div className="no-results">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <p>No cities found</p>
          </div>
        ) : locationInput.length < 2 && !isLoadingLocations ? (
          <div className="no-results">
            <p>Type at least 2 characters to search</p>
          </div>
        ) : null}
        
        {locationFilter && (
          <button 
            className="clear-location-button"
            onClick={(e) => {
              e.stopPropagation();
              setLocationFilter('');
              setLocationInput('');
              setShowLocationSuggestions(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear Selection
          </button>
        )}
      </div>
    )}
  </div>
</div>


<div className="filter-item">
  <label>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
    Status
  </label>
  <div className="modern-dropdown-wrapper">
    <button 
      className="modern-dropdown-trigger"
      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
      type="button"
    >
      <span className="dropdown-icon" style={{ color: getSelectedStatusColor() }}>
        {getSelectedStatusIcon()}
      </span>
      <span className="dropdown-label">{getSelectedStatusLabel()}</span>
      <svg 
        className={`dropdown-arrow ${showStatusDropdown ? 'open' : ''}`}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    
    {showStatusDropdown && (
      <ul 
        className="modern-dropdown-menu"
        onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking inside
      >
        {statusOptions.map((option) => (
          <li 
            key={option.value}
            className={`dropdown-option ${filterStatus === option.value ? 'selected' : ''}`}
            onClick={() => {
              setFilterStatus(option.value);
              setCurrentPage(1);
              setShowStatusDropdown(false);
            }}
          >
            <span className="option-icon" style={{ color: option.color }}>
              {option.icon}
            </span>
            <span className="option-label">{option.label}</span>
            {filterStatus === option.value && (
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
          {/* Date Filters Group */}
<div className="date-filters-group-wrapper">
  <div className="date-inputs-row">
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
        className={`filter-input date-input ${startDate && !endDate ? 'required-glow' : ''}`}
      />
    </div>
  </div>

  {/* Incomplete Range Message */}
  {startDate && !endDate && (
    <div className="date-range-hint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>Please select end date to activate filter</span>
    </div>
  )}
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





















// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './ApplicationListPage.css';

// const ApplicationListPage = ({ authToken }) => {
//   const navigate = useNavigate();
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [locationFilter, setLocationFilter] = useState('');
//   const [locationInput, setLocationInput] = useState('');
//   const [locationSuggestions, setLocationSuggestions] = useState([]);
//   const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
//   const [isLoadingLocations, setIsLoadingLocations] = useState(false);
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortBy, setSortBy] = useState('created_at');
//   const [order, setOrder] = useState('desc');
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);
  
//   // State for stats cards
//   const [statusCounts, setStatusCounts] = useState({
//     pending: 0,
//     accepted: 0,
//     rejected: 0,
//     under_review: 0
//   });
//   const [overallTotalCount, setOverallTotalCount] = useState(0);
//   const [lastRefreshTime, setLastRefreshTime] = useState(null);
//   const [showStatusDropdown, setShowStatusDropdown] = useState(false);
//   const itemsPerPage = 10;

//   const fetchApplications = useCallback(async (searchQuery = '', isInitialLoad = false) => {
//     const isDateRangeIncomplete = (startDate && !endDate) || (!startDate && endDate);
//     if (isDateRangeIncomplete) return;

//     if (isInitialLoad) {
//       setLoading(true);
//     } else {
//       setIsSearching(true);
//     }
    
//     try {
//       const params = new URLSearchParams({
//         page: currentPage,
//         page_size: itemsPerPage,
//         sort_by: sortBy,
//         order: order,
//       });

//       if (searchQuery) params.append('name', searchQuery);
//       if (locationFilter) params.append('location', locationFilter);
//       if (filterStatus !== 'all') params.append('application_status', filterStatus);
      
//       if (startDate && endDate) {
//         params.append('start_date', startDate);
//         params.append('end_date', endDate);
//       }

//       const response = await fetch(`https://campus-tamizha.onrender.com/api/applications/?${params}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const applicationsData = Array.isArray(data.items) ? data.items : [];
        
//         setApplications(applicationsData);
//         setTotalItems(data.total || 0);
//         setTotalPages(data.total_pages || 0);
        
//         // OPTIMIZATION: Extract counts from the same single API call
//         if (data.status_counts) {
//           setStatusCounts({
//             pending: data.status_counts.pending || 0,
//             accepted: data.status_counts.accepted || 0,
//             rejected: data.status_counts.rejected || 0,
//             under_review: data.status_counts.under_review || 0
//           });
//         }

//         // Use data.total for the overall count 
//         // (Note: if you want the "Total" card to always show the absolute global total 
//         // even when filtered, you should only set this when filterStatus is 'all')
//         if (filterStatus === 'all' && !searchQuery && !locationFilter) {
//             setOverallTotalCount(data.total || 0);
//         }
        
//         setLastRefreshTime(new Date());
        
//         if (searchQuery) {
//           const names = applicationsData.map(app => app.name).slice(0, 5);
//           setSuggestions([...new Set(names)]);
//         } else {
//           setSuggestions([]);
//         }
//       }
//     } catch (err) {
//       console.error('Failed to fetch applications:', err);
//     } finally {
//       setLoading(false);
//       setIsSearching(false);
//     }
//   }, [authToken, sortBy, order, locationFilter, startDate, endDate, currentPage, itemsPerPage, filterStatus]);

//   // City fetching logic
//   const fetchCities = useCallback(async (query) => {
//     if (query.length < 2) {
//       setLocationSuggestions([]);
//       return;
//     }
//     setIsLoadingLocations(true);
//     try {
//       const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ country: 'india' })
//       });
//       if (response.ok) {
//         const data = await response.json();
//         if (!data.error && data.data) {
//           const filteredCities = data.data
//             .filter(city => city.toLowerCase().includes(query.toLowerCase()))
//             .slice(0, 10);
//           setLocationSuggestions(filteredCities);
//         }
//       }
//     } catch (err) {
//       console.error('Failed to fetch cities:', err);
//     } finally {
//       setIsLoadingLocations(false);
//     }
//   }, []);

//   // Effect for Search debounce
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       if (searchTerm.length >= 3 || searchTerm.length === 0) {
//         fetchApplications(searchTerm);
//       }
//     }, 500);
//     return () => clearTimeout(delayDebounceFn);
//   }, [searchTerm, fetchApplications]);

//   // Effect for Location debounce
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       if (locationInput.length >= 2) fetchCities(locationInput);
//       else setLocationSuggestions([]);
//     }, 300);
//     return () => clearTimeout(delayDebounceFn);
//   }, [locationInput, fetchCities]);

//   // Initial Load
//   useEffect(() => {
//     fetchApplications('', true);
//   }, []);

//   // Effect for Filters/Pagination
//   useEffect(() => {
//     if (loading) return;
//     const isDateRangeIncomplete = (startDate && !endDate) || (!startDate && endDate);
//     if (!isDateRangeIncomplete) {
//       fetchApplications(searchTerm);
//     }
//   }, [sortBy, order, locationFilter, startDate, endDate, currentPage, filterStatus]);

//   const handleRefresh = () => {
//     setSearchTerm('');
//     setFilterStatus('all');
//     setLocationFilter('');
//     setLocationInput('');
//     setStartDate('');
//     setEndDate('');
//     setCurrentPage(1);
//     fetchApplications('', false);
//   };

//   const handleClearDateFilters = () => {
//     setStartDate('');
//     setEndDate('');
//   };

//   const handleSuggestionClick = (name) => {
//     setSearchTerm(name);
//     setShowSuggestions(false);
//   };

//   const handleLocationSuggestionClick = (city) => {
//     setLocationInput(city);
//     setLocationFilter(city);
//     setShowLocationSuggestions(false);
//   };

//   const handleLocationKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       setLocationFilter(locationInput);
//       setShowLocationSuggestions(false);
//     }
//   };

//   const handleLocationInputChange = (e) => {
//     const value = e.target.value;
//     setLocationInput(value);
//     setShowLocationSuggestions(true);
//     if (value === '') setLocationFilter('');
//   };

//   const handleSort = (field) => {
//     if (sortBy === field) {
//       setOrder(order === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortBy(field);
//       setOrder('asc');
//     }
//     setCurrentPage(1);
//   };

//   const handleViewApplication = (id) => {
//     navigate(`/applications/${id}`);
//   };

//   const getStatusConfig = (status) => {
//     const configs = {
//       accepted: { color: '#10b981', label: 'Accepted', icon: '✓' },
//       rejected: { color: '#ef4444', label: 'Rejected', icon: '✕' },
//       under_review: { color: '#3b82f6', label: 'Under Review', icon: '⟳' },
//       pending: { color: '#f59e0b', label: 'Pending', icon: '⏱' }
//     };
//     return configs[status?.toLowerCase()] || { color: '#6b7280', label: status, icon: '•' };
//   };

//   const formatLastRefreshTime = () => {
//     if (!lastRefreshTime) return 'Never';
//     return lastRefreshTime.toLocaleString('en-US', { 
//       month: 'short', day: 'numeric', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
//     });
//   };

//   const statusOptions = [
//     { value: 'all', label: 'All Status', icon: '◉', color: '#6b7280' },
//     { value: 'pending', label: 'Pending', icon: '⏱', color: '#f59e0b' },
//     { value: 'under_review', label: 'Under Review', icon: '⟳', color: '#3b82f6' },
//     { value: 'accepted', label: 'Accepted', icon: '✓', color: '#10b981' },
//     { value: 'rejected', label: 'Rejected', icon: '✕', color: '#ef4444' }
//   ];

//   const getSelectedStatusLabel = () => statusOptions.find(opt => opt.value === filterStatus)?.label || 'All Status';
//   const getSelectedStatusIcon = () => statusOptions.find(opt => opt.value === filterStatus)?.icon || '◉';
//   const getSelectedStatusColor = () => statusOptions.find(opt => opt.value === filterStatus)?.color || '#6b7280';

//   const SortIcon = ({ field }) => {
//     if (sortBy !== field) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sort-icon inactive"><path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/></svg>;
//     return order === 'asc' ? 
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sort-icon active"><path d="M12 5l0 14M5 12l7-7 7 7"/></svg> : 
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sort-icon active"><path d="M12 19l0-14M5 12l7 7 7-7"/></svg>;
//   };

//   return (
//     <div className="list-page">
//       <div className="page-header-section">
//         <div className="header-content">
//           <div className="header-title-group">
//             <h1 className="page-title">Applications Dashboard</h1>
//             <p className="page-subtitle">Manage and review all student applications</p>
//           </div>
//           <div className="refresh-section">
//             <button className="refresh-button" onClick={handleRefresh}>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
//               </svg>
//               <span>Refresh</span>
//             </button>
//             {lastRefreshTime && (
//               <p className="last-refresh">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
//                 {formatLastRefreshTime()}
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="stats-grid">
//         <div className={`stat-card ${filterStatus === 'all' ? 'active-filter' : ''}`} onClick={() => { setFilterStatus('all'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
//           <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
//           </div>
//           <div className="stat-details">
//             <span className="stat-value">{overallTotalCount}</span>
//             <span className="stat-label">Total Applications</span>
//           </div>
//         </div>

//         <div className={`stat-card ${filterStatus === 'pending' ? 'active-filter' : ''}`} onClick={() => { setFilterStatus('pending'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
//           <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
//           </div>
//           <div className="stat-details">
//             <span className="stat-value">{statusCounts.pending}</span>
//             <span className="stat-label">Pending Review</span>
//           </div>
//         </div>

//         <div className={`stat-card ${filterStatus === 'under_review' ? 'active-filter' : ''}`} onClick={() => { setFilterStatus('under_review'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
//           <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
//           </div>
//           <div className="stat-details">
//             <span className="stat-value">{statusCounts.under_review}</span>
//             <span className="stat-label">Under Review</span>
//           </div>
//         </div>

//         <div className={`stat-card ${filterStatus === 'accepted' ? 'active-filter' : ''}`} onClick={() => { setFilterStatus('accepted'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
//           <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
//           </div>
//           <div className="stat-details">
//             <span className="stat-value">{statusCounts.accepted}</span>
//             <span className="stat-label">Accepted</span>
//           </div>
//         </div>

//         <div className={`stat-card ${filterStatus === 'rejected' ? 'active-filter' : ''}`} onClick={() => { setFilterStatus('rejected'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
//           <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
//           </div>
//           <div className="stat-details">
//             <span className="stat-value">{statusCounts.rejected}</span>
//             <span className="stat-label">Rejected</span>
//           </div>
//         </div>
//       </div>

//       <div className="controls-panel">
//         <div className="search-container">
//           <div className="search-wrapper">
//             <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
//             <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="search-input" />
//             {isSearching && <div className="search-loading"><div className="search-spinner"></div></div>}
//           </div>
//           {showSuggestions && suggestions.length > 0 && searchTerm && (
//             <ul className="suggestions-dropdown">
//               {suggestions.map((name, index) => (
//                 <li key={index} onClick={() => handleSuggestionClick(name)}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
//                   <span>{name}</span>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         <div className="filters-group">
//           <div className="filter-item location-filter-item">
//             <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Location</label>
//             <div className="search-wrapper">
//               <input type="text" placeholder="Filter by city..." value={locationInput} onChange={handleLocationInputChange} onKeyDown={handleLocationKeyDown} onFocus={() => setShowLocationSuggestions(true)} onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)} className="filter-input" />
//               {isLoadingLocations && <div className="search-loading"><div className="search-spinner"></div></div>}
//             </div>
//             {showLocationSuggestions && locationSuggestions.length > 0 && locationInput && (
//               <ul className="suggestions-dropdown location-dropdown">
//                 {locationSuggestions.map((city, index) => (
//                   <li key={index} onClick={() => handleLocationSuggestionClick(city)}>
//                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
//                     <span>{city}</span>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           <div className="filter-item">
//             <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Status</label>
//             <div className="modern-dropdown-wrapper">
//               <button className="modern-dropdown-trigger" onClick={() => setShowStatusDropdown(!showStatusDropdown)} onBlur={() => setTimeout(() => setShowStatusDropdown(false), 200)}>
//                 <span className="dropdown-icon" style={{ color: getSelectedStatusColor() }}>{getSelectedStatusIcon()}</span>
//                 <span className="dropdown-label">{getSelectedStatusLabel()}</span>
//                 <svg className={`dropdown-arrow ${showStatusDropdown ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
//               </button>
//               {showStatusDropdown && (
//                 <ul className="modern-dropdown-menu">
//                   {statusOptions.map((option) => (
//                     <li key={option.value} className={`dropdown-option ${filterStatus === option.value ? 'selected' : ''}`} onClick={() => { setFilterStatus(option.value); setShowStatusDropdown(false); }}>
//                       <span className="option-icon" style={{ color: option.color }}>{option.icon}</span>
//                       <span className="option-label">{option.label}</span>
//                       {filterStatus === option.value && <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>

//           <div className="filter-item">
//             <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Start Date</label>
//             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="filter-input date-input" />
//           </div>

//           <div className="filter-item">
//             <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>End Date</label>
//             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="filter-input date-input" />
//           </div>

//           {(startDate || endDate) && (
//             <button className="clear-dates-button" onClick={handleClearDateFilters}>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Clear Dates
//             </button>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="loading-container"><div className="spinner-ring"></div><p>Loading applications...</p></div>
//       ) : applications.length === 0 ? (
//         <div className="empty-container">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
//           <h3>No Applications Found</h3>
//           <p>Try adjusting your search or filter criteria</p>
//         </div>
//       ) : (
//         <>
//           <div className="table-wrapper">
//             <table className="modern-table">
//               <thead>
//                 <tr>
//                   <th onClick={() => handleSort('id')} className="sortable"><div className="th-content"><span>ID</span><SortIcon field="id" /></div></th>
//                   <th onClick={() => handleSort('name')} className="sortable"><div className="th-content"><span>Applicant</span><SortIcon field="name" /></div></th>
//                   <th><div className="th-content"><span>Contact</span></div></th>
//                   <th onClick={() => handleSort('city')} className="sortable"><div className="th-content"><span>Location</span><SortIcon field="city" /></div></th>
//                   <th onClick={() => handleSort('status')} className="sortable"><div className="th-content"><span>Status</span><SortIcon field="status" /></div></th>
//                   <th onClick={() => handleSort('created_at')} className="sortable"><div className="th-content"><span>Submitted</span><SortIcon field="created_at" /></div></th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {applications.map((app) => {
//                   const statusConfig = getStatusConfig(app.status);
//                   return (
//                     <tr key={app.id} onClick={() => handleViewApplication(app.id)}>
//                       <td className="id-cell">#{app.id}</td>
//                       <td className="applicant-cell">
//                         <div className="applicant-info">
//                           <div className="avatar">{app.name?.charAt(0).toUpperCase()}</div>
//                           <div className="applicant-details">
//                             <span className="applicant-name">{app.name}</span>
//                             <span className="applicant-email">{app.email}</span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="contact-cell">{app.mobile}</td>
//                       <td className="location-cell">
//                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
//                         {app.city}
//                       </td>
//                       <td>
//                         <span className="status-tag" style={{ '--status-color': statusConfig.color, background: `${statusConfig.color}15` }}>
//                           <span className="status-icon">{statusConfig.icon}</span>{statusConfig.label}
//                         </span>
//                       </td>
//                       <td className="date-cell">{new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
//                       <td>
//                         <button className="action-button" onClick={(e) => { e.stopPropagation(); handleViewApplication(app.id); }}>
//                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>View
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {totalPages > 1 && (
//             <div className="pagination-container">
//               <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="pagination-button">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>Previous
//               </button>
//               <div className="pagination-info"><span className="current-page">Page {currentPage}</span><span className="page-separator">of</span><span className="total-pages">{totalPages}</span></div>
//               <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="pagination-button">
//                 Next<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ApplicationListPage;