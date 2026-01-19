import { useState, useRef, useEffect } from 'react';

const ModernDropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = "Select option",
  error = "",
  icon,
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="modern-dropdown-wrapper" ref={dropdownRef}>
      <style>{`
        .modern-dropdown-wrapper {
          position: relative;
          width: 100%;
        }

        .dropdown-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-weight: 700;
          color: #6b7280;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          transition: color 0.3s ease;
        }

        .dropdown-label svg {
          width: 18px;
          height: 18px;
          stroke-width: 2.5;
          color: #6366f1;
        }

        .dropdown-label .required {
          color: #ef4444;
          margin-left: auto;
        }

        .dropdown-trigger {
          width: 100%;
          padding: 16px 20px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .dropdown-trigger:hover {
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .dropdown-trigger.open {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .dropdown-trigger.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .dropdown-trigger.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f3f4f6;
        }

        .trigger-content {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .trigger-icon {
          width: 20px;
          height: 20px;
          color: #6366f1;
          flex-shrink: 0;
        }

        .trigger-text {
          flex: 1;
          text-align: left;
        }

        .trigger-text.placeholder {
          color: #9ca3af;
        }

        .chevron-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chevron-icon.open {
          transform: rotate(180deg);
          color: #6366f1;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #6366f1;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          overflow: hidden;
          animation: dropdownSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dropdown-search {
          padding: 14px 16px;
          border-bottom: 2px solid #f3f4f6;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
        }

        .search-input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          background: white;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-icon-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
          pointer-events: none;
        }

        .dropdown-options {
          max-height: 280px;
          overflow-y: auto;
          padding: 8px;
        }

        .dropdown-options::-webkit-scrollbar {
          width: 8px;
        }

        .dropdown-options::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }

        .dropdown-options::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #a855f7);
          border-radius: 10px;
          border: 2px solid #f3f4f6;
        }

        .dropdown-option {
          padding: 12px 16px;
          cursor: pointer;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          color: #1f2937;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dropdown-option:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
          color: #6366f1;
          transform: translateX(4px);
        }

        .dropdown-option.selected {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          font-weight: 600;
        }

        .dropdown-option.selected:hover {
          transform: translateX(0);
        }

        .option-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .check-icon {
          width: 18px;
          height: 18px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .no-options {
          padding: 32px 16px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
        }

        .no-options svg {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          opacity: 0.3;
        }

        .field-error {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .dropdown-trigger {
            padding: 14px 16px;
            font-size: 15px;
          }

          .dropdown-options {
            max-height: 240px;
          }
        }
      `}</style>

      {label && (
        <label className="dropdown-label">
          {icon}
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div
        className={`dropdown-trigger ${isOpen ? 'open' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          {icon && <span className="trigger-icon">{icon}</span>}
          <span className={`trigger-text ${!selectedOption ? 'placeholder' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg 
          className={`chevron-icon ${isOpen ? 'open' : ''}`}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {options.length > 5 && (
            <div className="dropdown-search">
              <div className="search-icon-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth={2.5} />
                  <path d="m21 21-4.35-4.35" strokeWidth={2.5} strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <div className="dropdown-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`dropdown-option ${option.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.icon && <span className="option-icon">{option.icon}</span>}
                  {option.label}
                  {option.value === value && (
                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div className="no-options">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2} strokeLinecap="round" />
                </svg>
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="field-error">
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
};

export default ModernDropdown;

// // Demo Component
// const ModernDropdownDemo = () => {
//   const [gender, setGender] = useState('');
//   const [status, setStatus] = useState('pending');
//   const [qualification, setQualification] = useState('');

//   const genderOptions = [
//     { 
//       value: 'male', 
//       label: 'Male',
//       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="10" cy="8" r="4" strokeWidth={2}/><path d="M10.5 15H9a4 4 0 00-4 4v2h10v-2a4 4 0 00-4-4h-.5z" strokeWidth={2}/></svg>
//     },
//     { 
//       value: 'female', 
//       label: 'Female',
//       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth={2}/><path d="M10.5 15H9a4 4 0 00-4 4v2h14v-2a4 4 0 00-4-4h-1.5" strokeWidth={2}/></svg>
//     },
//     { 
//       value: 'other', 
//       label: 'Other',
//       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={2}/></svg>
//     }
//   ];

//   const statusOptions = [
//     { 
//       value: 'pending', 
//       label: 'Pending',
//       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2}/><path d="M12 6v6l4 2" strokeWidth={2} strokeLinecap="round"/></svg>
//     },
//     { 
//       value: 'under_review', 
//       label: 'Under Review',
//       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth={2}/></svg>
//     },
//     { 
//       value: 'accepted', 
//       label: 'Accepted',
//       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2}/></svg>
//     },
//     { 
//       value: 'rejected', 
//       label: 'Rejected',
//       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2}/><path d="M15 9l-6 6M9 9l6 6" strokeWidth={2} strokeLinecap="round"/></svg>
//     }
//   ];

//   const qualificationOptions = [
//     { value: '10th', label: '10th Standard' },
//     { value: '12th', label: '12th Standard' },
//     { value: 'diploma', label: 'Diploma' },
//     { value: 'graduation', label: 'Graduation' },
//     { value: 'post_graduation', label: 'Post Graduation' },
//     { value: 'phd', label: 'Ph.D.' }
//   ];

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       padding: '40px 20px',
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
//     }}>
//       <div style={{
//         maxWidth: '800px',
//         margin: '0 auto',
//         background: 'white',
//         borderRadius: '24px',
//         padding: '40px',
//         boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
//       }}>
//         <div style={{ marginBottom: '32px', textAlign: 'center' }}>
//           <h1 style={{
//             fontSize: '32px',
//             fontWeight: '800',
//             background: 'linear-gradient(135deg, #667eea, #764ba2)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             marginBottom: '12px'
//           }}>
//             Modern Dropdown Component
//           </h1>
//           <p style={{ color: '#6b7280', fontSize: '16px' }}>
//             Beautiful, searchable, and accessible custom dropdowns
//           </p>
//         </div>

//         <div style={{ display: 'grid', gap: '28px' }}>
//           <ModernDropdown
//             label="Gender"
//             value={gender}
//             options={genderOptions}
//             onChange={setGender}
//             placeholder="Select your gender"
//             icon={
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//               </svg>
//             }
//             required
//           />

//           <ModernDropdown
//             label="Application Status"
//             value={status}
//             options={statusOptions}
//             onChange={setStatus}
//             placeholder="Select status"
//             icon={
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//               </svg>
//             }
//             required
//           />

//           <ModernDropdown
//             label="Qualification"
//             value={qualification}
//             options={qualificationOptions}
//             onChange={setQualification}
//             placeholder="Select qualification"
//             icon={
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
//               </svg>
//             }
//             required
//           />
//         </div>

//         <div style={{
//           marginTop: '40px',
//           padding: '24px',
//           background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
//           borderRadius: '16px',
//           border: '2px solid rgba(99, 102, 241, 0.2)'
//         }}>
//           <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>
//             Selected Values:
//           </h3>
//           <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8' }}>
//             <div><strong>Gender:</strong> {gender || 'Not selected'}</div>
//             <div><strong>Status:</strong> {status}</div>
//             <div><strong>Qualification:</strong> {qualification || 'Not selected'}</div>
//           </div>
//         </div>

//         <div style={{
//           marginTop: '32px',
//           padding: '20px',
//           background: '#f9fafb',
//           borderRadius: '12px',
//           fontSize: '14px',
//           color: '#6b7280',
//           lineHeight: '1.6'
//         }}>
//           <strong style={{ color: '#1f2937' }}>Features:</strong>
//           <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
//             <li>Searchable when more than 5 options</li>
//             <li>Smooth animations and transitions</li>
//             <li>Keyboard accessible</li>
//             <li>Custom icons support</li>
//             <li>Error state handling</li>
//             <li>Fully responsive design</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModernDropdownDemo;