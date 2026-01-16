"use client"

import { useState } from "react"
import './AdminLoginPage.css';

const AdminLoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    if (!email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.access_token) {
        onLogin({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenType: data.token_type,
        })
      } else {
        setErrors({ form: data.detail || data.message || "Login failed" })
      }
    } catch (err) {
      console.error("Login error:", err)
      setErrors({ form: "Login failed. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrapper">
      {/* Left side - Gradient background with content */}
      <div className="admin-login-left">
        <div className="admin-login-left-content">
          <h2>Welcome to website</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet
            dolore magna aliquam erat volutpat.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="admin-login-right">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h3>USER LOGIN</h3>
          </div>

          {errors.form && <div className="admin-login-error-banner">{errors.form}</div>}

          <form onSubmit={handleSubmit} className="admin-login-form">
            {/* Email field */}
            <div className="admin-login-form-group">
              <div className="admin-login-input-wrapper">
                <span className="admin-login-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "admin-login-form-input admin-login-input-error" : "admin-login-form-input"}
                />
              </div>
              {errors.email && <span className="admin-login-error-text">{errors.email}</span>}
            </div>

            {/* Password field */}
            <div className="admin-login-form-group">
              <div className="admin-login-input-wrapper">
                <span className="admin-login-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "admin-login-form-input admin-login-input-error" : "admin-login-form-input"}
                />
                <button
                  type="button"
                  className="admin-login-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="admin-login-error-text">{errors.password}</span>}
            </div>

            {/* Remember me and forgot password */}
            <div className="admin-login-form-footer">
              {/* <label className="admin-login-remember-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span>Remember</span>
              </label> */}
              {/* <a href="#" className="admin-login-forgot-password">
                Forgot password?
              </a> */}
            </div>

            {/* Submit button */}
            <button type="submit" className="admin-login-button" disabled={loading}>
              {loading ? <span className="admin-login-spinner"></span> : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage