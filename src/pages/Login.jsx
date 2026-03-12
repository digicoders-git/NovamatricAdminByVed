// Login.jsx - Updated component
import { useState } from "react";
import { loginAdmin } from "../api/apiClient";
import "./Login.css";

export default function Login({ setAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await loginAdmin(username, password);

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberedUser", username);
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
    if (e.key === 'Enter' && username && password) {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-modern">
        {/* Left Side - Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="company-badge">
              {/* <div className="company-logo-wrapper">
                <span role="img" aria-label="logo"></span>
              </div> */}
              <img src="/logo.png" alt="" />
            </div>

            <h1 className="hero-title">
              Welcome to <span>Admin</span> Portal
            </h1>

            <p className="hero-description">
              Manage your research team, track projects, and monitor performance all in one place.
            </p>

            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">🔒</span>
                <span className="stat-label">Secure Access</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">⚡</span>
                <span className="stat-label">Fast & Reliable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-section">
          <div className="login-header">
            <span className="welcome-back">Welcome back</span>
            <h2>Sign in</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="error-message-modern">
              <span className="error-icon-modern">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className={error ? "error" : ""}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className={error ? "error" : ""}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-options-modern">
            {/* <a href="#" className="forgot-link">Forgot password?</a> */}
          </div>

          <button 
            onClick={handleLogin} 
            disabled={isLoading || !username || !password}
            className="login-btn"
          >
            {isLoading ? (
              <>
                <div className="spinner-modern"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="login-footer-modern">
            {/* <p>Need help?<a href="mailto:sp@novametricresearch.com"> Contact Support</a></p> */}
            <p style={{ fontSize: '12px', marginTop: '10px' }}>
              © 2026 Novametric Research. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}