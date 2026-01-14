// ============= ApplicationDetailPage.jsx (FIXED) =============
import { useState, useEffect } from 'react';
import './ApplicationDetailPage.css';

const ApplicationDetailPage = ({ applicationId, onBack, darkMode, authToken }) => { // ADD authToken prop
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [adminName, setAdminName] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    setLoading(true);
    try {
      // REMOVED: const token = localStorage.getItem('access_token');
      
      // CHANGED: Use full URL instead of relative path
      const response = await fetch(`http://localhost:8000/api/applications/${applicationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`, // USE authToken prop
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        setSelectedStatus(data.status || 'pending');
        setAdminNotes(data.admin_notes || '');
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

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      setErrorMessage('Please select a status');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    
    try {
      // REMOVED: const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        status_update: selectedStatus
      });

      // CHANGED: Use full URL
      const response = await fetch(`http://localhost:8000/api/applications/${applicationId}?${params}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`, // USE authToken prop
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedApp = await response.json();
        setApplication(updatedApp);
        setShowStatusModal(false);
        setSuccessMessage('Status updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
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

  const handleNotesUpdate = async () => {
    if (!adminName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    if (!adminNotes.trim()) {
      setErrorMessage('Please enter notes');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    
    try {
      // REMOVED: const token = localStorage.getItem('access_token');
      const noteWithName = `[${adminName}] ${adminNotes}`;
      const params = new URLSearchParams({
        status_update: application.status || 'pending',
        admin_notes: noteWithName
      });

      // CHANGED: Use full URL
      const response = await fetch(`http://localhost:8000/api/applications/${applicationId}?${params}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`, // USE authToken prop
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedApp = await response.json();
        setApplication(updatedApp);
        setShowNotesModal(false);
        setAdminName('');
        setAdminNotes('');
        setSuccessMessage('Admin notes added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Failed to add notes');
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'accepted': return '#4caf50';      // Changed from 'approved'
    case 'rejected': return '#f44336';
    case 'under_review': return '#2196f3';  // Added new status
    case 'pending': return '#ff9800';
    default: return '#999';
  }
};

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !application) {
    return (
      <div className="detail-page">
        <div className="error-state">
          <p>❌ {errorMessage}</p>
          <button onClick={onBack} className="back-btn-error">← Back to List</button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="page-header-detail">
        <button className="back-btn" onClick={onBack}>
          ← Back to List
        </button>
        <div>
          <h1>Application Details</h1>
          <p>Application ID: #{application.id}</p>
        </div>
      </div>

      {successMessage && (
        <div className="success-banner">
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && application && (
        <div className="error-banner-small">
          ✕ {errorMessage}
        </div>
      )}

      <div className="detail-card">
        <div className="card-header-detail">
          <div className="header-title-detail">
            <h2>{application.name}</h2>
            <span 
              className="status-badge-detail" 
              style={{ backgroundColor: getStatusColor(application.status) }}
            >
              {application.status || 'pending'}
            </span>
          </div>
          <div className="action-buttons-detail">
            <button className="status-btn" onClick={() => setShowStatusModal(true)}>
              🏷️ Update Status
            </button>
            <button className="notes-btn" onClick={() => setShowNotesModal(true)}>
              📝 Add Admin Notes
            </button>
          </div>
        </div>

        <div className="card-body-detail">
          <div className="info-section-detail">
            <h3>📋 Personal Information</h3>
            <div className="info-grid-detail">
              <div className="info-item-detail">
                <label>Full Name</label>
                <p>{application.name}</p>
              </div>
              <div className="info-item-detail">
                <label>Email</label>
                <p>{application.email}</p>
              </div>
              <div className="info-item-detail">
                <label>Mobile</label>
                <p>{application.mobile}</p>
              </div>
              <div className="info-item-detail">
                <label>City</label>
                <p>{application.city}</p>
              </div>
              <div className="info-item-detail">
                <label>Date of Birth</label>
                <p>{application.dob}</p>
              </div>
              <div className="info-item-detail">
                <label>Gender</label>
                <p className="capitalize">{application.gender}</p>
              </div>
            </div>
          </div>

          <div className="info-section-detail">
            <h3>🎓 Education Background</h3>
            <div className="info-grid-detail">
              <div className="info-item-detail">
                <label>Qualification</label>
                <p>{application.qualification}</p>
              </div>
              <div className="info-item-detail">
                <label>Board</label>
                <p>{application.board}</p>
              </div>
              <div className="info-item-detail">
                <label>Year</label>
                <p>{application.year}</p>
              </div>
              <div className="info-item-detail">
                <label>Percentage</label>
                <p>{application.percentage}%</p>
              </div>
              <div className="info-item-detail">
                <label>College</label>
                <p>{application.college}</p>
              </div>
              <div className="info-item-detail">
                <label>Course</label>
                <p>{application.course}</p>
              </div>
              <div className="info-item-detail">
                <label>Admission Year</label>
                <p>{application.admission_year}</p>
              </div>
            </div>
          </div>

          <div className="info-section-detail">
            <h3>📝 Additional Information</h3>
            <div className="info-grid-detail">
              <div className="info-item-detail full-width">
                <label>Applicant Notes</label>
                <p className="notes-text">{application.notes || 'No notes provided'}</p>
              </div>
            </div>
          </div>

          <div className="info-section-detail">
            <h3>⚙️ Application Status</h3>
            <div className="info-grid-detail">
              <div className="info-item-detail">
                <label>Current Status</label>
                <span 
                  className="status-badge-inline" 
                  style={{ backgroundColor: getStatusColor(application.status) }}
                >
                  {application.status || 'pending'}
                </span>
              </div>
              <div className="info-item-detail">
                <label>Created Date</label>
                <p>{new Date(application.created_at).toLocaleString()}</p>
              </div>
              <div className="info-item-detail">
                <label>Last Updated</label>
                <p>{new Date(application.updated_at).toLocaleString()}</p>
              </div>
              <div className="info-item-detail full-width">
                <label>Admin Notes</label>
                <p className="notes-text">{application.admin_notes || 'No admin notes available'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Application Status</h3>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Select Status</label>
             <select 
  value={selectedStatus} 
  onChange={(e) => setSelectedStatus(e.target.value)}
  className="status-select"
>
  <option value="pending">Pending</option>
  <option value="under_review">Under Review</option>
  <option value="accepted">Accepted</option>
  <option value="rejected">Rejected</option>
</select>
            </div>
            <div className="modal-footer">
              <button className="cancel-modal-btn" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button className="save-modal-btn" onClick={handleStatusUpdate} disabled={saving}>
                {saving ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes Modal */}
      {showNotesModal && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Admin Notes</h3>
              <button className="close-btn" onClick={() => setShowNotesModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Your Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Enter your name"
                className="notes-input"
              />
              
              <label>Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Write your notes here..."
                rows="5"
                className="notes-textarea"
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-modal-btn" onClick={() => setShowNotesModal(false)}>
                Cancel
              </button>
              <button className="save-modal-btn" onClick={handleNotesUpdate} disabled={saving}>
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPage;