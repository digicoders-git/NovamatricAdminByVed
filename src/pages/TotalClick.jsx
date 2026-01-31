import React, { useState, useEffect } from 'react';
import { FileDown, Download, Eye } from 'lucide-react';
import * as XLSX from "xlsx";
import DashboardLayout from './Dashboard';
import './CSS/CompleteServey.css';

const TotalClick = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 100;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAllSurveys();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAllSurveys();
    }, 500); // debounce

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchAllSurveys = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/survey/get-clicks?search=${search}`
      );

      const data = await response.json();
      console.log(data);
      
      if (data.success) {
        setSurveys(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- STATUS COLOR FUNCTION ----------------
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case 'terminate':
        return '#dc2626'; // Red for Terminate
      case 'complete':
        return '#059669'; // Green for Complete
      case 'quota_full':
        return '#f59e0b'; // Amber for Quota Full
      default:
        return '#6b7280'; // Gray for other statuses
    }
  };

  // ---------------- GET STATUS BADGE STYLE ----------------
  const getStatusBadgeStyle = (status) => {
    const backgroundColor = getStatusColor(status);
    
    // Calculate text color based on background brightness
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = brightness > 128 ? '#ffffff' : '#ffffff';
    
    return {
      backgroundColor,
      color: textColor,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block',
      minWidth: '80px',
      textAlign: 'center'
    };
  };

  // ---------------- VIEW RAW DATA ----------------
  const handleViewRawData = (survey) => {
    setSelectedSurvey(survey);
    setShowModal(true);
  };

  // ---------------- CLOSE MODAL ----------------
  const closeModal = () => {
    setShowModal(false);
    setSelectedSurvey(null);
  };

  // ---------------- FORMAT FIELD NAME ----------------
  const formatFieldName = (field) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  // ---------------- CSV EXPORT ----------------
  const exportToCSV = () => {
    const headers = ['S.No', 'User ID', 'Project ID', 'IP Address', 'Status', 'Completed At'];

    const csvData = surveys.map((survey, index) => [
      index + 1,
      survey?.dynamicFields?.uid || "",
      survey?.dynamicFields?.pid || "",
      survey.ipaddress  || "",
      survey.status  || "",
      new Date(survey.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TotalClick_surveys_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ---------------- EXCEL EXPORT ----------------
  const exportToExcel = () => {
    const excelData = surveys.map((survey, index) => ({
      "S.No": index + 1,
      "User ID": survey?.dynamicFields?.uid  || "",
      "Project ID": survey?.dynamicFields?.pid  || "",
      "IP Address": survey.ipaddress  || "",
      "Status": survey.status,
      "Completed At": new Date(survey.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Total Click Surveys");
    XLSX.writeFile(workbook, `total_click_surveys_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ---------------- PDF EXPORT ----------------
  const exportToPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Total Click Surveys Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .complete-footer { margin-top: 30px; text-align: center; color: #666; }
            .status-badge { 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: 600; 
              text-transform: capitalize; 
              display: inline-block; 
              min-width: 80px; 
              text-align: center; 
            }
            .terminate { background-color: #dc2626; color: white; }
            .complete { background-color: #059669; color: white; }
            .quota_full { background-color: #f59e0b; color: white; }
          </style>
        </head>
        <body>
          <h1>Total Click Surveys Report</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>User ID</th>
                <th>Project ID</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              ${surveys.map((survey, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${survey?.dynamicFields?.uid  || ""}</td>
                  <td>${survey?.dynamicFields.pid  || ""}</td>
                  <td>${survey.ipaddress}</td>
                  <td>
                    <span class="status-badge ${survey.status.toLowerCase()}">
                      ${survey.status}
                    </span>
                  </td>
                  <td>${new Date(survey.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="complete-footer">
            <p>Total Surveys: ${surveys.length}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // ---------------- GET STATUS COUNT ----------------
  const getStatusCount = (status) => {
    return surveys.filter(survey => survey.status?.toLowerCase() === status.toLowerCase()).length;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = surveys.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(surveys.length / itemsPerPage);

  

  return (
    <DashboardLayout>
      <div className="complete-main-container">
        <div className="complete-content-wrapper">

          <div className="complete-header">

            <div className="complete-title-section">
              <h1>📊 Total Click</h1>
              {/* <p className="complete-subtitle">Track and manage all survey responses</p> */}
            </div>

            <div className="complete-export-section">
              <button className="complete-export-btn complete-export-csv" onClick={exportToCSV}>
                <Download size={18} /> Export CSV
              </button>

              <button className="complete-export-btn complete-export-csv" onClick={exportToExcel}>
                <Download size={18} /> Export Excel
              </button>

              <button className="complete-export-btn complete-export-pdf" onClick={exportToPDF}>
                <FileDown size={18} /> Export PDF
              </button>
            </div>

            {/* 🔍 SEARCH BOX */}
            <div className="complete-search-box">
              <input
                type="text"
                placeholder="Search User ID, Project ID, IP, Status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="complete-search-input"
              />
            </div>

          </div>

          {/* TABLE CONTAINER WITH LOADING STATE */}
          <div className="complete-table-container">
            {loading ? (
              <div className="complete-loading-content">
                <div className="complete-spinner"></div>
                <p className="complete-loading-text">Loading surveys...</p>
              </div>
            ) : surveys.length === 0 ? (
              <div className="complete-empty-state">
                <h3>No Surveys Found</h3>
                <p>Try changing the search keywords.</p>
              </div>
            ) : (
              <>
                <div className="complete-table-wrapper">
                  <table className="complete-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>User ID</th>
                        <th>Project ID</th>
                        <th>IP Address</th>
                        <th>Status</th>
                        <th>Completed At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentItems.map((survey, index) => (
                        <tr key={survey._id}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>{survey?.dynamicFields.uid  || "N/A"}</td>
                          <td>{survey?.dynamicFields?.pid  || "N/A"}</td>
                          <td>{survey.ipaddress}</td>
                          <td>
                            <span style={getStatusBadgeStyle(survey.status)}>
                              {survey.status}
                            </span>
                          </td>
                          <td>{new Date(survey.createdAt).toLocaleString()}</td>
                          <td>
                            <button
                              className="complete-view-btn"
                              onClick={() => handleViewRawData(survey)}
                              title="View Raw Data"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="complete-pagination">
                    <button
                      className="complete-page-btn"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    <span className="complete-page-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      className="complete-page-btn"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* ---------- MODAL FOR RAW DATA ---------- */}
      {showModal && selectedSurvey && (
        <div className="complete-modal-overlay" onClick={closeModal}>
          <div className="complete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="complete-modal-header">
              <h2>📋 Survey Raw Data</h2>
              <button className="complete-modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <div className="complete-modal-body">
              <div className="complete-raw-data-info">
                <div className="complete-info-row">
                  <span className="complete-info-label">User ID:</span>
                  <span className="complete-info-value">{selectedSurvey.uid}</span>
                </div>
                <div className="complete-info-row">
                  <span className="complete-info-label">Project ID:</span>
                  <span className="complete-info-value">{selectedSurvey.pid}</span>
                </div>
                <div className="complete-info-row">
                  <span className="complete-info-label">IP Address:</span>
                  <span className="complete-info-value">{selectedSurvey.ipaddress}</span>
                </div>
                <div className="complete-info-row">
                  <span className="complete-info-label">Status:</span>
                  <span className="complete-info-value">
                    <span style={getStatusBadgeStyle(selectedSurvey.status)}>
                      {selectedSurvey.status}
                    </span>
                  </span>
                </div>
                <div className="complete-info-row">
                  <span className="complete-info-label">Completed At:</span>
                  <span className="complete-info-value">
                    {new Date(selectedSurvey.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="complete-raw-data-table-container">
                <h3>All Fields</h3>
                <table className="complete-raw-data-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedSurvey)
                      .filter(([key]) => key !== "_id" && key !== "__v")
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td className="complete-raw-field">
                            <strong>{formatFieldName(key)}</strong>
                            <div className="complete-field-key">({key})</div>
                          </td>
                          <td className="complete-raw-value">
                            {key === "createdAt" ? (
                              new Date(value).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            ) : typeof value === "object" && value !== null ? (
                              <pre className="complete-json-view">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              String(value)
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="complete-modal-footer">
                <button className="complete-modal-btn complete-modal-close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TotalClick;