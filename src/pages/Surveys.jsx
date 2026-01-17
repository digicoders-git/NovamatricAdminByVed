import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import DashboardLayout from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './CSS/Surveys.css';
import Swal from "sweetalert2";
import axios from "axios";

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [copiedId, setCopiedId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const limit = 100;
  const navigate = useNavigate();

  // ================= NAVIGATION =================
  const handleView = (id) => navigate(`/survey-view/${id}`);
  const handleResponsse = (id) => navigate(`/survey-response/${id}`);
  const handleAddSurvey = () => navigate('/survey-builder');

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      await axios.delete(`${API_URL}/api/survey/surveys/${id}`);
      Swal.fire("Deleted!", "Survey has been deleted.", "success");
      setSurveys(prev => prev.filter(s => s._id !== id));
    } catch (error) {
      Swal.fire("Error!", "Something went wrong!", "error");
    }
  };

  // ================= FETCH =================
  useEffect(() => {
    fetchSurveys();
  }, [page, searchTerm, sortBy, sortOrder]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/survey/getServey?page=${page}&limit=${limit}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      const result = await res.json();

      if (result.success) {
        const updated = result.data.map(s => {
          // agar maxResponses == responseCount ho gaya to auto inactive + full flag
          if (s.maxResponses > 0 && s.maxResponses === s.responseCount) {
            return { ...s, isActive: false, isFull: true };
          }
          return { ...s, isFull: false };
        });

        setSurveys(updated);
        setTotalPages(result.pagination.totalPages);
        setTotalSurveys(result.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SORT =================
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // ================= SEARCH =================
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // ================= COPY LINK =================
  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ================= TOGGLE ACTIVE =================
  const toggleSurveyStatus = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/api/survey/survey/toggle/${id}`);

      setSurveys(prev =>
        prev.map(s =>
          s._id === id ? { ...s, isActive: res.data.data.isActive } : s
        )
      );

      Swal.fire("Success", res.data.message, "success");
    } catch (err) {
      Swal.fire("Error", "Unable to update survey status", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="surveys-page-container">

        {/* HEADER */}
        <div className="surveys-page-header">
          <div className="surveys-page-header-top">
            <h1 className="surveys-page-title">All Surveys</h1>
            <button className="surveys-page-btn-add" onClick={handleAddSurvey}>
              <Plus size={20} /> Add Survey
            </button>
          </div>

          <div className="surveys-page-search-wrapper">
            <Search size={20} className="surveys-page-search-icon" />
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={handleSearch}
              className="surveys-page-search-input"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="surveys-page-table-container">
          {loading ? (
            <div className="surveys-page-loading">Loading...</div>
          ) : surveys.length === 0 ? (
            <div className="surveys-page-empty">No surveys found</div>
          ) : (
            <>
              <table className="surveys-page-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('_id')}>Sr No <ArrowUpDown size={14} /></th>
                    <th onClick={() => handleSort('surveyName')}>Survey Name <ArrowUpDown size={14} /></th>
                    {/* <th>Description</th> */}
                    <th>Survey Link</th>
                    <th>Status</th>
                    <th>View</th>
                    <th>Response</th>
                    <th>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {surveys.map((survey, index) => (
                    <tr key={survey._id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>{survey.surveyName}</td>
                      {/* <td>{survey.description || "No description"}</td> */}

                      <td>
                        <div className="surveys-page-link-container">
                          <div className="surveys-page-link-text">
                            {survey.generatedLink || "No link"}
                          </div>
                          <button
                            onClick={() => copyToClipboard(survey.generatedLink, survey._id)}
                            disabled={!survey.generatedLink}
                            className="surveys-page-btn-copy"
                          >
                            {copiedId === survey._id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        {survey.isFull ? (
                          <span className="full-badge">Max submission full</span>
                        ) : (
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={survey.isActive}
                              onChange={() => toggleSurveyStatus(survey._id)}
                            />
                            <span className="slider round"></span>
                          </label>
                        )}
                      </td>

                      <td><button className="view-btn" onClick={() => handleView(survey._id)}>View</button></td>
                      <td><button className="response-btn" onClick={() => handleResponsse(survey._id)}>Response</button></td>
                      <td><button className="delete-btn" onClick={() => handleDelete(survey._id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="surveys-page-pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Surveys;
