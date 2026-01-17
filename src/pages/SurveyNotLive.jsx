import React from 'react';
import './CSS/SurveyNotLive.css'

const SurveyNotLive = () => {
  return (
    <div className="survey-not-live-container">
      <div className="survey-not-live-card">
        <header className="survey-header">
          <h1 className="company-name">MIXATS Group</h1>
          <div className="status-badge">
            <span className="status-text">Wait! Not Live</span>
          </div>
        </header>

        <main className="survey-content">
          <div className="warning-icon">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          
          <h2 className="message-title">The survey is not live yet.</h2>
          
          <p className="message-description">
            The survey you are trying to reach is not live yet, please try again after sometime. 
            Please feel free to try after sometime or contact us 
            <a href="mailto:support@miratsinsights.com" className="email-link">
              support@miratsinsights.com
            </a>
          </p>
          
          <div className="contact-section">
            <div className="calendar-icon">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="contact-title">📅 Contact Us</h3>
          </div>
          
          <div className="action-buttons">
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <a 
              href="mailto:support@miratsinsights.com"
              className="contact-button"
            >
              Contact Support
            </a>
          </div>
        </main>
        
        <footer className="survey-footer">
          <p className="footer-text">
            &copy; {new Date().getFullYear()} MIXATS Group. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SurveyNotLive;