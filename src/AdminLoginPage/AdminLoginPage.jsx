// ============= AdminLoginPage.jsx =============
import { useState } from 'react';
import './AdminLoginPage.css';

const AdminLoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  setErrors({});
  setLoading(true);
  
  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const data = await response.json();
    
    console.log('Backend response:', response.status, data);
    
    // FIX: Check for response.ok and access_token instead of data.success
    if (response.ok && data.access_token) {
      // Pass tokens to parent component
      onLogin({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type
      });
    } else {
      setErrors({ form: data.detail || data.message || 'Login failed' });
    }
  } catch (err) {
    console.error('Login error:', err);
    setErrors({ form: 'Login failed. Please try again.' });
  } finally {
    setLoading(false);
  }
};
  return (
    <div className={`login-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️' : '🌙'}
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <span>A</span>
          </div>
          <h1>Admin Portal</h1>
          <p>Sign in to manage applications</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {errors.form && <div className="error-banner">{errors.form}</div>}
          
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Secure admin access only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;