import React, { useState, useEffect } from 'react';
import { FileDown, Download } from 'lucide-react';
import * as XLSX from "xlsx";
import DashboardLayout from './Dashboard';
import './CSS/CompleteServey.css';

const CompleteServey = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 100;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCompletedSurveys("");
  }, []);

  // ---------------- SERVER SIDE SEARCH + FETCH ----------------
  const fetchCompletedSurveys = async (searchText = "") => {
    try {
      const response = await fetch(
        `${API_URL}/api/survey/complete-survey?search=${searchText}`
      );
      const data = await response.json();

      if (data.success) {
        setSurveys(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CSV EXPORT ----------------
  const exportToCSV = () => {
    const headers = ['S.No', 'User ID', 'Project ID', 'IP Address', 'Status', 'Completed At'];
    const csvData = surveys.map((s, idx) => [
      idx + 1,
      s.userId,
      s.projectId,
      s.ipaddress,
      s.status,
      new Date(s.createdAt).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...csvData.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `completed_surveys_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ---------------- EXCEL EXPORT ----------------
  const exportToExcel = () => {
    const excelData = surveys.map((s, idx) => ({
      "S.No": idx + 1,
      "User ID": s.userId,
      "Project ID": s.projectId,
      "IP Address": s.ipaddress,
      "Status": s.status,
      "Completed At": new Date(s.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Completed Surveys");
    XLSX.writeFile(workbook, `completed_surveys_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ---------------- PDF EXPORT ----------------
  const exportToPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Completed Surveys Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .complete-footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <h1>Completed Surveys Report</h1>
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
              ${surveys.map((s, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${s.userId}</td>
                  <td>${s.projectId}</td>
                  <td>${s.ipaddress}</td>
                  <td>${s.status}</td>
                  <td>${new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="complete-footer">
            <p>Total Completed Surveys: ${surveys.length}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Pagination
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = surveys.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(surveys.length / itemsPerPage);

  if (loading) {
    return (
      <div className="complete-loading-container">
        <div className="complete-spinner"></div>
        <p className="complete-loading-text">Loading completed surveys...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="complete-main-container">
        <div className="complete-content-wrapper">

          {/* ---------- HEADER SECTION ---------- */}
          <div className="complete-header">
            <div className="complete-title-section">
              <h1>📊 Completed Surveys</h1>
              <p className="complete-subtitle">Track and manage completed survey responses</p>
            </div>

            {/* ----------- SEARCH BOX ----------- */}


            {/* ---------- EXPORT BUTTONS ---------- */}
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
            <div className="complete-search-box">
              <input
                type="text"
                className="complete-search-input"
                placeholder="Search User ID, Project ID, IP, Status..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchCompletedSurveys(e.target.value);
                }}
              />
            </div>
          </div>


          {/* ---------- TABLE SECTION ---------- */}
          <div className="complete-table-container">
            {surveys.length === 0 ? (
              <div className="complete-empty-state">
                <h3>No Completed Surveys</h3>
                <p>Try adjusting your search filter.</p>
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
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((survey, i) => (
                        <tr key={survey._id}>
                          <td>{indexFirst + i + 1}</td>
                          <td>{survey.userId}</td>
                          <td>{survey.projectId}</td>
                          <td>{survey.ipaddress}</td>
                          <td>
                            <span className="complete-status-badge">{survey.status}</span>
                          </td>
                          <td>{new Date(survey.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ---------- PAGINATION ---------- */}
                {totalPages > 1 && (
                  <div className="complete-pagination">
                    <button
                      className="complete-page-btn"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    <span className="complete-page-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      className="complete-page-btn"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
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

export default CompleteServey;
