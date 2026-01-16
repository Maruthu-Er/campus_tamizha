import { useState, useEffect, useRef } from 'react';
import './EditApplicationModal.css';
const EditApplicationModal = ({ 
  show, 
  onClose, 
  application, 
  authToken, 
  onSuccess 
}) => {
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    city: '',
    dob: '',
    gender: '',
    qualification: '',
    board: '',
    year: '',
    percentage: '',
    college: '',
    course: '',
    admission_year: '',
    notes: '',
    status: '',
    admin_notes: ''
  });
   const [allCities, setAllCities] = useState([]); // Stores the full list from API
  const [filteredCities, setFilteredCities] = useState([]); // Stores filtered results
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const suggestionRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});

  // Available cities for dropdown
   // 1. Fetch Indian Cities from API on Mount
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: "India" })
        });
        const data = await response.json();
        if (!data.error) {
          setAllCities(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch cities:", err);
      } finally {
        setLoadingCities(false);
      }
    };

    if (show) fetchCities();
  }, [show]);


  const handleCityChange = (e) => {
    const value = e.target.value;
    handleChange('city', value);

    if (value.length > 0) {
      const filtered = allCities
        .filter(c => c.toLowerCase().startsWith(value.toLowerCase()))
        .slice(0, 10); // Limit to 10 suggestions for performance
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
    }
  };

   const selectCity = (cityName) => {
    handleChange('city', cityName);
    setShowSuggestions(false);
  };
   // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (application) {
      setEditForm({
        name: application.name || '',
        email: application.email || '',
        mobile: application.mobile || '',
        city: application.city || '',
        dob: application.dob || '',
        gender: application.gender || '',
        qualification: application.qualification || '',
        board: application.board || '',
        year: application.year || '',
        percentage: application.percentage || '',
        college: application.college || '',
        course: application.course || '',
        admission_year: application.admission_year || '',
        notes: application.notes || '',
        status: application.status || 'pending',
        admin_notes: application.admin_notes || ''
      });
    }
  }, [application]);

  const handleChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field) => {
    if (!touched[field]) return '';
    
    const value = editForm[field];
    
    if (!value || value.toString().trim() === '') {
      return `${field.replace('_', ' ')} is required`;
    }
    
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Invalid email format';
    }
    
    if (field === 'mobile') {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(value)) return 'Must be 10 digits';
    }
    
    if (field === 'percentage') {
      const percentage = parseFloat(value);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        return 'Must be 0-100';
      }
    }
    
    return '';
  };

  const validateForm = () => {
    const requiredFields = [
      'name', 'email', 'mobile', 'city', 'dob', 'gender',
      'qualification', 'board', 'year', 'percentage',
      'college', 'course', 'admission_year'
    ];

    for (const field of requiredFields) {
      const error = getFieldError(field);
      if (error) {
        setError(error);
        return false;
      }
      if (!editForm[field] || editForm[field].toString().trim() === '') {
        setError(`${field.replace('_', ' ').toUpperCase()} is required`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(editForm.mobile)) {
      setError('Mobile number must be 10 digits');
      return false;
    }

    const percentage = parseFloat(editForm.percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError('Percentage must be between 0 and 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(editForm).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const updateData = {
        ...editForm,
        year: editForm.year ? parseInt(editForm.year) : null,
        percentage: editForm.percentage ? parseFloat(editForm.percentage) : null,
        admission_year: editForm.admission_year ? parseInt(editForm.admission_year) : null
      };

      const response = await fetch(`http://localhost:8000/api/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedApp = await response.json();
        onSuccess(updatedApp);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update application');
      }
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-modal-header">
          <div className="edit-modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3>Edit Application</h3>
          </div>
          <button className="edit-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="edit-modal-body">
          {error && (
            <div className="edit-error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="edit-section">
            <div className="edit-section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h4>Personal Information</h4>
            </div>
            
            <div className="edit-grid">
              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`edit-input ${getFieldError('name') ? 'error' : ''}`}
                  placeholder="Enter full name"
                />
                {getFieldError('name') && <span className="field-error">{getFieldError('name')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`edit-input ${getFieldError('email') ? 'error' : ''}`}
                  placeholder="your.email@example.com"
                />
                {getFieldError('email') && <span className="field-error">{getFieldError('email')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Mobile
                  <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  value={editForm.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  onBlur={() => handleBlur('mobile')}
                  className={`edit-input ${getFieldError('mobile') ? 'error' : ''}`}
                  placeholder="10-digit number"
                  maxLength="10"
                />
                {getFieldError('mobile') && <span className="field-error">{getFieldError('mobile')}</span>}
              </div>

               <div className="edit-field" ref={suggestionRef}>
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              City <span className="required">*</span>
            </label>
            <div className="searchable-container">
              <input
                type="text"
                value={editForm.city}
                onChange={handleCityChange}
                onBlur={() => handleBlur('city')}
                placeholder={loadingCities ? "Loading cities..." : "Search City..."}
                className={`edit-input ${getFieldError('city') ? 'error' : ''}`}
                autoComplete="off"
              />
              
              {showSuggestions && filteredCities.length > 0 && (
                <ul className="suggestions-list">
                  {filteredCities.map((city, index) => (
                    <li key={index} onClick={() => selectCity(city)}>
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {getFieldError('city') && <span className="field-error">{getFieldError('city')}</span>}
          </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date of Birth
                  <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  onBlur={() => handleBlur('dob')}
                  className={`edit-input ${getFieldError('dob') ? 'error' : ''}`}
                />
                {getFieldError('dob') && <span className="field-error">{getFieldError('dob')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Gender
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    value={editForm.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    onBlur={() => handleBlur('gender')}
                    className={`edit-input ${getFieldError('gender') ? 'error' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <svg className="select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {getFieldError('gender') && <span className="field-error">{getFieldError('gender')}</span>}
              </div>
            </div>
          </div>

          {/* Education Background */}
          <div className="edit-section">
            <div className="edit-section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <h4>Education Background</h4>
            </div>
            
            <div className="edit-grid">
              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Qualification
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.qualification}
                  onChange={(e) => handleChange('qualification', e.target.value)}
                  onBlur={() => handleBlur('qualification')}
                  className={`edit-input ${getFieldError('qualification') ? 'error' : ''}`}
                  placeholder="e.g., 12th, Graduation"
                />
                {getFieldError('qualification') && <span className="field-error">{getFieldError('qualification')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Board
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.board}
                  onChange={(e) => handleChange('board', e.target.value)}
                  onBlur={() => handleBlur('board')}
                  className={`edit-input ${getFieldError('board') ? 'error' : ''}`}
                  placeholder="e.g., CBSE, State Board"
                />
                {getFieldError('board') && <span className="field-error">{getFieldError('board')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Passing Year
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={editForm.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  onBlur={() => handleBlur('year')}
                  className={`edit-input ${getFieldError('year') ? 'error' : ''}`}
                  placeholder="2024"
                  min="1950"
                  max="2030"
                />
                {getFieldError('year') && <span className="field-error">{getFieldError('year')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Percentage
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.percentage}
                  onChange={(e) => handleChange('percentage', e.target.value)}
                  onBlur={() => handleBlur('percentage')}
                  className={`edit-input ${getFieldError('percentage') ? 'error' : ''}`}
                  placeholder="85.5"
                  min="0"
                  max="100"
                />
                {getFieldError('percentage') && <span className="field-error">{getFieldError('percentage')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  College
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.college}
                  onChange={(e) => handleChange('college', e.target.value)}
                  onBlur={() => handleBlur('college')}
                  className={`edit-input ${getFieldError('college') ? 'error' : ''}`}
                  placeholder="College name"
                />
                {getFieldError('college') && <span className="field-error">{getFieldError('college')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Course
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.course}
                  onChange={(e) => handleChange('course', e.target.value)}
                  onBlur={() => handleBlur('course')}
                  className={`edit-input ${getFieldError('course') ? 'error' : ''}`}
                  placeholder="e.g., B.Tech, BCA"
                />
                {getFieldError('course') && <span className="field-error">{getFieldError('course')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Admission Year
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={editForm.admission_year}
                  onChange={(e) => handleChange('admission_year', e.target.value)}
                  onBlur={() => handleBlur('admission_year')}
                  className={`edit-input ${getFieldError('admission_year') ? 'error' : ''}`}
                  placeholder="2024"
                  min="1950"
                  max="2030"
                />
                {getFieldError('admission_year') && <span className="field-error">{getFieldError('admission_year')}</span>}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="edit-section">
            <div className="edit-section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4>Additional Information</h4>
            </div>
            
            <div className="edit-field">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Applicant Notes
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="edit-textarea"
                rows="4"
                placeholder="Any additional information..."
              />
            </div>
          </div>

          {/* Status & Admin Notes */}
          {/* <div className="edit-section">
            <div className="edit-section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h4>Status & Admin Notes</h4>
            </div>
            
            <div className="edit-grid">
              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Status
                </label>
                <div className="select-wrapper">
                  <select
                    value={editForm.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="edit-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <svg className="select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="edit-field">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Admin Notes
              </label>
              <textarea
                value={editForm.admin_notes}
                onChange={(e) => handleChange('admin_notes', e.target.value)}
                className="edit-textarea"
                rows="4"
                placeholder="Internal notes for administrative purposes..."
              />
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="edit-modal-footer">
          <button 
            className="edit-cancel-btn" 
            onClick={onClose}
            disabled={saving}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button 
            className="edit-save-btn" 
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditApplicationModal;