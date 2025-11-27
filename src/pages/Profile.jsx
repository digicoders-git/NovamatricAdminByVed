import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './CSS/Profile.css';
import DashboardLayout from './Dashboard';

export default function Profile() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const [adminData, setAdminData] = useState(null);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Get admin from localStorage
  const admin = JSON.parse(localStorage.getItem("admin"));

  // --------------------------------------------------
  // 🔥 Fetch Admin Details on Component Load
  // --------------------------------------------------
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/getAdmin/${admin.id}`);
        const data = await res.json();

        if (data.success) {
          setAdminData(data.admin);
        }
      } catch (err) {
        console.log("Error fetching admin:", err);
      }
    };

    fetchAdmin();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage('');
  };

  // --------------------------------------------------
  // 🔥 Change Password Function
  // --------------------------------------------------
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New password and confirm password do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/changePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminId: admin.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Password successfully changed!");

        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Auto-close password form
        setTimeout(() => {
          setShowPasswordForm(false);
          setMessage('');
        }, 2000);

      } else {
        setMessage(data.message);
      }

    } catch (err) {
      console.log("Password change error:", err);
      setMessage("Error while changing password.");
    }
  };

  return (
    <DashboardLayout>
      <div className="profileContainer">

        <div className="profileCard">
          <div className="profileHeader">
            <div className="profileAvatar">
              <User className="profileAvatarIcon" />
            </div>

            <h1 className="profileTitle">
              {adminData ? adminData.username : "Loading..."}
            </h1>

            <p className="profileSubtitle">Administrator</p>
          </div>

          <div className="profileBody">
            {adminData && (
              <div className="profileInfoSection">
                
                <div className="profileInfoItem">
                  <User className="profileInfoIcon" />
                  <div className="profileInfoContent">
                    <div className="profileInfoLabel">Username</div>
                    <div className="profileInfoValue">{adminData.name}</div>
                  </div>
                </div>

                <div className="profileInfoItem">
                  <Mail className="profileInfoIcon" />
                  <div className="profileInfoContent">
                    <div className="profileInfoLabel">Email</div>
                    <div className="profileInfoValue">
                      {adminData.username || "Not Provided"}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Show Change Password Button */}
            {!showPasswordForm ? (
              <button
                className="profileButton"
                onClick={() => setShowPasswordForm(true)}
              >
                <Lock style={{ width: '20px', height: '20px' }} />
                Change Password
              </button>
            ) : (
              <div className="profilePasswordForm">

                {message && (
                  <div className={`profileMessage ${message.includes('successfully') ? 'profileMessageSuccess' : 'profileMessageError'}`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handlePasswordChange}>

                  {/* Current Password */}
                  <div className="profileFormGroup">
                    <label className="profileLabel">Current Password</label>
                    <div className="profileInputWrapper">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="profileInput"
                        required
                      />
                      {showCurrentPassword ? (
                        <EyeOff
                          className="profileEyeIcon"
                          onClick={() => setShowCurrentPassword(false)}
                        />
                      ) : (
                        <Eye
                          className="profileEyeIcon"
                          onClick={() => setShowCurrentPassword(true)}
                        />
                      )}
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="profileFormGroup">
                    <label className="profileLabel">New Password</label>
                    <div className="profileInputWrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="profileInput"
                        required
                      />
                      {showNewPassword ? (
                        <EyeOff
                          className="profileEyeIcon"
                          onClick={() => setShowNewPassword(false)}
                        />
                      ) : (
                        <Eye
                          className="profileEyeIcon"
                          onClick={() => setShowNewPassword(true)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="profileFormGroup">
                    <label className="profileLabel">Confirm Password</label>
                    <div className="profileInputWrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="profileInput"
                        required
                      />
                      {showConfirmPassword ? (
                        <EyeOff
                          className="profileEyeIcon"
                          onClick={() => setShowConfirmPassword(false)}
                        />
                      ) : (
                        <Eye
                          className="profileEyeIcon"
                          onClick={() => setShowConfirmPassword(true)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="profileButtonGroup">
                    <button type="submit" className="profileSubmitButton">
                      Update Password
                    </button>

                    <button
                      type="button"
                      className="profileCancelButton"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setFormData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setMessage('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
