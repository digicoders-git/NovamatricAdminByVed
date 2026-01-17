import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './CSS/SurveyFullPage.css';
import DashboardLayout from './Dashboard';

const SurveyFullPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    surveyName: '',
    description: '',
    redirectUrl: '',
    generatedLink: '',
    isActive: false,
    maxResponses: 0,
    projectIDfromClient: '',
    projectIDfromInter: '',
    questions: [],
  });

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`${API_URL}/api/survey/getServey/${id}`);
      const result = await response.json();
      console.log(result);
        
      if (result.success) {
        setSurvey(result.data);
        setStats(result.stats);
        setFormData({
          surveyName: result.data.surveyName || '',
          description: result.data.description || '',
          redirectUrl: result.data.redirectUrl || '',
          isActive: result.data.isActive || false,
          maxResponses: result.data.maxResponses || 0,
          projectIDfromClient: result.data.projectIDfromClient || '',
          projectIDfromInter: result.data.projectIDfromInter || '',
          questions: result.data.questions || []
        });
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to fetch survey details. Please try again.',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!formData.surveyName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Survey name is required!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.questionText.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: `Question ${i + 1} text is required!`,
          confirmButtonColor: '#3085d6',
        });
        return;
      }
      
      if (q.answerType === 'mcq' && q.options.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: `Question ${i + 1} requires at least one option!`,
          confirmButtonColor: '#3085d6',
        });
        return;
      }
    }

    try {
      Swal.fire({
        title: 'Updating Survey...',
        text: 'Please wait while we save your changes.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(`${API_URL}/api/survey/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Survey updated successfully!',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          timerProgressBar: true,
        });
        setSurvey(result.data);
        setEditMode(false);
        fetchSurvey();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: result.message || 'Failed to update survey',
          confirmButtonColor: '#3085d6',
        });
      }
    } catch (error) {
      console.error('Error updating survey:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update survey. Please try again.',
        confirmButtonColor: '#3085d6',
      });
    }
  };

  const handleCancelEdit = () => {
    Swal.fire({
      title: 'Discard Changes?',
      text: 'Are you sure you want to discard all changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, discard!',
      cancelButtonText: 'No, keep editing'
    }).then((result) => {
      if (result.isConfirmed) {
        setEditMode(false);
        // Reset form data to original survey data
        if (survey) {
          setFormData({
            surveyName: survey.surveyName || '',
            description: survey.description || '',
            redirectUrl: survey.redirectUrl || '',
            isActive: survey.isActive || false,
            maxResponses: survey.maxResponses || 0,
            projectIDfromClient: survey.projectIDfromClient || '',
            projectIDfromInter: survey.projectIDfromInter || '',
            questions: survey.questions || []
          });
        }
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleOptionsChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { 
        questionText: '', 
        answerType: 'text', 
        options: [] 
      }]
    });
  };

  const removeQuestion = (index) => {
    Swal.fire({
      title: 'Remove Question?',
      text: 'Are you sure you want to remove this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: updatedQuestions });
        
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Question has been removed.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options.push('');
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeOption = (qIndex, optIndex) => {
    Swal.fire({
      title: 'Remove Option?',
      text: 'Are you sure you want to remove this option?',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedQuestions = [...formData.questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== optIndex);
        setFormData({ ...formData, questions: updatedQuestions });
      }
    });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'text': return '📝';
      case 'mcq': return '☑️';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className="survey-full-loading">Loading...</div>;
  if (!survey) return <div className="survey-full-error">Survey not found</div>;

  return (
    <DashboardLayout>
      <div className="survey-full-container">
        <div className="survey-full-header">
          <button onClick={() => navigate(-1)} className="survey-full-back-btn">← Back</button>

          <div className="survey-full-header-actions">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="survey-full-edit-btn">✏️ Edit Survey</button>
            ) : (
              <>
                <button onClick={handleUpdate} className="survey-full-save-btn">💾 Save Changes</button>
                <button onClick={handleCancelEdit} className="survey-full-cancel-btn">✖ Cancel</button>
              </>
            )}
          </div>
        </div>

        <div className="survey-full-content">

          {/* Survey Info */}
          <div className="survey-full-card survey-full-info-card">
            {!editMode ? (
              <>
                <h1 className="survey-full-title">{survey.surveyName}</h1>
                <p className="survey-full-description">{survey.description || 'No description provided'}</p>

                <div className="survey-full-meta-grid">
                  <div className="survey-full-meta-item">
                    <span className="survey-full-meta-label">Status:</span>
                    <span className={`survey-full-status ${survey.isActive ? 'active' : 'inactive'}`}>
                      {survey.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </div>

                  <div className="survey-full-meta-item">
                    <span className="survey-full-meta-label">Max Responses:</span>
                    <span>{survey.maxResponses}</span>
                  </div>

                  <div className="survey-full-meta-item">
                    <span className="survey-full-meta-label">Current Responses:</span>
                    <span>{survey.responseCount || 0}</span>
                  </div>

                  <div className="survey-full-meta-item">
                    <span className="survey-full-meta-label">Client Project ID:</span>
                    <span>{survey.projectIDfromClient || 'N/A'}</span>
                  </div>

                  <div className="survey-full-meta-item">
                    <span className="survey-full-meta-label">Internal Project ID:</span>
                    <span>{survey.projectIDfromInter || 'N/A'}</span>
                  </div>

                  <div className="survey-full-meta-item">
                    <span className="survey-full-meta-label">Created:</span>
                    <span>{formatDate(survey.createdAt)}</span>
                  </div>

                  <div className="survey-full-meta-item">
                    <span className="survey-full-meta-label">Redirect URL:</span>
                    <a href={survey.redirectUrl} target="_blank" rel="noopener noreferrer">
                      {survey.redirectUrl}
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <div className="survey-full-edit-form">
                <div className="survey-full-form-group">
                  <label>Survey Name *</label>
                  <input
                    type="text"
                    name="surveyName"
                    value={formData.surveyName}
                    onChange={handleInputChange}
                    className="survey-full-input"
                    required
                  />
                </div>

                <div className="survey-full-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="survey-full-textarea"
                    rows="3"
                    placeholder="Enter survey description"
                  />
                </div>

                <div className="survey-full-form-row">
                  <div className="survey-full-form-group">
                    <label>Redirect URL</label>
                    <input
                      type="url"
                      name="redirectUrl"
                      value={formData.redirectUrl}
                      onChange={handleInputChange}
                      className="survey-full-input"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="survey-full-form-row">
                  <div className="survey-full-form-group">
                    <label>Max Responses</label>
                    <input
                      type="number"
                      name="maxResponses"
                      value={formData.maxResponses}
                      onChange={handleInputChange}
                      className="survey-full-input"
                      min="0"
                    />
                  </div>

                  <div className="survey-full-form-group">
                    <label className="survey-full-checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="survey-full-checkbox"
                      />
                      Active Survey
                    </label>
                  </div>
                </div>

                <div className="survey-full-form-row">
                  <div className="survey-full-form-group">
                    <label>Client Project ID</label>
                    <input
                      type="text"
                      name="projectIDfromClient"
                      value={formData.projectIDfromClient}
                      onChange={handleInputChange}
                      className="survey-full-input"
                      placeholder="Enter client project ID"
                    />
                  </div>

                  <div className="survey-full-form-group">
                    <label>Internal Project ID</label>
                    <input
                      type="text"
                      name="projectIDfromInter"
                      value={formData.projectIDfromInter}
                      onChange={handleInputChange}
                      className="survey-full-input"
                      placeholder="Enter internal project ID"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="survey-full-card survey-full-stats-card">
            <h2 className="survey-full-card-title">📊 Statistics</h2>
            <div className="survey-full-stats-grid">
              <div className="survey-full-stat-item">
                <div className="survey-full-stat-value">{stats?.totalQuestions || formData.questions.length}</div>
                <div className="survey-full-stat-label">Total Questions</div>
              </div>

              <div className="survey-full-stat-item">
                <div className="survey-full-stat-value">
                  {formData.questions.filter(q => q.answerType === 'text').length}
                </div>
                <div className="survey-full-stat-label">📝 Text Questions</div>
              </div>

              <div className="survey-full-stat-item">
                <div className="survey-full-stat-value">
                  {formData.questions.filter(q => q.answerType === 'mcq').length}
                </div>
                <div className="survey-full-stat-label">☑️ MCQ Questions</div>
              </div>

              <div className="survey-full-stat-item">
                <div className="survey-full-stat-value">{survey.responseCount || 0}</div>
                <div className="survey-full-stat-label">Total Responses</div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="survey-full-card survey-full-questions-card">
            <div className="survey-full-questions-header">
              <h2 className="survey-full-card-title">❓ Questions ({formData.questions.length})</h2>
              {editMode && (
                <button onClick={addQuestion} className="survey-full-add-question-btn">
                  + Add Question
                </button>
              )}
            </div>

            {formData.questions.length === 0 ? (
              <div className="survey-full-no-questions">
                No questions added yet.
                {editMode && (
                  <button onClick={addQuestion} className="survey-full-add-first-btn">
                    Add First Question
                  </button>
                )}
              </div>
            ) : (
              <div className="survey-full-questions-list">
                {formData.questions.map((question, index) => (
                  <div key={index} className="survey-full-question-item">
                    <div className="survey-full-question-header">
                      <span className="survey-full-question-number">Q{index + 1}</span>
                      <span className="survey-full-question-type-badge">
                        {getTypeIcon(question.answerType)} {question.answerType.toUpperCase()}
                      </span>

                      {editMode && (
                        <button 
                          onClick={() => removeQuestion(index)} 
                          className="survey-full-remove-btn"
                          title="Remove question"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    {!editMode ? (
                      <>
                        <p className="survey-full-question-text">{question.questionText}</p>

                        {question.options?.length > 0 && (
                          <>
                            <div className="survey-full-options-label">Options:</div>
                            <ul className="survey-full-options-list">
                              {question.options.map((opt, i) => (
                                <li key={i} className="survey-full-option-item">
                                  <span className="survey-full-option-number">{i + 1}.</span>
                                  {opt}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="survey-full-question-edit">
                        <div className="survey-full-form-group">
                          <label>Question Text *</label>
                          <input
                            type="text"
                            value={question.questionText}
                            onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                            className="survey-full-input"
                            required
                          />
                        </div>

                        <div className="survey-full-form-group">
                          <label>Answer Type</label>
                          <select
                            value={question.answerType}
                            onChange={(e) => handleQuestionChange(index, 'answerType', e.target.value)}
                            className="survey-full-select"
                          >
                            <option value="text">Text</option>
                            <option value="mcq">Multiple Choice (MCQ)</option>
                          </select>
                        </div>

                        {/* MCQ Options */}
                        {question.answerType === 'mcq' && (
                          <div className="survey-full-options-section">
                            <div className="survey-full-options-header">
                              <label>Options *</label>
                              <button 
                                onClick={() => addOption(index)} 
                                className="survey-full-add-option-btn"
                              >
                                + Add Option
                              </button>
                            </div>

                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="survey-full-option-edit">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionsChange(index, optIndex, e.target.value)}
                                  className="survey-full-input"
                                  placeholder={`Option ${optIndex + 1}`}
                                  required
                                />

                                <button
                                  onClick={() => removeOption(index, optIndex)}
                                  className="survey-full-remove-option-btn"
                                  title="Remove option"
                                  disabled={question.options.length <= 1}
                                >
                                  ✖
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default SurveyFullPage;