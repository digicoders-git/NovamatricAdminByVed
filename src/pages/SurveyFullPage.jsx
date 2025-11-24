import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    questions: []
  });

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`${API_URL}/api/survey/getServey/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setSurvey(result.data);
        setStats(result.stats);
        setFormData({
          surveyName: result.data.surveyName,
          description: result.data.description,
          redirectUrl: result.data.redirectUrl,
          questions: result.data.questions
        });
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/survey/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setSurvey(result.data);
        setEditMode(false);
        alert('Survey updated successfully!');
        fetchSurvey();
      }
    } catch (error) {
      console.error('Error updating survey:', error);
      alert('Failed to update survey');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      questions: [...formData.questions, { questionText: '', answerType: 'text', options: [] }]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options.push('');
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeOption = (qIndex, optIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== optIndex);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'text': return '📝';
      case 'mcq': return '☑️';
      default: return '❓';
    }
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
              <button onClick={() => setEditMode(false)} className="survey-full-cancel-btn">✖ Cancel</button>
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
              <p className="survey-full-description">{survey.description}</p>

              <div className="survey-full-meta">
                <div className="survey-full-meta-item">
                  <span className="survey-full-meta-label">Redirect URL:</span>
                  <a href={survey.redirectUrl} target="_blank" rel="noopener noreferrer">
                    {survey.redirectUrl}
                  </a>
                </div>

                <div className="survey-full-meta-item">
                  <span className="survey-full-meta-label">Created:</span>
                  <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="survey-full-edit-form">
              <div className="survey-full-form-group">
                <label>Survey Name</label>
                <input
                  type="text"
                  name="surveyName"
                  value={formData.surveyName}
                  onChange={handleInputChange}
                  className="survey-full-input"
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
                />
              </div>

              <div className="survey-full-form-group">
                <label>Redirect URL</label>
                <input
                  type="text"
                  name="redirectUrl"
                  value={formData.redirectUrl}
                  onChange={handleInputChange}
                  className="survey-full-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="survey-full-card survey-full-stats-card">
          <h2 className="survey-full-card-title">📊 Statistics</h2>
          <div className="survey-full-stats-grid">

            <div className="survey-full-stat-item">
              <div className="survey-full-stat-value">{stats?.totalQuestions || 0}</div>
              <div className="survey-full-stat-label">Total Questions</div>
            </div>

            <div className="survey-full-stat-item">
              <div className="survey-full-stat-value">{stats?.questionTypes.text || 0}</div>
              <div className="survey-full-stat-label">📝 Text Questions</div>
            </div>

            <div className="survey-full-stat-item">
              <div className="survey-full-stat-value">{stats?.questionTypes.mcq || 0}</div>
              <div className="survey-full-stat-label">☑️ MCQ Questions</div>
            </div>

          </div>
        </div>

        {/* Questions */}
        <div className="survey-full-card survey-full-questions-card">
          <div className="survey-full-questions-header">
            <h2 className="survey-full-card-title">❓ Questions</h2>
            {editMode && (
              <button onClick={addQuestion} className="survey-full-add-question-btn">
                + Add Question
              </button>
            )}
          </div>

          <div className="survey-full-questions-list">
            {formData.questions.map((question, index) => (
              <div key={index} className="survey-full-question-item">

                <div className="survey-full-question-header">
                  <span className="survey-full-question-number">Q{index + 1}</span>
                  <span className="survey-full-question-type-badge">
                    {getTypeIcon(question.answerType)} {question.answerType.toUpperCase()}
                  </span>

                  {editMode && (
                    <button onClick={() => removeQuestion(index)} className="survey-full-remove-btn">
                      🗑️
                    </button>
                  )}
                </div>

                {!editMode ? (
                  <>
                    <p className="survey-full-question-text">{question.questionText}</p>

                    {question.options?.length > 0 && (
                      <ul className="survey-full-options-list">
                        {question.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <div className="survey-full-question-edit">

                    <div className="survey-full-form-group">
                      <label>Question Text</label>
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                        className="survey-full-input"
                      />
                    </div>

                    {/* Answer Type - rating removed */}
                    <div className="survey-full-form-group">
                      <label>Answer Type</label>
                      <select
                        value={question.answerType}
                        onChange={(e) => handleQuestionChange(index, 'answerType', e.target.value)}
                        className="survey-full-select"
                      >
                        <option value="text">Text</option>
                        <option value="mcq">MCQ</option>
                      </select>
                    </div>

                    {/* MCQ Options */}
                    {question.answerType === 'mcq' && (
                      <div className="survey-full-options-section">
                        <div className="survey-full-options-header">
                          <label>Options</label>
                          <button onClick={() => addOption(index)} className="survey-full-add-option-btn">
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
                            />

                            <button
                              onClick={() => removeOption(index, optIndex)}
                              className="survey-full-remove-option-btn"
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
        </div>

      </div>
    </div>
    </DashboardLayout>
  );
};

export default SurveyFullPage;
