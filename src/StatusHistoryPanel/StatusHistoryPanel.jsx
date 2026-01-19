import { useState, useEffect } from 'react';
import './StatusHistoryPanel.css';

const StatusHistoryPanel = ({ show, onClose, applicationId, authToken }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      fetchStatusHistory();
    }
  }, [show, applicationId]);

  const fetchStatusHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:8000/api/applications/${applicationId}/status-history`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else if (response.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (response.status === 404) {
        setError('Application not found');
      } else {
        setError('Failed to load status history');
      }
    } catch (err) {
      console.error('Failed to fetch status history:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      accepted: {
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Accepted'
      },
      rejected: {
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Rejected'
      },
      under_review: {
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        label: 'Under Review'
      },
      pending: {
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Pending'
      }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  if (!show) return null;

  return (
    <div className="history-panel-overlay" onClick={onClose}>
      <div className="history-panel-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="history-panel-header">
          <div className="history-panel-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Status History</h3>
          </div>
          <button className="history-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="history-panel-body">
          {loading ? (
            <div className="history-loading">
              <div className="history-loader"></div>
              <p>Loading status history...</p>
            </div>
          ) : error ? (
            <div className="history-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
              <button onClick={fetchStatusHistory} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No status history available</p>
            </div>
          ) : (
            <div className="history-timeline">
              {history.map((entry, index) => {
                const statusConfig = getStatusConfig(entry.status);
                const isFirst = index === 0;
                
                return (
                  <div key={entry.id} className={`history-entry ${isFirst ? 'latest' : ''}`}>
                    {/* Timeline Line */}
                    {index < history.length - 1 && <div className="timeline-line"></div>}
                    
                    {/* Timeline Dot */}
                    <div className="timeline-dot" style={{ background: statusConfig.gradient }}>
                      {statusConfig.icon}
                    </div>

                    {/* Entry Content */}
                    <div className="history-entry-content">
                      <div className="history-entry-header">
                        <div className="status-info">
                          <span 
                            className="status-label" 
                            style={{ background: statusConfig.gradient }}
                          >
                            {statusConfig.label}
                          </span>
                          {isFirst && <span className="current-badge">Current</span>}
                        </div>
                        <span className="history-timestamp">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(entry.created_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>

                      <div className="history-admin-info">
                        <div className="admin-avatar">
                          {entry.admin_name ? entry.admin_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="admin-details">
                          <span className="admin-name">{entry.admin_name || 'Admin'}</span>
                          <span className="admin-email">{entry.admin_email}</span>
                        </div>
                      </div>

                      {entry.notes && (
                        <div className="history-notes">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <p>{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="history-panel-footer">
          <button className="history-close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusHistoryPanel;