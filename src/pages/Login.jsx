import { useState } from "react";
import { loginAdmin } from "../api/apiClient";
import "./Login.css";

export default function Login({ setAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await loginAdmin(username, password);

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      setAuth(true);
    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-horizontal">
        {/* Left Side - Branding */}
        <div className="brand-section">
          {/* <div className="logo-container"> */}
            <img 
              src="/logo.png" 
              alt="Company Logo" 
              className="company-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="logo-placeholder">
              <span>🏢</span>
            </div>
          {/* </div> */}
          <div className="brand-content">
            {/* <h1 className="company-name">Novametric Research</h1> */}
            <p className="brand-tagline">Welcome to the Admin Portal</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure Access</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Fast & Reliable</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Team Management</span>
              </div>
            </div>
          </div>
          <div className="brand-footer">
            <br />
            <p>&copy; 2026 Novametric Research. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="form-section-horizontal">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className={error ? "error-input" : ""}
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className={error ? "error-input" : ""}
              disabled={isLoading}
            />
          </div>

          {/* <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div> */}

          <button 
            onClick={handleLogin} 
            disabled={isLoading || !username || !password}
            className={`login-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* <div className="login-footer">
            <p>Need help? <a href="#" className="support-link">Contact Support</a></p>
          </div> */}
        </div>
      </div>
    </div>
  );
}