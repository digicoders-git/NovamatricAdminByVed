import React, { useState, useEffect } from 'react';
import { FileDown, Download } from 'lucide-react';
import * as XLSX from "xlsx";        // ✅ Excel import added
import './CSS/CompleteServey.css';
import DashboardLayout from './Dashboard';

const QuotaFullSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchQuotaFullSurveys();
  }, []);
  console.log(surveys);
  

  const fetchQuotaFullSurveys = async () => {
    try {
      const response = await fetch(`${API_URL}/api/survey/quota-full-surveys`);
      const data = await response.json();
      console.log(data);

      if (data.success) {
        setSurveys(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching quota full surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CSV Export
  const exportToCSV = () => {
    const headers = ['S.No', 'User ID','Project ID', 'IP Address', 'Status', 'Quota Full At'];
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

  // ✅ PDF Export
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
            .quota-full-footer { margin-top: 30px; text-align: center; color: #666; }
            .status-quota-full { background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; }
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
                  <td><span class="status-quota-full">${survey.status}</span></td>
                  <td>${new Date(survey.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="quota-full-footer">
            <p>Total Quota Full Surveys: ${surveys.length}</p>
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

  // ✅ EXCEL Export Added
  const exportToExcel = () => {
    const worksheetData = surveys.map((survey, index) => ({
      "S.No": index + 1,
      "User ID": survey.userId,
      "Project ID": survey.projectId,
      "IP Address": survey.ipaddress,
      "Status": survey.status,
      "Quota Full At": new Date(survey.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Quota Full Surveys");

    XLSX.writeFile(
      workbook,
      `Quota_Full_Surveys_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = surveys.slice(indexOfFirstItem, indexOfLastItem);
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

            {/* <div className="complete-stats">
              <div className="complete-stat-card">
                <span className="complete-stat-number">{surveys.length}</span>
                <span className="complete-stat-label">Total Quota Full</span>
              </div>
            </div> */}

            {/* Export Buttons */}
            <div className="complete-export-section">
              <button className="complete-export-btn complete-export-csv" onClick={exportToCSV}>
                <Download size={18} />
                Export CSV
              </button>

              <button className="complete-export-btn complete-export-csv" onClick={exportToExcel}>
                <Download size={18} />
                Export Excel
              </button>

              <button className="complete-export-btn complete-export-pdf" onClick={exportToPDF}>
                <FileDown size={18} />
                Export PDF
              </button>
            </div>
          </div>

          <div className="complete-table-container">
            {surveys.length === 0 ? (
              <div className="complete-empty-state">
                <h3>No Quota Full Surveys Yet</h3>
                <p>Quota full surveys will appear here once available.</p>
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
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((survey, index) => (
                        <tr key={survey._id}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>{survey.userId}</td>
                          <td>{survey.projectId}</td>
                          <td>{survey.ipaddress}</td>
                          <td>
                            <span className="complete-status-badge complete-status-quota-full">
                              {survey.status}
                            </span>
                          </td>
                          <td>{new Date(survey.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
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
    </DashboardLayout>
  );
};

export default QuotaFullSurveys;
