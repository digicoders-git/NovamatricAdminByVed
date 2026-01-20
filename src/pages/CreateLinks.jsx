import React, { useState, useEffect } from "react";
import DashboardLayout from "./Dashboard";
import './CSS/Redirectlinks.css'

const CreateLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [dynamicParams, setDynamicParams] = useState([
    { id: 1, key: "pid", value: "1123" },
    { id: 2, key: "uid", value: "12134" }
  ]);

  const [newParam, setNewParam] = useState({ key: "", value: "" });
  const [status, setStatus] = useState("complete");
  const [linkName, setLinkName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [notification, setNotification] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/surveylink/get-links`);
      const data = await response.json();
      
      if (data.success) {
        setLinks(data.data);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
      showNotification("Failed to load links", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openModal = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setDynamicParams([
      { id: 1, key: "pid", value: "1123" },
      { id: 2, key: "uid", value: "12134" }
    ]);
    setNewParam({ key: "", value: "" });
    setStatus("complete");
    setLinkName("");
    setGeneratedLink("");
  };

  const addParam = () => {
    if (!newParam.key.trim() || !newParam.value.trim()) {
      showNotification("Both key and value are required!", "error");
      return;
    }

    const newId = Math.max(...dynamicParams.map(p => p.id), 0) + 1;
    setDynamicParams([
      ...dynamicParams,
      { id: newId, key: newParam.key, value: newParam.value }
    ]);
    setNewParam({ key: "", value: "" });
    showNotification("Parameter added!");
  };

  const removeParam = (id) => {
    setDynamicParams(dynamicParams.filter(param => param.id !== id));
    showNotification("Parameter removed!", "info");
  };

  const updateParam = (id, field, value) => {
    setDynamicParams(
      dynamicParams.map(param =>
        param.id === id ? { ...param, [field]: value } : param
      )
    );
  };

  const generateLink = () => {
    let baseUrl = `${API_URL}/api/survey/click`;
    let params = [];

    dynamicParams.forEach(param => {
      if (param.key.trim() && param.value.trim()) {
        params.push(
          `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`
        );
      }
    });

    params.push(`status=${encodeURIComponent(status)}`);

    const finalUrl = `${baseUrl}?${params.join("&")}`;
    return finalUrl;
  };

  useEffect(() => {
    const link = generateLink();
    setGeneratedLink(link);
  }, [dynamicParams, status]);

  const saveLinkToDB = async () => {
    if (!linkName.trim()) {
      showNotification("Please give this link a name!", "error");
      return;
    }

    try {
      const parameters = {};
      dynamicParams.forEach(param => {
        if (param.key.trim() && param.value.trim()) {
          parameters[param.key] = param.value;
        }
      });

      const response = await fetch(`${API_URL}/api/surveylink/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: linkName,
          url: generatedLink,
          status: status,
          parameters: parameters,
        })
      });

      const data = await response.json();

      if (data.success) {
        setLinks([data.data, ...links]);
        showNotification("Link saved to database!");
        closeModal();
      } else {
        showNotification(data.message || "Failed to save link", "error");
      }
    } catch (error) {
      console.error("Error saving link:", error);
      showNotification("Failed to save link to database", "error");
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    showNotification("Link copied to clipboard!");
  };

  const shareLink = (link) => {
    if (navigator.share) {
      navigator.share({
        title: "Survey Link",
        text: "Check out this survey link:",
        url: link
      });
    } else {
      copyToClipboard(link);
    }
  };

  // Function to delete a link
  const deleteLink = async (linkId) => {
    if (!window.confirm("Are you sure you want to delete this link?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/surveylink/links/${linkId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setLinks(links.filter(link => link._id !== linkId));
        showNotification("Link deleted successfully!");
      } else {
        showNotification(data.message || "Failed to delete link", "error");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      showNotification("Failed to delete link", "error");
    }
  };

  // Function to toggle active/inactive status
  const toggleActiveStatus = async (linkId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/surveylink/links/${linkId}/toggle-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        setLinks(links.map(link => 
          link._id === linkId 
            ? { ...link, isActive: !currentStatus } 
            : link
        ));
        showNotification(`Link ${!currentStatus ? 'activated' : 'deactivated'}!`);
      } else {
        showNotification(data.message || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification("Failed to update status", "error");
    }
  };

  const statusOptions = [
    { value: "complete", label: "Complete", color: "#10B981" },
    { value: "terminate", label: "Terminate", color: "#EF4444" },
    { value: "quota_full", label: "Quota Full", color: "#F59E0B" },
  ];

  return (
    <DashboardLayout>
      <div className="dynamic-link-builder">
        {/* Notification Toast */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="container">
          {/* Header */}
          <div className="redirect-header">
            <h1>Redirect Links</h1>
            <button className="create-btn" onClick={openModal}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Link
            </button>
          </div>

          {/* Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading links...</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>LINK NAME</th>
                    <th>STATUS</th>
                    <th>URL</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link._id}>
                      <td>
                        <div className="link-cell">
                          <div>
                            <div className="link-name">{link.name || "Unnamed Link"}</div>
                            <div className="link-date">
                              {new Date(link.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={link.isActive !== false}
                              onChange={() => toggleActiveStatus(link._id, link.isActive)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span className={`status-text ${link.isActive !== false ? 'active' : 'inactive'}`}>
                            {link.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="link-cell">
                          <svg width="18" height="18" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="link-url">{link.url}</span>
                        </div>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="action-btn copy-btn"
                            onClick={() => copyToClipboard(link.url)}
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </button>
                          <button
                            className="action-btn share-btn"
                            onClick={() => shareLink(link.url)}
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteLink(link._id)}
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && links.length === 0 && (
              <div className="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>No links created yet</h3>
                <p>Click "Create New Link" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Create New Survey Link</h2>
                <button className="close-btn" onClick={closeModal}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Link Name */}
              <div className="form-group">
                <label className="label">Link Name</label>
                <input
                  type="text"
                  className="input"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g., Facebook Campaign - Summer 2024"
                />
              </div>

              {/* Status Selection */}
              <div className="form-group">
                <label className="label">Status</label>
                <div className="status-options">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      className={`status-btn ${status === option.value ? 'active' : ''}`}
                      onClick={() => setStatus(option.value)}
                      style={{
                        borderColor: status === option.value ? option.color : '#E5E7EB',
                        background: status === option.value ? option.color : 'white',
                        color: status === option.value ? 'white' : '#374151'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Parameters */}
              <div className="form-group">
                <h3 className="label">Dynamic Parameters</h3>

                {/* Add New Parameter */}
                <div className="param-inputs">
                  <input
                    type="text"
                    placeholder="Key (e.g., campaign_id)"
                    value={newParam.key}
                    onChange={(e) => setNewParam({...newParam, key: e.target.value})}
                    className="param-input"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., 12345)"
                    value={newParam.value}
                    onChange={(e) => setNewParam({...newParam, value: e.target.value})}
                    className="param-input"
                  />
                  <button
                    className="action-btn copy-btn"
                    onClick={addParam}
                  >
                    Add
                  </button>
                </div>

                {/* Parameter List */}
                <div className="param-list">
                  {dynamicParams.map(param => (
                    <div key={param.id} className="param-item">
                      <input
                        type="text"
                        className="param-input"
                        value={param.key}
                        onChange={(e) => updateParam(param.id, "key", e.target.value)}
                      />
                      <span style={{ color: "#6B7280", fontWeight: "600" }}>=</span>
                      <input
                        type="text"
                        className="param-input"
                        value={param.value}
                        onChange={(e) => updateParam(param.id, "value", e.target.value)}
                      />
                      <button
                        className="delete-param-btn"
                        onClick={() => removeParam(param.id)}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Link Display */}
              {generatedLink && (
                <div className="generated-link">
                  <h4>Generated Link Preview:</h4>
                  <div className="link-preview">
                    {generatedLink}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button className="save-btn" onClick={saveLinkToDB}>
                Save Link
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateLinks;