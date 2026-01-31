import React, { useState, useEffect } from "react";
import DashboardLayout from "./Dashboard";
import './CSS/Redirectlinks.css'

const CreateLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  
  const [dynamicParams, setDynamicParams] = useState([]); // Empty array se start karo
  const [newParam, setNewParam] = useState({ key: "", value: "" });
  const [status, setStatus] = useState("complete");
  const [linkName, setLinkName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [notification, setNotification] = useState(null);

  const [enableMultipleRedirects, setEnableMultipleRedirects] = useState(false);
  const [redirectLinks, setRedirectLinks] = useState([
    { id: 1, url: "", name: "" }
  ]);
  const [nextRedirectId, setNextRedirectId] = useState(2);

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

  const openModal = () => {
    setShowModal(true);
    resetForm();
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setDynamicParams([]); // Empty parameters
    setNewParam({ key: "", value: "" });
    setStatus("complete");
    setLinkName("");
    setGeneratedLink("");
    setEnableMultipleRedirects(false);
    setRedirectLinks([{ id: 1, url: "", name: "" }]);
    setNextRedirectId(2);
  };

  const addParam = () => {
    if (!newParam.key.trim()) {
      showNotification("Key is required!", "error");
      return;
    }

    const newId = Math.max(...dynamicParams.map(p => p.id), 0) + 1;
    setDynamicParams([
      ...dynamicParams,
      { id: newId, key: newParam.key.trim(), value: newParam.value.trim() }
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

  const addRedirectLink = () => {
    setRedirectLinks([
      ...redirectLinks,
      { id: nextRedirectId, url: "", name: "" }
    ]);
    setNextRedirectId(nextRedirectId + 1);
  };

  const removeRedirectLink = (id) => {
    if (redirectLinks.length === 1) {
      showNotification("At least one redirect link is required", "error");
      return;
    }
    setRedirectLinks(redirectLinks.filter(link => link.id !== id));
    showNotification("Redirect link removed", "info");
  };

  const updateRedirectLink = (id, field, value) => {
    setRedirectLinks(
      redirectLinks.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const generateLinkPreview = () => {
    let baseUrl = `${API_URL}/api/survey/click`;
    let params = [];

    dynamicParams.forEach(param => {
      if (param.key.trim()) {
        const value = param.value.trim() || "VALUE";
        params.push(
          `${encodeURIComponent(param.key)}${value ? '=' + encodeURIComponent(value) : ''}`
        );
      }
    });

    params.push(`status=${encodeURIComponent(status)}`);

    const finalUrl = `${baseUrl}/LINK_ID?${params.join("&")}`;
    return finalUrl;
  };

  useEffect(() => {
    const link = generateLinkPreview();
    setGeneratedLink(link);
  }, [dynamicParams, status]);

  const saveLinkToDB = async () => {
    if (!linkName.trim()) {
      showNotification("Please give this link a name!", "error");
      return;
    }

    // Check if at least one parameter is provided
    const validParams = dynamicParams.filter(p => p.key.trim());
    
    if (validParams.length === 0) {
      showNotification("Please add at least one parameter!", "error");
      return;
    }

    // Check if multiple redirects are enabled
    if (enableMultipleRedirects) {
      const validRedirects = redirectLinks.filter(link => 
        link.url.trim() && link.name.trim()
      );
      
      if (validRedirects.length === 0) {
        showNotification("Please add at least one redirect link with both name and URL", "error");
        return;
      }
    }

    try {
      // Create parameters object
      const parameters = {};
      validParams.forEach(param => {
        parameters[param.key.trim()] = param.value.trim();
      });

      // Prepare redirect URLs if enabled
      const redirectData = enableMultipleRedirects 
        ? redirectLinks
            .filter(link => link.url.trim() && link.name.trim())
            .map(link => ({
              name: link.name.trim(),
              url: link.url.trim()
            }))
        : [];

      // Send data to backend
      const response = await fetch(`${API_URL}/api/surveylink/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: linkName.trim(),
          status: status,
          parameters: parameters,
          enableRedirects: enableMultipleRedirects,
          redirectLinks: redirectData
        })
      });

      const data = await response.json();

      if (data.success) {
        setLinks([data.data, ...links]);
        showNotification("Link created successfully!");
        closeModal();
      } else {
        showNotification(data.message || "Failed to create link", "error");
      }
    } catch (error) {
      console.error("Error saving link:", error);
      showNotification("Failed to create link", "error");
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

  const showFullUrl = (url) => {
    setSelectedUrl(url);
    setShowUrlModal(true);
  };

  const statusOptions = [
    { value: "complete", label: "Complete", color: "#10B981" },
    { value: "terminate", label: "Terminate", color: "#EF4444" },
    { value: "quota_full", label: "Quota Full", color: "#F59E0B" },
  ];

  return (
    <DashboardLayout>
      <div className="dynamic-link-builder">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="container">
          <div className="redirect-header">
            <div className="header">
              <h1>Redirect Links</h1>
            </div>
            <button className="create-btn" onClick={openModal}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Link
            </button>
          </div>

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
                    {/* <th>REDIRECTS</th> */}
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
                              checked={link.isActive}
                              onChange={() => toggleActiveStatus(link._id, link.isActive)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span className={`status-text ${link.isActive ? 'active' : 'inactive'}`}>
                            {link.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="url-cell">
                        <div 
                          className="url-display-container"
                          onClick={() => showFullUrl(link.url)}
                          title={link.url}
                        >
                          <div className="url-icon">
                            <svg width="16" height="16" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 005.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <div className="url-text-container">
                            <span className="url-text">
                              {link.url}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* <td>
                        {link.enableRedirects && link.redirectLinks && link.redirectLinks.length > 0 ? (
                          <div className="redirect-count">
                            <span className="redirect-badge">
                              {link.redirectLinks.length} redirects
                            </span>
                          </div>
                        ) : (
                          <span className="no-redirects">No redirects</span>
                        )}
                      </td> */}
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

        {/* Full URL Modal */}
        {showUrlModal && (
          <div className="modal-overlay">
            <div className="full-url-modal">
              <div className="full-url-header">
                <h3>Full URL</h3>
                <button className="close-btn" onClick={() => setShowUrlModal(false)}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="full-url-content">
                <pre className="full-url-text">{selectedUrl}</pre>
              </div>
              
              <div className="full-url-actions">
                <button
                  className="full-url-copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedUrl);
                    showNotification("URL copied to clipboard!");
                    setShowUrlModal(false);
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy URL
                </button>
                <button
                  className="full-url-close-btn"
                  onClick={() => setShowUrlModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Link Modal */}
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

              <div className="form-group">
                <label className="label">
                  Link Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g., Facebook Campaign - Summer 2024"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">
                  Status <span className="required">*</span>
                </label>
                <div className="status-options">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
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

              <div className="form-group">
                <h3 className="label">
                  Dynamic Parameters <span className="required">*</span>
                </h3>
                <small className="help-text">
                  Add at least one parameter. You can add any parameters you want (pid, uid, etc. are not required).
                </small>

                <div className="param-inputs">
                  <input
                    type="text"
                    placeholder="Key (e.g., campaign_id, pid, uid, etc.)"
                    value={newParam.key}
                    onChange={(e) => setNewParam({...newParam, key: e.target.value})}
                    className="param-input"
                  />
                  <input
                    type="text"
                    placeholder="Value (optional)"
                    value={newParam.value}
                    onChange={(e) => setNewParam({...newParam, value: e.target.value})}
                    className="param-input"
                  />
                  <button
                    type="button"
                    className="action-btn copy-btn"
                    onClick={addParam}
                  >
                    Add
                  </button>
                </div>

                <div className="param-list">
                  {dynamicParams.map(param => (
                    <div key={param.id} className="param-item">
                      <input
                        type="text"
                        className="param-input"
                        value={param.key}
                        onChange={(e) => updateParam(param.id, "key", e.target.value)}
                        placeholder="Key"
                      />
                      <span className="equals-sign">=</span>
                      <input
                        type="text"
                        className="param-input"
                        value={param.value}
                        onChange={(e) => updateParam(param.id, "value", e.target.value)}
                        placeholder="Value"
                      />
                      <button
                        type="button"
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

              <div className="form-group">
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span className="toggle-text">Add Multiple Redirect Links</span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={enableMultipleRedirects}
                        onChange={() => setEnableMultipleRedirects(!enableMultipleRedirects)}
                      />
                      <span className="slider"></span>
                    </label>
                  </label>
                  <small className="help-text">
                    Enable to add multiple URLs where users will be redirected after completing the survey
                  </small>
                </div>

                {enableMultipleRedirects && (
                  <div className="redirect-links-section">
                    <h4 className="section-title">Redirect Links</h4>
                    <small className="help-text">
                      Add URLs where users will be redirected. At least one redirect link is required.
                    </small>
                    
                    {redirectLinks.map((link) => (
                      <div key={link.id} className="redirect-link-item">
                        <div className="redirect-inputs">
                          <input
                            type="text"
                            className="redirect-input"
                            placeholder="Redirect Name (e.g., Thank You Page)"
                            value={link.name}
                            onChange={(e) => updateRedirectLink(link.id, "name", e.target.value)}
                          />
                          <input
                            type="url"
                            className="redirect-input"
                            placeholder="Redirect URL (e.g., https://example.com/thank-you)"
                            value={link.url}
                            onChange={(e) => updateRedirectLink(link.id, "url", e.target.value)}
                          />
                          <button
                            type="button"
                            className="delete-redirect-btn"
                            onClick={() => removeRedirectLink(link.id)}
                            disabled={redirectLinks.length === 1}
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="add-redirect-btn"
                      onClick={addRedirectLink}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Another Redirect Link
                    </button>
                  </div>
                )}
              </div>

              <div className="generated-link">
                <h4>Generated Link Preview:</h4>
                <div className="link-preview">
                  {generatedLink}
                </div>
                <small className="help-text">
                  LINK_ID will be replaced with actual ID when saved. Users will see VALUE in parameters.
                </small>
              </div>

              <button className="save-btn" onClick={saveLinkToDB}>
                Create Link
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateLinks;