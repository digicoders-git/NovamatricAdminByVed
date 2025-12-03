import React, { useState, useEffect, useRef } from 'react';

// Separate OTPModal Component
const OTPModal = ({ 
  email, 
  showOTPModal, 
  setShowOTPModal, 
  API_URL,
  onVerificationSuccess 
}) => {
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const inputRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown]);

  // Auto-focus input when OTP sent
  useEffect(() => {
    if (otpSent && inputRef.current) {
      inputRef.current.focus();
    }
  }, [otpSent]);

  // Reset when modal closes
  useEffect(() => {
    if (!showOTPModal) {
      resetModal();
    }
  }, [showOTPModal]);

  const resetModal = () => {
    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setCountdown(0);
    setOtpLoading(false);
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
  };

  const sendOTP = async () => {
    if (!email) {
      alert('Please enter your email first');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch(`${API_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      setCountdown(60);
      setOtpError('');
    } catch (error) {
      setOtpError(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch(`${API_URL}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          otp 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      if (onVerificationSuccess) {
        onVerificationSuccess();
      }
      
      setShowOTPModal(false);
    } catch (error) {
      setOtpError(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) {
      setOtpError(`Please wait ${countdown} seconds before resending OTP`);
      return;
    }
    await sendOTP();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && otp.length === 6) {
      verifyOTP();
    }
  };

  if (!showOTPModal) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <h2 style={modalStyles.title}>Email Verification</h2>
        
        {!otpSent ? (
          <>
            <p style={modalStyles.text}>
              We'll send a 6-digit OTP to:<br />
              <strong>{email}</strong>
            </p>
            <button
              onClick={sendOTP}
              disabled={otpLoading}
              style={{
                ...modalStyles.btn,
                ...modalStyles.btnPrimary,
                opacity: otpLoading ? 0.7 : 1,
                padding: '12px 30px',
                fontSize: '16px'
              }}
            >
              {otpLoading ? (
                <>
                  <span style={modalStyles.spinner}></span>
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </>
        ) : (
          <>
            <p style={modalStyles.text}>
              Enter the 6-digit OTP sent to:<br />
              <strong>{email}</strong>
            </p>
            
            <div style={modalStyles.otpContainer}>
              <input
                ref={inputRef}
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                style={modalStyles.otpInput}
                maxLength={6}
              />
            </div>

            {otpError && (
              <div style={modalStyles.error}>
                <span style={modalStyles.errorIcon}>⚠</span>
                <span>{otpError}</span>
              </div>
            )}

            <div style={modalStyles.buttonGroup}>
              <button
                onClick={resendOTP}
                disabled={countdown > 0 || otpLoading}
                style={{
                  ...modalStyles.btn,
                  ...modalStyles.btnSecondary,
                  opacity: (countdown > 0 || otpLoading) ? 0.5 : 1
                }}
              >
                {countdown > 0 ? `Resend (${countdown}s)` : 'Resend OTP'}
              </button>
              <button
                onClick={verifyOTP}
                disabled={otpLoading || otp.length !== 6}
                style={{
                  ...modalStyles.btn,
                  ...modalStyles.btnPrimary,
                  opacity: (otpLoading || otp.length !== 6) ? 0.7 : 1
                }}
              >
                {otpLoading ? (
                  <>
                    <span style={modalStyles.spinner}></span>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => setShowOTPModal(false)}
          style={modalStyles.closeBtn}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Main Registration Component
const Registration = () => {
  const initialFormState = {
    fullName: '',
    age: '',
    gender: '',
    location: '',
    education: '',
    email: '',
    householdSize: '',
    maritalStatus: '',
    income: '',
    homeOwnership: '',
    employmentStatus: '',
    jobTitle: '',
    industry: '',
    experience: '',
    designation: '',
    orgSize: '',
    purchaseDecision: '',
    vehicle: '',
    dataConsent: '',
    nda: '',
    ageConfirm: '',
    communication: '',
    finalConsent: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitResponse, setSubmitResponse] = useState(null);
  
  // OTP States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Reset OTP verification when email changes
  useEffect(() => {
    if (otpVerified && formData.email) {
      setOtpVerified(false);
    }
  }, [formData.email, otpVerified]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitError('');
  };

  const industries = [
    "Agriculture", "Forestry", "Fishing", "Extraction / Mining", "Energy", "Oil & Gas", "Utilities",
    "Construction", "Electrical / Plumbing / HVAC", "Carpentry & Installations",
    "Maintenance Services (Landscaping, Snow Removal, etc.)", "Manufacturing",
    "Chemicals / Plastics / Rubber", "Consumer Packaged Goods (CPG)", "Printing & Publishing",
    "Food & Beverage Manufacturing", "Transportation", "Shipping / Distribution", "Wholesale",
    "Retail", "E-commerce", "Consumer Electronics", "Automotive (Sales/Service)", "Hospitality",
    "Tourism", "Personal Services (Housekeeping, Gardening, Child Care, etc.)", "Healthcare",
    "Animal Healthcare / Veterinary Medicine", "Bio-Tech / Pharmaceuticals", "Information Technology",
    "Computer Hardware", "Computer Software", "Telecommunications", "Internet",
    "Banking / Financial Services", "Insurance", "Architecture", "Engineering", "Legal Services",
    "Consulting (Management / Business Consulting)", "Accounting", "Real Estate",
    "Brokerage (Real Estate / Financial)", "Advertising & Public Relations", "Market Research",
    "Environmental Services", "Government / Public Sector", "Military", "Social Services",
    "Education", "Media", "Entertainment", "Communications", "Other"
  ];

  const ageOptions = ['18–24', '25–34', '35–44', '45–54', '55+'];
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const householdOptions = ['1', '2', '3–4', '5 or more'];
  const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
  const homeOptions = ['Own', 'Rent'];
  const experienceOptions = ['0-1 year', '2-5 years', '6–10 years', '10+ years'];
  const purchaseOptions = ['Yes', 'No'];
  const vehicleOptions = ['Car', 'Two-Wheeler', 'None'];
  const yesNoOptions = ['Yes', 'No'];

  const handleOTPVerificationSuccess = () => {
    setOtpVerified(true);
  };

  const handleSubmit = async () => {
    if (!otpVerified) {
      alert('Please verify your email before submitting');
      setShowOTPModal(true);
      return;
    }

    if (!formData.finalConsent) {
      alert('Please agree to the terms before submitting.');
      return;
    }

    if (formData.ageConfirm !== 'Yes') {
      alert('You must confirm you are 18 years or older.');
      return;
    }

    const required = [
      "fullName", "age", "gender", "location", "education", "email", "householdSize",
      "maritalStatus", "income", "homeOwnership", "employmentStatus", "industry",
      "experience", "designation", "orgSize", "purchaseDecision", "vehicle",
      "dataConsent", "nda", "ageConfirm", "communication"
    ];

    for (const field of required) {
      if (!formData[field] || formData[field] === "") {
        alert(`${field} is required`);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_URL}/api/registration/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          emailVerified: true
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      setSubmitResponse(data);
      setShowSuccess(true);
    } catch (error) {
      console.error('❌ Submission error:', error);
      setSubmitError(error.message || 'An error occurred. Please try again.');
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Radio Option Component
  const RadioOption = ({ name, value, checked, onChange, label }) => (
    <label className="radio-label">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required
      />
      <span>{label}</span>
    </label>
  );

  const sections = [
    {
      title: "Basic Information",
      number: 1,
      content: (
        <>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Age *</label>
            <div className="radio-group">
              {ageOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="age"
                  value={opt}
                  checked={formData.age === opt}
                  onChange={() => handleChange('age', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <div className="radio-group">
              {genderOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="gender"
                  value={opt}
                  checked={formData.gender === opt}
                  onChange={() => handleChange('gender', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Country, City & State of Residence *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., New York, NY, USA"
              required
            />
          </div>

          <div className="form-group">
            <label>Highest Level of Education *</label>
            <select
              value={formData.education}
              onChange={(e) => handleChange('education', e.target.value)}
              required
            >
              <option value="">Select education level</option>
              <option value="less-high">Less than High School</option>
              <option value="high">High School / Diploma</option>
              <option value="grad">Graduate</option>
              <option value="postgrad">Postgraduate</option>
              <option value="doctorate">Doctorate</option>
            </select>
          </div>
        </>
      )
    },
    {
      title: "Contact & Verification",
      number: 2,
      content: (
        <>
          <div className="form-group">
            <label>Primary Email Address *</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowOTPModal(true)}
                style={{
                  padding: '10px 20px',
                  background: otpVerified ? '#48bb78' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s'
                }}
              >
                {otpVerified ? '✓ Verified' : 'Verify Email'}
              </button>
            </div>
            {otpVerified && (
              <p style={{ color: '#48bb78', marginTop: '10px', fontWeight: '500' }}>
                ✓ Email verified successfully
              </p>
            )}
            {!otpVerified && formData.email && (
              <p style={{ color: '#e53e3e', marginTop: '10px', fontSize: '0.9rem' }}>
                ⚠ Email not verified. Click "Verify Email" to continue.
              </p>
            )}
          </div>
        </>
      )
    },
    {
      title: "Household Information",
      number: 3,
      content: (
        <>
          <div className="form-group">
            <label>How many people live in your household (including you)? *</label>
            <div className="radio-group">
              {householdOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="household"
                  value={opt}
                  checked={formData.householdSize === opt}
                  onChange={() => handleChange('householdSize', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Marital Status *</label>
            <div className="radio-group">
              {maritalOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="marital"
                  value={opt}
                  checked={formData.maritalStatus === opt}
                  onChange={() => handleChange('maritalStatus', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Annual Household Income *</label>
            <select
              value={formData.income}
              onChange={(e) => handleChange('income', e.target.value)}
              required
            >
              <option value="">Select income range</option>
              <option value="$0-25">$0 – $25,000</option>
              <option value="$25-50">$25,000 – $50,000</option>
              <option value="$51-100">$51,000 – $100,000</option>
              <option value="$100-150">$100,000 – $150,000</option>
              <option value="$150+">$150,000+</option>
            </select>
          </div>

          <div className="form-group">
            <label>Do you own or rent your home? *</label>
            <div className="radio-group">
              {homeOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="home"
                  value={opt}
                  checked={formData.homeOwnership === opt}
                  onChange={() => handleChange('homeOwnership', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>
        </>
      )
    },
    {
      title: "Professional Background",
      number: 4,
      content: (
        <>
          <div className="form-group">
            <label>Current Employment Status *</label>
            <select
              value={formData.employmentStatus}
              onChange={(e) => handleChange('employmentStatus', e.target.value)}
              required
            >
              <option value="">Select employment status</option>
              <option value="full">Employed Full-Time</option>
              <option value="part">Employed Part-Time</option>
              <option value="self">Self-Employed</option>
              <option value="student">Student</option>
              <option value="homemaker">Homemaker</option>
              <option value="retired">Retired</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Job Title (if employed)</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="Your current job title"
            />
          </div>

          <div className="form-group">
            <label>Which industry do you work in? *</label>
            <select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              required
            >
              <option value="">Select your industry</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>How many years of work experience do you have? *</label>
            <div className="radio-group">
              {experienceOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="experience"
                  value={opt}
                  checked={formData.experience === opt}
                  onChange={() => handleChange('experience', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Designation Level *</label>
            <select
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              required
            >
              <option value="">Select designation level</option>
              <option value="entry">Entry-Level</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior Management</option>
              <option value="director">Director / C-Suite</option>
            </select>
          </div>

          <div className="form-group">
            <label>How many employees work in your organization? *</label>
            <select
              value={formData.orgSize}
              onChange={(e) => handleChange('orgSize', e.target.value)}
              required
            >
              <option value="">Select organization size</option>
              <option value="<10">Less than 10</option>
              <option value="10-50">10–50</option>
              <option value="51-200">51–200</option>
              <option value="201-500">201–500</option>
              <option value="500-1000">500–1,000</option>
              <option value="1000-2500">1,000–2,500</option>
              <option value="2500+">2,500+</option>
            </select>
          </div>
        </>
      )
    },
    {
      title: "Lifestyle & Consumer Behavior",
      number: 5,
      content: (
        <>
          <div className="form-group">
            <label>Do you make purchase decisions for your household? *</label>
            <div className="radio-group">
              {purchaseOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="purchase"
                  value={opt}
                  checked={formData.purchaseDecision === opt}
                  onChange={() => handleChange('purchaseDecision', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Do you own a vehicle? *</label>
            <div className="radio-group">
              {vehicleOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="vehicle"
                  value={opt}
                  checked={formData.vehicle === opt}
                  onChange={() => handleChange('vehicle', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>
        </>
      )
    },
    {
      title: "Consent & Agreement",
      number: 6,
      content: (
        <>
          <div className="consent-box">
            <h3>NovaMetric Research – Official Participant Consent</h3>
            <div className="consent-content">
              <p>This survey is administered by <strong>NovaMetric Research Private Limited</strong> on behalf of our client. Please read the following terms carefully before participating.</p>
              
              <h4>1. Purpose of the Survey</h4>
              <p>The objective is to gather information for market research and analytical use only. All insights will be provided in aggregated or anonymized form.</p>
              
              <h4>2. Voluntary Participation & Withdrawal</h4>
              <p>Your participation is entirely voluntary. You may decline, skip questions, or exit at any time without penalty.</p>
              
              <h4>3. Data Privacy, Confidentiality & Security</h4>
              <p>We collect only necessary information. All data will be analyzed and reported in aggregated, anonymized format. Your identity will never be disclosed to the Client without explicit consent.</p>
              
              <h4>4. Your Rights as a Participant</h4>
              <p>You may withdraw at any point, request deletion of identifiable data, decline questions, or request clarification about data processing.</p>
              
              <h4>5. Liability Limitation</h4>
              <p>NovaMetric operates as a data collection and analysis partner. We are not liable for Client decisions based on survey outcomes or for damages from respondent-provided information.</p>
            </div>
          </div>

          <div className="form-group">
            <label>Do you consent to your data being used for research purposes only? *</label>
            <div className="radio-group">
              {yesNoOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="consent1"
                  value={opt}
                  checked={formData.dataConsent === opt}
                  onChange={() => handleChange('dataConsent', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Do you agree not to disclose any study-related information? *</label>
            <div className="radio-group">
              {yesNoOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="nda"
                  value={opt}
                  checked={formData.nda === opt}
                  onChange={() => handleChange('nda', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Are you 18 years or older? *</label>
            <div className="radio-group">
              {yesNoOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="ageConfirm"
                  value={opt}
                  checked={formData.ageConfirm === opt}
                  onChange={() => handleChange('ageConfirm', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Do you agree to receive communication regarding research opportunities? *</label>
            <div className="radio-group">
              {yesNoOptions.map(opt => (
                <RadioOption
                  key={opt}
                  name="comm"
                  value={opt}
                  checked={formData.communication === opt}
                  onChange={() => handleChange('communication', opt)}
                  label={opt}
                />
              ))}
            </div>
          </div>

          <div className="final-consent">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.finalConsent}
                onChange={(e) => handleChange('finalConsent', e.target.checked)}
                required
              />
              <span>I have read, understood, and agree to all terms outlined above. I voluntarily consent to participate in this research.</span>
            </label>
          </div>
        </>
      )
    }
  ];

  const nextSection = () => {
    if (currentSection === 1 && formData.email && !otpVerified) {
      alert('Please verify your email before proceeding.');
      setShowOTPModal(true);
      return;
    }

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setCurrentSection(0);
    setSubmitError('');
    setSubmitResponse(null);
    setShowSuccess(false);
    setOtpVerified(false);
    setShowOTPModal(false);
  };

  // Success message component
  if (showSuccess) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Thank You!</h2>
          <p style={styles.successMessage}>
            Your registration has been successfully submitted.
          </p>
          
          {submitResponse && (
            <div style={styles.responseInfo}>
              <p><strong>Registration ID:</strong> {submitResponse.data?._id || submitResponse.data?.id}</p>
              <p><strong>Name:</strong> {submitResponse.data?.fullName}</p>
              <p><strong>Email:</strong> {submitResponse.data?.email}</p>
              <p><strong>Submitted at:</strong> {new Date(submitResponse.data?.createdAt).toLocaleString()}</p>
              <p style={{ color: '#48bb78', fontWeight: '500' }}>
                ✓ Email verified successfully
              </p>
            </div>
          )}
          
          <p style={styles.successSubMessage}>
            A confirmation email has been sent to your registered email address.
          </p>
          
          <div style={styles.buttonGroup}>
            <button 
              style={{...styles.btn, ...styles.btnInfo}} 
              onClick={() => {
                console.log('=== VIEWING SUBMITTED DATA ===');
                console.log('Form Data:', formData);
                console.log('API Response:', submitResponse);
                alert('Data logged to console. Check developer tools.');
              }}
            >
              View Data in Console
            </button>
            <button 
              style={{...styles.btn, ...styles.btnSecondary}} 
              onClick={resetForm}
            >
              Fill Another Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>NovaMetric Research</div>
        <div style={styles.subtitle}>Panel Brief Questionnaire</div>
      </header>

      <OTPModal
        email={formData.email}
        showOTPModal={showOTPModal}
        setShowOTPModal={setShowOTPModal}
        API_URL={API_URL}
        onVerificationSuccess={handleOTPVerificationSuccess}
      />

      <div style={styles.progressBar}>
        <div 
          style={{
            ...styles.progressFill,
            width: `${((currentSection + 1) / sections.length) * 100}%`
          }}
        />
      </div>

      <div style={styles.content}>
        {submitError && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠</span>
            <span>{submitError}</span>
          </div>
        )}

        <div style={styles.sectionIndicator}>
          Section {sections[currentSection].number} of {sections.length}
        </div>
        
        <h2 style={styles.sectionTitle}>{sections[currentSection].title}</h2>
        
        <div style={styles.sectionContent}>
          {sections[currentSection].content}
        </div>

        <div style={styles.buttonGroup}>
          {currentSection > 0 && (
            <button 
              style={{...styles.btn, ...styles.btnSecondary}} 
              onClick={prevSection}
              disabled={isSubmitting}
            >
              Previous
            </button>
          )}
          {currentSection < sections.length - 1 ? (
            <button 
              style={{...styles.btn, ...styles.btnPrimary}} 
              onClick={nextSection}
              disabled={isSubmitting}
            >
              Next Section
            </button>
          ) : (
            <button 
              style={{
                ...styles.btn, 
                ...styles.btnPrimary,
                ...(isSubmitting && styles.btnSubmitting)
              }} 
              onClick={handleSubmit}
              disabled={isSubmitting || !otpVerified}
            >
              {isSubmitting ? (
                <>
                  <span style={styles.spinner}></span>
                  Submitting...
                </>
              ) : (
                'Submit Registration'
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .form-group {
          margin-bottom: 2rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          background: #f8fafc;
          font-family: inherit;
        }

        .form-group input[type="text"]:focus,
        .form-group input[type="email"]:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .radio-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .radio-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 0.75rem 1.25rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          transition: all 0.2s;
          font-weight: 500;
          flex: 1;
          min-width: 120px;
        }

        .radio-label:hover {
          border-color: #cbd5e0;
          background: white;
        }

        .radio-label input[type="radio"] {
          margin-right: 0.5rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #667eea;
        }

        .radio-label:has(input:checked) {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .consent-box {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .consent-box h3 {
          color: #1a1a2e;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .consent-box h4 {
          color: #2d3748;
          font-size: 1rem;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .consent-box p {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .final-consent {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f0f4ff;
          border: 2px solid #667eea;
          border-radius: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          margin-right: 0.75rem;
          margin-top: 0.25rem;
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #667eea;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @media (max-width: 768px) {
          .radio-group {
            flex-direction: column;
          }
          
          .radio-label {
            min-width: 100%;
          }
          
          .form-group input[type="email"] {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
};

// Styles for Main Component
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  },
  header: {
    background: '#1a1a2e',
    color: 'white',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.95rem',
    opacity: 0.8,
    fontWeight: 300,
  },
  progressBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  sectionIndicator: {
    fontSize: '0.85rem',
    color: '#667eea',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    color: '#1a1a2e',
    marginBottom: '2rem',
    fontWeight: 700,
  },
  sectionContent: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    marginBottom: '2rem',
  },
  errorAlert: {
    background: '#fed7d7',
    border: '2px solid #fc8181',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
  },
  errorIcon: {
    fontSize: '1.2rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  btn: {
    padding: '0.875rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minWidth: '120px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  btnSecondary: {
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
  },
  btnInfo: {
    background: '#4299e1',
    color: 'white',
    boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)',
  },
  btnSubmitting: {
    opacity: 0.8,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  successContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  },
  successBox: {
    background: 'white',
    padding: '3rem',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%',
  },
  successIcon: {
    fontSize: '4rem',
    color: '#48bb78',
    marginBottom: '1rem',
    animation: 'scaleIn 0.5s ease',
  },
  successTitle: {
    fontSize: '2rem',
    color: '#1a1a2e',
    marginBottom: '1rem',
  },
  successMessage: {
    fontSize: '1.1rem',
    color: '#4a5568',
    marginBottom: '1.5rem',
  },
  responseInfo: {
    background: '#f7fafc',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    textAlign: 'left',
    border: '1px solid #e2e8f0',
  },
  successSubMessage: {
    fontSize: '0.9rem',
    color: '#718096',
    fontStyle: 'italic',
    marginBottom: '2rem',
  },
};

// Styles for OTP Modal
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  content: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    animation: 'modalSlideIn 0.3s ease',
  },
  title: {
    fontSize: '1.5rem',
    color: '#1a1a2e',
    marginBottom: '1rem',
    fontWeight: 700,
  },
  text: {
    color: '#4a5568',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
    fontSize: '0.95rem',
  },
  otpContainer: {
    margin: '1.5rem 0',
  },
  otpInput: {
    width: '100%',
    padding: '15px',
    fontSize: '1.5rem',
    textAlign: 'center',
    letterSpacing: '10px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  },
  error: {
    background: '#fed7d7',
    border: '2px solid #fc8181',
    color: '#c53030',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
  },
  errorIcon: {
    fontSize: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  btn: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '120px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  btnSecondary: {
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
    marginRight: '0.5rem',
  },
  closeBtn: {
    marginTop: '1.5rem',
    padding: '10px 20px',
    background: 'transparent',
    color: '#718096',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
};

export default Registration;