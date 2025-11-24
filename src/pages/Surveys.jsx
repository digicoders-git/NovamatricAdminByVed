import React, { useState, useEffect } from 'react';
import { Plus, Search, Copy, Check, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import DashboardLayout from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './CSS/Surveys.css';

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
  const Vite_Domain=import.meta.env.VITE_Domain
  

  const limit = 10;
  const navigate = useNavigate();

  const handleView = (id) => {
    navigate(`/survey-view/${id}`);
  };

  useEffect(() => {
    fetchSurveys();
  }, [page, searchTerm, sortBy, sortOrder]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/survey/getServey?page=${page}&limit=${limit}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      const result = await response.json();
      console.log(result);


      if (result.success) {
        setSurveys(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalSurveys(result.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSurvey = () => {
    navigate('/survey-builder');
  };

  return (
    <DashboardLayout>
      <div className="surveys-page-container">
        {/* Header */}
        <div className="surveys-page-header">
          <div className="surveys-page-header-top">
            <h1 className="surveys-page-title">All Surveys</h1>
            <button className="surveys-page-btn-add" onClick={handleAddSurvey}>
              <Plus size={20} />
              Add Survey
            </button>
          </div>

          <div className="surveys-page-search-wrapper">
            <Search size={20} className="surveys-page-search-icon" />
            <input
              type="text"
              className="surveys-page-search-input"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Table */}
        <div className="surveys-page-table-container">
          {loading ? (
            <div className="surveys-page-loading">
              <div className="surveys-page-spinner"></div>
              <p>Loading surveys...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="surveys-page-empty">
              <p>No surveys found</p>
              <p>Create your first survey to get started</p>
            </div>
          ) : (
            <>
              <table className="surveys-page-table">
                <thead>
                  <tr>
                    <th>
                      <span onClick={() => handleSort('_id')} className="surveys-page-table-sortable">
                        Sr No <ArrowUpDown size={14} />
                      </span>
                    </th>
                    <th>
                      <span onClick={() => handleSort('surveyName')} className="surveys-page-table-sortable">
                        Survey Name <ArrowUpDown size={14} />
                      </span>
                    </th>
                    <th>Description</th>
                    <th>Redirect Link</th>
                    <th>View</th>
                  </tr>
                </thead>

                <tbody>
                  {surveys.map((survey, index) => (
                    <tr key={survey._id}>
                      <td>{(page - 1) * limit + index + 1}</td>

                      <td>{survey.surveyName}</td>

                      <td>{survey.description || 'No description provided'}</td>
                      <td>
                        <div className="surveys-page-link-container">

                          <div className="surveys-page-link-text">
                            {`${Vite_Domain}/survey/${survey._id}`}
                          </div>

                          <button
                            className={`surveys-page-btn-copy ${copiedId === survey._id ? 'surveys-page-copied' : ''}`}
                            onClick={() => copyToClipboard(`${Vite_Domain}/survey/${survey._id}`, survey._id)}
                          >
                            {copiedId === survey._id ? <Check size={16} /> : <Copy size={16} />}
                          </button>

                        </div>
                      </td>


                      {/* VIEW BUTTON */}
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => handleView(survey._id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="surveys-page-pagination">
                <div>
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalSurveys)} of{' '}
                  {totalSurveys}
                </div>

                <div className="surveys-page-pagination-controls">
                  <button className='surveys-page-pagination-btn' onClick={() => setPage(page - 1)} disabled={page === 1}>
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span>Page {page} of {totalPages}</span>

                  <button className='surveys-page-pagination-btn' onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Surveys;
