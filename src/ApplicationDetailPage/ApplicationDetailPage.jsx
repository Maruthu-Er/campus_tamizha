// ============= src/ApplicationDetailPage/ApplicationDetailPage.jsx =============
import { useState, useEffect } from 'react';
import EditApplicationModal from '../EditApplicationModal/EditApplicationModal';
import StatusHistoryPanel from '../StatusHistoryPanel/StatusHistoryPanel';
import ModernDropdown from '../ui/ModernDropdown/ModernDropdown';
import './ApplicationDetailPage.css';

const ApplicationDetailPage = ({ applicationId, onBack, darkMode, authToken }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [adminName, setAdminName] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/applications/${applicationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        setSelectedStatus(data.status || 'pending');
      } else if (response.status === 401) {
        alert('Session expired. Please log in again.');
      } else if (response.status === 404) {
        setErrorMessage('Application not found');
      }
    } catch (err) {
      console.error('Failed to fetch application:', err);
      setErrorMessage('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = (updatedApp) => {
    setApplication(updatedApp);
    setSuccessMessage('Application updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const validateStatusForm = () => {
    const errors = {};
    
    if (!selectedStatus) {
      errors.status = 'Please select a status';
    }
    
    if (!adminName.trim()) {
      errors.adminName = 'Your name is required';
    }
    
    if (!adminNotes.trim()) {
      errors.adminNotes = 'Admin notes are mandatory for status updates';
    } else if (adminNotes.trim().length < 10) {
      errors.adminNotes = 'Please provide at least 10 characters of notes';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStatusUpdate = async () => {
    if (!validateStatusForm()) {
      return;
    }

    setSaving(true);
    setErrorMessage('');
    
    try {
      const params = new URLSearchParams({
        status_update: selectedStatus,
        admin_name: adminName.trim(),
        admin_notes: adminNotes.trim()
      });

      const response = await fetch(`http://localhost:8000/api/applications/${applicationId}?${params}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedApp = await response.json();
        setApplication(updatedApp);
        setShowStatusModal(false);
        setAdminName('');
        setAdminNotes('');
        setFormErrors({});
        setSuccessMessage('Status updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Failed to update status');
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      accepted: { 
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Accepted'
      },
      rejected: { 
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Rejected'
      },
      under_review: { 
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        label: 'Under Review'
      },
      pending: { 
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        icon: (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Pending'
      }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-state">
          <div className="loader-container">
            <div className="loader"></div>
            <div className="loader-glow"></div>
          </div>
          <p className="loading-text">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !application) {
    return (
      <div className="detail-page">
        <div className="error-state">
          <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3>Error Loading Application</h3>
          <p>{errorMessage}</p>
          <button onClick={onBack} className="back-btn-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(application?.status);

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="page-header-detail">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </button>
        <div className="header-info">
          <h1>Application Details</h1>
          <p className="app-id">ID: #{application.id}</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="notification-banner success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && application && (
        <div className="notification-banner error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Detail Card */}
      <div className="detail-card">
        {/* Card Header */}
        <div className="card-header-detail">
          <div className="header-title-section">
            <div className="applicant-avatar">
              {application.name.charAt(0).toUpperCase()}
            </div>
            <div className="title-info">
              <h2>{application.name}</h2>
              <div className="status-badge" style={{ background: statusConfig.gradient }}>
                {statusConfig.icon}
                {statusConfig.label}
              </div>
            </div>
          </div>
          <div className="action-buttons-detail">
            <button className="action-btn history-btn" onClick={() => setShowStatusHistory(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
            </button>
            <button className="action-btn status-btn" onClick={() => setShowStatusModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Update Status
            </button>
            <button className="action-btn edit-btn" onClick={() => setShowEditModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Application
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body-detail">
          {/* Personal Information */}
          <div className="info-section">
            <div className="section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3>Personal Information</h3>
            </div>
            <div className="info-grid">
              <InfoItem icon={<UserIcon />} label="Full Name" value={application.name} />
              <InfoItem icon={<EmailIcon />} label="Email" value={application.email} />
              <InfoItem icon={<PhoneIcon />} label="Mobile" value={application.mobile} />
              <InfoItem icon={<LocationIcon />} label="City" value={application.city} />
              <InfoItem icon={<CalendarIcon />} label="Date of Birth" value={application.dob} />
              <InfoItem icon={<GenderIcon />} label="Gender" value={application.gender} capitalize />
            </div>
          </div>

          {/* Education Background */}
          <div className="info-section">
            <div className="section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <h3>Education Background</h3>
            </div>
            <div className="info-grid">
              <InfoItem icon={<AcademicIcon />} label="Qualification" value={application.qualification} />
              <InfoItem icon={<BoardIcon />} label="Board" value={application.board} />
              <InfoItem icon={<CalendarIcon />} label="Year" value={application.year} />
              <InfoItem icon={<PercentIcon />} label="Percentage" value={`${application.percentage}%`} />
              <ListInfoItem 
                icon={<CollegeIcon />} 
                label="Colleges" 
                items={application.college || []} 
              />
              <ListInfoItem 
                icon={<CourseIcon />} 
                label="Courses" 
                items={application.course || []} 
              />
              <InfoItem icon={<CalendarIcon />} label="Admission Year" value={application.admission_year} />
            </div>
          </div>

          {/* Additional Information */}
          <div className="info-section">
            <div className="section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3>Applicant Notes</h3>
            </div>
            <div className="notes-container">
              <p className="notes-text">{application.notes || 'No notes provided by the applicant'}</p>
            </div>
          </div>

          {/* Application Status */}
          <div className="info-section">
            <div className="section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3>Application Status & Timeline</h3>
            </div>
            <div className="info-grid">
              <InfoItem 
                icon={<CalendarIcon />} 
                label="Created Date" 
                value={new Date(application.created_at).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })} 
              />
              <InfoItem 
                icon={<ClockIcon />} 
                label="Last Updated" 
                value={new Date(application.updated_at).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })} 
              />
              <div className="info-item full-width admin-notes-section">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Admin Notes
                </label>
                <div className="admin-notes-box">
                  {application.admin_notes || 'No admin notes available'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Application Modal */}
      <EditApplicationModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        application={application}
        authToken={authToken}
        onSuccess={handleEditSuccess}
      />

      {/* Status History Panel */}
      <StatusHistoryPanel
        show={showStatusHistory}
        onClose={() => setShowStatusHistory(false)}
        applicationId={applicationId}
        authToken={authToken}
      />

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3>Update Application Status</h3>
              </div>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">

<ModernDropdown
  label="Select Status"
  value={selectedStatus}
  options={[
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ]}
  onChange={(value) => {
    setSelectedStatus(value);
    setFormErrors({...formErrors, status: ''});
  }}
  placeholder="Select status"
  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>}
  required
  error={formErrors.status}
/>


              {/* <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Select Status *
                </label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setFormErrors({...formErrors, status: ''});
                  }}
                  className={`form-select ${formErrors.status ? 'error' : ''}`}
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                {formErrors.status && <span className="error-text">{formErrors.status}</span>}
              </div> */}

              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Your Name *
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => {
                    setAdminName(e.target.value);
                    setFormErrors({...formErrors, adminName: ''});
                  }}
                  placeholder="Enter your name"
                  className={`form-input ${formErrors.adminName ? 'error' : ''}`}
                />
                {formErrors.adminName && <span className="error-text">{formErrors.adminName}</span>}
              </div>

              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Admin Notes *
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => {
                    setAdminNotes(e.target.value);
                    setFormErrors({...formErrors, adminNotes: ''});
                  }}
                  placeholder="Enter detailed notes about this status update... (minimum 10 characters)"
                  rows="5"
                  className={`form-textarea ${formErrors.adminNotes ? 'error' : ''}`}
                />
                <div className="textarea-footer">
                  <span className={`char-count ${adminNotes.length < 10 ? 'warning' : 'success'}`}>
                    {adminNotes.length} / 10 minimum characters
                  </span>
                </div>
                {formErrors.adminNotes && <span className="error-text">{formErrors.adminNotes}</span>}
              </div>

              <div className="info-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Admin notes are mandatory for all status updates. Please provide clear and detailed information about this decision.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowStatusModal(false);
                  setFormErrors({});
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleStatusUpdate} 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="btn-loader"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const InfoItem = ({ icon, label, value, capitalize }) => (
  <div className="info-item">
    <label>
      {icon}
      {label}
    </label>
    <p className={capitalize ? 'capitalize' : ''}>{value}</p>
  </div>
);
const ListInfoItem = ({ icon, label, items }) => (
  <div className="info-item">
    <label>
      {icon}
      {label}
    </label>
    <div className="list-items-container">
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <span key={index} className="list-item-badge">
            {item}
          </span>
        ))
      ) : (
        <p className="no-items">No {label.toLowerCase()} specified</p>
      )}
    </div>
  </div>
);

// SVG Icons
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const GenderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const AcademicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const BoardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const PercentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CollegeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CourseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default ApplicationDetailPage;