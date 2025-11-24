import React, { useState, useEffect } from 'react';
import { FileDown, Download } from 'lucide-react';
import DashboardLayout from './Dashboard';
import './CSS/CompleteServey.css'
const CompleteServey = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetchCompletedSurveys();
  }, []);

  const fetchCompletedSurveys = async () => {
    try {
      const response = await fetch(`${API_URL}/api/survey/complete-survey`);
      const data = await response.json();
      console.log(data);
      
      
      if (data.success) {
        setSurveys(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['S.No', 'Project ID', 'IP Address', 'Status', 'Completed At'];
    const csvData = surveys.map((survey, index) => [
      index + 1,
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
    link.download = `completed_surveys_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

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
                  <td>${survey.projectId}</td>
                  <td>${survey.ipaddress}</td>
                  <td>${survey.status}</td>
                  <td>${new Date(survey.createdAt).toLocaleString()}</td>
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
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = surveys.slice(indexOfFirstItem, indexOfLastItem);
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
        <div className="complete-header">
          <div className="complete-title-section">
            <h1>📊 Completed Surveys</h1>
            <p className="complete-subtitle">Track and manage all completed survey responses</p>
          </div>
          
          <div className="complete-stats">
            <div className="complete-stat-card">
              <span className="complete-stat-number">{surveys.length}</span>
              <span className="complete-stat-label">Total Completed</span>
            </div>
          </div>

          <div className="complete-export-section">
            <button className="complete-export-btn complete-export-csv" onClick={exportToCSV}>
              <Download size={18} />
              Export CSV
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
              <h3>No Completed Surveys Yet</h3>
              <p>Completed surveys will appear here once available.</p>
            </div>
          ) : (
            <>
              <div className="complete-table-wrapper">
                <table className="complete-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Project ID</th>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th>Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((survey, index) => (
                      <tr key={survey._id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{survey.projectId}</td>
                        <td>{survey.ipaddress}</td>
                        <td>
                          <span className="complete-status-badge">
                            {survey.status}
                          </span>
                        </td>
                        <td>{new Date(survey.createdAt).toLocaleString()}</td>
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
    </DashboardLayout>
  );
};

export default CompleteServey;