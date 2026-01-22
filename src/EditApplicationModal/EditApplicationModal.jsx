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
    sslc_percentage: '',
    hsc_percentage: '',
    school_name: '',
    district: '',
    board: '',
    college: [],
    course: [],
    notes: '',
    status: '',
    admin_notes: ''
  });

  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const suggestionRef = useRef(null);

  // College dropdown states
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [filteredColleges, setFilteredColleges] = useState([]);
  const collegeDropdownRef = useRef(null);

  // Course dropdown states
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const courseDropdownRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});

  // Tamil Nadu Colleges List
  const tamilNaduColleges = [
    "Anna University",
    "College of Engineering Guindy (CEG)",
    "PSG College of Technology",
    "Thiagarajar College of Engineering",
    "SSN College of Engineering",
    "VIT Vellore",
    "SRM Institute of Science and Technology",
    "Madras Institute of Technology (MIT)",
    "Coimbatore Institute of Technology",
    "Kumaraguru College of Technology",
    "Kongu Engineering College",
    "Sri Sivasubramaniya Nadar College of Engineering",
    "Velammal Engineering College",
    "St. Joseph's College of Engineering",
    "Rajalakshmi Engineering College",
    "Saveetha Engineering College",
    "Hindustan Institute of Technology and Science",
    "Vel Tech Rangarajan Dr. Sagunthala R&D Institute",
    "Sri Venkateswara College of Engineering",
    "Jeppiaar Engineering College",
    "Panimalar Engineering College",
    "R.M.K. Engineering College",
    "Easwari Engineering College",
    "Meenakshi College of Engineering",
    "Dr. M.G.R. Educational and Research Institute",
    "Karunya Institute of Technology and Sciences",
    "Bannari Amman Institute of Technology",
    "K.S.R. College of Engineering",
    "Saranathan College of Engineering",
    "K.L.N. College of Engineering"
  ];

  // Popular Courses List
  const popularCourses = [
    "B.E Computer Science and Engineering",
    "B.Tech Information Technology",
    "B.E Electronics and Communication Engineering",
    "B.E Mechanical Engineering",
    "B.E Civil Engineering",
    "B.E Electrical and Electronics Engineering",
    "B.Tech Artificial Intelligence and Data Science",
    "B.Tech Computer Science and Business Systems",
    "B.E Biomedical Engineering",
    "B.Tech Cyber Security",
    "B.Sc Computer Science",
    "B.Com Commerce",
    "B.A English Literature",
    "BBA Business Administration",
    "BCA Computer Applications",
    "B.Sc Mathematics",
    "B.Sc Physics",
    "B.Sc Chemistry",
    "M.E Computer Science and Engineering",
    "M.Tech Information Technology",
    "MBA Master of Business Administration",
    "MCA Master of Computer Applications"
  ];

  // Fetch Indian Cities
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

  // Initialize filtered colleges and courses
  useEffect(() => {
    setFilteredColleges(tamilNaduColleges);
    setFilteredCourses(popularCourses);
  }, []);

  // Handle college search
  useEffect(() => {
    if (collegeSearch.trim() === '') {
      setFilteredColleges(tamilNaduColleges);
    } else {
      const filtered = tamilNaduColleges.filter(college =>
        college.toLowerCase().includes(collegeSearch.toLowerCase())
      );
      setFilteredColleges(filtered);
    }
  }, [collegeSearch]);

  // Handle course search
  useEffect(() => {
    if (courseSearch.trim() === '') {
      setFilteredCourses(popularCourses);
    } else {
      const filtered = popularCourses.filter(course =>
        course.toLowerCase().includes(courseSearch.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [courseSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target)) {
        setShowCollegeDropdown(false);
      }
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setShowCourseDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 
useEffect(() => {
  if (application) {
    setEditForm({
      ...application,
      college: Array.isArray(application.college) ? application.college : [],
      course: Array.isArray(application.course) ? application.course : [],
      sslc_percentage: application.sslc_percentage || '',
      hsc_percentage: application.hsc_percentage || '',
      gender: application.gender ? application.gender.toLowerCase() : '', // Convert to lowercase
      status: application.status || 'pending',
      admin_notes: application.admin_notes || ''
    });
  }
}, [application]);

  const handleCityChange = (e) => {
    const value = e.target.value;
    handleChange('city', value);

    if (value.length > 0) {
      const filtered = allCities
        .filter(c => c.toLowerCase().startsWith(value.toLowerCase()))
        .slice(0, 10);
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

  // Handle college selection
  const handleCollegeToggle = (college) => {
    setEditForm(prev => {
      const currentColleges = prev.college || [];
      const isSelected = currentColleges.includes(college);
      
      if (isSelected) {
        // Remove college
        return {
          ...prev,
          college: currentColleges.filter(c => c !== college)
        };
      } else {
        // Add college only if less than 3 are selected
        if (currentColleges.length < 3) {
          return {
            ...prev,
            college: [...currentColleges, college]
          };
        }
        return prev;
      }
    });
    setError('');
  };

  // Handle course selection
  const handleCourseToggle = (course) => {
  setEditForm(prev => {
    const currentCourses = prev.course || [];
    const isSelected = currentCourses.includes(course);

    if (isSelected) {
      // Remove course
      return {
        ...prev,
        course: currentCourses.filter(c => c !== course)
      };
    } else {
      // Add course only if less than 3 selected
      if (currentCourses.length < 3) {
        return {
          ...prev,
          course: [...currentCourses, course]
        };
      }
      return prev;
    }
  });
  setError('');
};


  const getFieldError = (field) => {
    if (!touched[field]) return '';
    
    const value = editForm[field];
    
    if (field === 'college' || field === 'course') {
      if (!value || value.length === 0) {
        return `${field} is required`;
      }
      return '';
    }
    
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
    
    if (field === 'sslc_percentage' || field === 'hsc_percentage') {
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
      'school_name', 'district', 'board', 
      'sslc_percentage', 'hsc_percentage',
      'college', 'course'
    ];

    for (const field of requiredFields) {
      if (field === 'college') {
        if (!editForm.college || editForm.college.length === 0) {
          setError('At least one college is required');
          return false;
        }
        continue;
      }
      
      if (field === 'course') {
        if (!editForm.course || editForm.course.length === 0) {
          setError('At least one course is required');
          return false;
        }
        continue;
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

    const sslcPercent = parseFloat(editForm.sslc_percentage);
    if (isNaN(sslcPercent) || sslcPercent < 0 || sslcPercent > 100) {
      setError('SSLC Percentage must be between 0 and 100');
      return false;
    }

    const hscPercent = parseFloat(editForm.hsc_percentage);
    if (isNaN(hscPercent) || hscPercent < 0 || hscPercent > 100) {
      setError('HSC Percentage must be between 0 and 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
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
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        city: editForm.city,
        dob: editForm.dob,
        gender: editForm.gender,
        sslc_percentage: parseFloat(editForm.sslc_percentage),
        hsc_percentage: parseFloat(editForm.hsc_percentage),
        school_name: editForm.school_name,
        district: editForm.district,
        board: editForm.board,
        college: editForm.college,
        course: editForm.course,
        notes: editForm.notes || '',
        status: editForm.status,
        admin_notes: editForm.admin_notes || ''
      };

      const response = await fetch(
        `https://campus-tamizha.onrender.com/api/applications/${application.id}`, 
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );

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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
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
      value={editForm.gender || ''} // Add fallback
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  School Name
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.school_name}
                  onChange={(e) => handleChange('school_name', e.target.value)}
                  onBlur={() => handleBlur('school_name')}
                  className={`edit-input ${getFieldError('school_name') ? 'error' : ''}`}
                  placeholder="Enter school name"
                />
                {getFieldError('school_name') && <span className="field-error">{getFieldError('school_name')}</span>}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  District
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  onBlur={() => handleBlur('district')}
                  className={`edit-input ${getFieldError('district') ? 'error' : ''}`}
                  placeholder="Enter district"
                />
                {getFieldError('district') && <span className="field-error">{getFieldError('district')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  SSLC Percentage
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.sslc_percentage}
                  onChange={(e) => handleChange('sslc_percentage', e.target.value)}
                  onBlur={() => handleBlur('sslc_percentage')}
                  className={`edit-input ${getFieldError('sslc_percentage') ? 'error' : ''}`}
                  placeholder="85.5"
                  min="0"
                  max="100"
                />
                {getFieldError('sslc_percentage') && <span className="field-error">{getFieldError('sslc_percentage')}</span>}
              </div>

              <div className="edit-field">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  HSC Percentage
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.hsc_percentage}
                  onChange={(e) => handleChange('hsc_percentage', e.target.value)}
                  onBlur={() => handleBlur('hsc_percentage')}
                  className={`edit-input ${getFieldError('hsc_percentage') ? 'error' : ''}`}
                  placeholder="92.0"
                  min="0"
                  max="100"
                />
                {getFieldError('hsc_percentage') && <span className="field-error">{getFieldError('hsc_percentage')}</span>}
              </div>

              <div className="edit-field full-width" ref={collegeDropdownRef}>

                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  College(s)
                  <span className="required">*</span>
                </label>
                <div className="dropdown-container">
                  <div 
                    className={`dropdown-display ${getFieldError('college') ? 'error' : ''}`}
                    onClick={() => setShowCollegeDropdown(!showCollegeDropdown)}
                  >
                    {editForm.college && editForm.college.length > 0 ? (
                      <div className="selected-items">
                        {editForm.college.map((college, idx) => (
                          <span key={idx} className="selected-tag">
                            {college}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCollegeToggle(college);
                              }}
                              className="remove-tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="placeholder">Select colleges (max 3)</span>
                    )}
                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {showCollegeDropdown && (
                    <div className="dropdown-menu">
                      <div className="dropdown-search">
                        <input
                          type="text"
                          value={collegeSearch}
                          onChange={(e) => setCollegeSearch(e.target.value)}
                          placeholder="Search colleges..."
                          className="search-input"
                        />
                      </div>
                      <div className="dropdown-list">
                        {filteredColleges.map((college, idx) => {
                          const isSelected = editForm.college && editForm.college.includes(college);
                          const isDisabled = !isSelected && editForm.college && editForm.college.length >= 3;
                          
                          return (
                            <label
                              key={idx}
                              className={`dropdown-item ${isDisabled ? 'disabled' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCollegeToggle(college)}
                                disabled={isDisabled}
                              />
                              <span className="checkbox-custom">
                                {isSelected && (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span className="item-label">{college}</span>
                            </label>
                          );
                        })}
                      </div>
                      {editForm.college && editForm.college.length >= 3 && (
                        <div className="dropdown-limit-message">
                          Maximum 3 colleges selected
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <small className="field-hint">Select up to 3 colleges</small>
                {getFieldError('college') && <span className="field-error">{getFieldError('college')}</span>}
              </div>

              <div className="edit-field full-width" ref={courseDropdownRef}>

                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Course(s)
                  <span className="required">*</span>
                </label>
                <div className="dropdown-container">
                  <div 
                    className={`dropdown-display ${getFieldError('course') ? 'error' : ''}`}
                    onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                  >
                    {editForm.course && editForm.course.length > 0 ? (
                      <div className="selected-items">
                        {editForm.course.map((course, idx) => (
                          <span key={idx} className="selected-tag">
                            {course}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCourseToggle(course);
                              }}
                              className="remove-tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="placeholder">Select courses</span>
                    )}
                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="edit-field full-width"></div>
                  {showCourseDropdown && (
                    <div className="dropdown-menu">
                      <div className="dropdown-search">
                        <input
                          type="text"
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          placeholder="Search courses..."
                          className="search-input"
                        />
                      </div>
                      <div className="dropdown-list">
                       {filteredCourses.map((course, idx) => {
  const isSelected = editForm.course && editForm.course.includes(course);
  const isDisabled =
    !isSelected && editForm.course && editForm.course.length >= 3;

  return (
    <label
      key={idx}
      className={`dropdown-item ${isDisabled ? 'disabled' : ''}`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => handleCourseToggle(course)}
        disabled={isDisabled}
      />
      <span className="checkbox-custom">
        {isSelected && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="item-label">{course}</span>
    </label>
  );
})}

                      </div>
                       <div className="dropdown-limit-message">
                          Maximum 3 course selected
                        </div>
                    </div>
                    
                  )}
                  
                </div>
                <small className="field-hint">Select up to 3 courses</small>
                {getFieldError('course') && <span className="field-error">{getFieldError('course')}</span>}
              </div>
            </div>
          </div>
        </div>

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