import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye, RefreshCw, X, Download, FileSpreadsheet, FileText } from 'lucide-react';
import DashboardLayout from './Dashboard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import './CSS/ShowRegistration.css';

const ShowRegistration = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [exportLoading, setExportLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const limit = 100;

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/registration/get?page=${page}&limit=${limit}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );

      if (response.data.success) {
        let data = [];

        if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.registrations) {
          data = response.data.registrations;
        }

        setRegistrations(data);
        setTotalRegistrations(response.data.pagination?.total || data.length);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRegistrations = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/registration/get?limit=50000&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );

      if (res.data.success) {
        if (Array.isArray(res.data.data)) return res.data.data;
        if (Array.isArray(res.data)) return res.data;
        if (res.data.registrations) return res.data.registrations;
      }
      return [];
    } catch (error) {
      console.error("Excel Fetch Error:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [page, searchTerm, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const exportToExcel = async () => {
    setExportLoading(true);

    try {
      const data = await fetchAllRegistrations();

      if (data.length === 0) {
        alert("No registrations found.");
        return;
      }

      const excelData = data.map((item, index) => ({
        "Sr No": index + 1,
        "Full Name": item.fullName,
        "Email": item.email,
        "Age": item.age,
        "Gender": item.gender,
        "Location": item.location,
        "Designation": item.designation,
        "Industry": item.industry,
        "Registered On": formatDate(item.createdAt)
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xls",
        type: "array"
      });

      const fileData = new Blob([excelBuffer], {
        type: "application/vnd.ms-excel"
      });

      saveAs(fileData, `registrations_${new Date().toISOString().slice(0, 10)}.xls`);

    } catch (error) {
      console.error("Excel Export Error:", error);
      alert("Excel export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const exportToCSV = async () => {
    setExportLoading(true);
    try {
      const data = await fetchAllRegistrations();
      if (data.length === 0) {
        alert("No data to export");
        return;
      }

      const headers = ['Sr No', 'Full Name', 'Email', 'Age', 'Gender', 'Location', 'Designation', 'Industry', 'Registered On'];
      const csvContent = [
        headers.join(','),
        ...data.map((reg, index) =>
          [
            index + 1,
            `"${reg.fullName}"`,
            `"${reg.email}"`,
            reg.age,
            reg.gender,
            `"${reg.location}"`,
            `"${reg.designation}"`,
            `"${reg.industry}"`,
            `"${formatDate(reg.createdAt)}"`
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `registrations_${new Date().toISOString().slice(0, 10)}.csv`);

    } catch (error) {
      console.error(error);
      alert("CSV export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = async () => {
    setExportLoading(true);

    try {
      const data = await fetchAllRegistrations();
      if (data.length === 0) {
        alert("No data to export");
        return;
      }

      const printContent = `
      <html>
      <head><title>Registration Report</title></head>
      <body>
      <h2>Registration Report</h2>
      <table border="1" cellspacing="0" cellpadding="6">
        <tr>
          <th>Sr No</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Location</th>
          <th>Designation</th>
          <th>Industry</th>
          <th>Registered On</th>
        </tr>
        ${data.map((reg, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${reg.fullName}</td>
            <td>${reg.email}</td>
            <td>${reg.age}</td>
            <td>${reg.gender}</td>
            <td>${reg.location}</td>
            <td>${reg.designation}</td>
            <td>${reg.industry}</td>
            <td>${formatDate(reg.createdAt)}</td>
          </tr>
        `).join("")}
      </table>
      </body>
      </html>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();

    } catch (e) {
      console.error(e);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="registrations-container">

        {/* ==================== HEADER ======================= */}
        <div className="registrations-header">
          <div className="registrations-header-top">
            <h1 className="registrations-title">Registration Dashboard</h1>
            <div className="registrations-stats">
              Total Registrations: <span className="registrations-count">{totalRegistrations}</span>
            </div>
          </div>

          {/* Search + Export Buttons */}
          <div className="registrations-controls">

            {/* Search Input */}
            <div className="registrations-search-wrapper">
              <Search size={20} className="registrations-search-icon" />
              <input
                type="text"
                className="registrations-search-input"
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              {searchTerm && (
                <button className="registrations-clear-search" onClick={() => setSearchTerm("")}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Export Buttons */}
            <div className="registrations-export-buttons">

              <button className="registrations-btn-export registrations-btn-csv"
                onClick={exportToCSV}
                disabled={exportLoading}>
                <FileText size={18} /><span>CSV</span>
              </button>

              <button className="registrations-btn-export registrations-btn-excel"
                onClick={exportToExcel}
                disabled={exportLoading}>
                <FileSpreadsheet size={18} /><span>Excel</span>
              </button>

              <button className="registrations-btn-export registrations-btn-pdf"
                onClick={exportToPDF}
                disabled={exportLoading}>
                <Download size={18} /><span>PDF</span>
              </button>

            </div>

            <button className="registrations-btn-refresh" onClick={fetchRegistrations}>
              <RefreshCw size={20} />
            </button>
          </div>

        </div>

        {/* ================== TABLE ====================== */}
        <div className="registrations-table-container">
          {loading ? (
            <div className="registrations-loading">
              <div className="registrations-spinner"></div>
              <p>Loading registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="registrations-empty">
              <p>No registrations found</p>
            </div>
          ) : (
            <>
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("_id")}>Sr No</th>
                    <th onClick={() => handleSort("fullName")}>Full Name</th>
                    <th onClick={() => handleSort("email")}>Email</th>
                    <th onClick={() => handleSort("gender")}>Gender</th>
                    <th onClick={() => handleSort("createdAt")}>Registered On</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {registrations.map((reg, index) => (
                    <tr key={reg._id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>{reg.fullName}</td>
                      <td>{reg.email}</td>
                      <td>{reg.gender}</td>
                      <td>{formatDate(reg.createdAt)}</td>
                      <td>
                        <button
                          className="registrations-view-btn"
                          onClick={() => navigate(`/view-registration/${reg._id}`)}
                        >
                          <Eye size={16} />
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="registrations-pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft /> Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight />
                </button>
              </div>

            </>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ShowRegistration;
