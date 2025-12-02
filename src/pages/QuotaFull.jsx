import React, { useState, useEffect } from 'react';
import { FileDown, Download, Eye } from 'lucide-react';
import * as XLSX from "xlsx";
import './CSS/CompleteServey.css';
import DashboardLayout from './Dashboard';

const QuotaFullSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 100;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchQuotaFullSurveys();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotaFullSurveys();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchQuotaFullSurveys = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/survey/quota-full-surveys?search=${search}`
      );

      const data = await response.json();
      if (data.success) {
        setSurveys(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching quota full surveys:', error);
    } finally {
      setLoading(false);
    }
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
    // Convert camelCase to Title Case
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  // ---------------- CSV EXPORT ----------------
  const exportToCSV = () => {
    const headers = ['S.No', 'User ID', 'Project ID', 'IP Address', 'Status', 'Quota Full At'];

    const csvData = surveys.map((survey, index) => [
      index + 1,
      survey.userId,
      survey.projectId,
      survey.ipaddress,
      survey.status,
      new Date(survey.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Quota_full_surveys_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ---------------- EXCEL EXPORT ----------------
  const exportToExcel = () => {
    const excelData = surveys.map((survey, index) => ({
      "S.No": index + 1,
      "User ID": survey.userId,
      "Project ID": survey.projectId,
      "IP Address": survey.ipaddress,
      "Status": survey.status,
      "Quota Full At": new Date(survey.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quota Full Surveys");

    XLSX.writeFile(workbook, `Quota_full_surveys_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ---------------- PDF EXPORT ----------------
  const exportToPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quota Full Surveys Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status-qf { background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Quota Full Surveys Report</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>User ID</th>
                <th>Project ID</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Quota Full At</th>
              </tr>
            </thead>
            <tbody>
              ${surveys.map((survey, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${survey.userId}</td>
                  <td>${survey.projectId}</td>
                  <td>${survey.ipaddress}</td>
                  <td><span class="status-qf">${survey.status}</span></td>
                  <td>${new Date(survey.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = surveys.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(surveys.length / itemsPerPage);

  if (loading) {
    return (
      <div className="complete-loading-container">
        <div className="complete-spinner"></div>
        <p className="complete-loading-text">Loading quota full surveys...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="complete-main-container">
        <div className="complete-content-wrapper">

          <div className="complete-header">

            <div className="complete-title-section">
              <h1>📊 Quota Full Surveys</h1>
              <p className="complete-subtitle">Track and manage all quota full survey responses</p>
            </div>

            {/* EXPORT BUTTONS */}
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

          {/* TABLE */}
          <div className="complete-table-container">
            {surveys.length === 0 ? (
              <div className="complete-empty-state">
                <h3>No Quota Full Surveys Found</h3>
                <p>Try changing your search.</p>
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
                        <th>Quota Full At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((survey, idx) => (
                        <tr key={survey._id}>
                          <td>{indexOfFirst + idx + 1}</td>
                          <td>{survey.userId}</td>
                          <td>{survey.projectId}</td>
                          <td>{survey.ipaddress}</td>
                          <td>
                            <span className="complete-status-quota-full">
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

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="complete-pagination">
                    <button
                      className="complete-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    >
                      Previous
                    </button>

                    <span className="complete-page-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      className="complete-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
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
              <h2>📋 Quota Full Survey Raw Data</h2>
              <button className="complete-modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            
            <div className="complete-modal-body">
              <div className="complete-raw-data-info">
                <div className="complete-info-row">
                  <span className="complete-info-label">User ID:</span>
                  <span className="complete-info-value">{selectedSurvey.userId}</span>
                </div>
                <div className="complete-info-row">
                  <span className="complete-info-label">Project ID:</span>
                  <span className="complete-info-value">{selectedSurvey.projectId}</span>
                </div>
                <div className="complete-info-row">
                  <span className="complete-info-label">IP Address:</span>
                  <span className="complete-info-value">{selectedSurvey.ipaddress}</span>
                </div>
                <div className="complete-info-row">
                  <span className="complete-info-label">Status:</span>
                  <span className="complete-info-value">{selectedSurvey.status}</span>
                </div>
                <div className="complete-info-row">
                  <span className="complete-info-label">Quota Full At:</span>
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
                    {Object.entries(selectedSurvey).map(([key, value]) => (
                      <tr key={key}>
                        <td className="complete-raw-field">
                          <strong>{formatFieldName(key)}</strong>
                          <div className="complete-field-key">({key})</div>
                        </td>
                        <td className="complete-raw-value">
                          {typeof value === 'object' && value !== null ? (
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

export default QuotaFullSurveys;