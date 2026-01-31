import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import DashboardLayout from './Dashboard';
import './CSS/SurveyBuilder.css';
import { useNavigate } from 'react-router-dom';

const SurveyBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyName, setSurveyName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [projectIDfromClient, setProjectIDfromClient] = useState('');
  const [projectIDfromInter, setProjectIDfromInter] = useState('');
  const [maxResponses, setMaxResponses] = useState('');
  const [customParams, setCustomParams] = useState([]);
  const [surveyUrl, setSurveyUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // ================= VALIDATIONS =================
  const canProceedStep1 =
    surveyName.trim() !== '' && redirectUrl.trim() !== '';

  const canProceedStep2 =
    questions.length > 0 &&
    questions.every(q =>
      q.questionText.trim() !== '' &&
      (q.answerType === 'text' ||
        q.options.filter(o => o.trim() !== '').length >= 2)
    );

  // ================= EXTRACT PARAMS FROM REDIRECT URL =================
  useEffect(() => {
    if (redirectUrl.trim()) {
      try {
        const urlObj = new URL(redirectUrl);
        const paramsArray = [];
        
        urlObj.searchParams.forEach((value, key) => {
          paramsArray.push({ key, value });
        });
        
        setCustomParams(paramsArray);
      } catch (error) {
        console.log("Invalid URL or no parameters found");
        setCustomParams([]);
      }
    } else {
      setCustomParams([]);
    }
  }, [redirectUrl]);

  // ================= CUSTOM PARAMETERS HANDLERS =================
  const addCustomParam = () => {
    setCustomParams([...customParams, { key: '', value: '' }]);
  };

  const updateCustomParam = (index, field, value) => {
    const updated = [...customParams];
    updated[index][field] = value;
    setCustomParams(updated);
  };

  const removeCustomParam = (index) => {
    setCustomParams(customParams.filter((_, i) => i !== index));
  };

  // ================= QUESTION HANDLERS =================
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        questionText: '', 
        answerType: 'text', 
        options: [''] 
      }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    
    // If changing to text, clear options
    if (field === 'answerType' && value === 'text') {
      updated[index].options = [''];
    }
    // If changing to mcq and no options, add 2 empty options
    else if (field === 'answerType' && value === 'mcq' && (!updated[index].options || updated[index].options.length === 0)) {
      updated[index].options = ['', ''];
    }
    
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].options.splice(optIndex, 1);
    
    // Ensure at least one option remains for MCQ
    if (updated[qIndex].options.length === 0) {
      updated[qIndex].options = [''];
    }
    
    setQuestions(updated);
  };

  // ================= CREATE SURVEY =================
  const handleCreateSurvey = async () => {
    // Clean questions data
    const cleanedQuestions = questions.map(q => ({
      questionText: q.questionText.trim(),
      answerType: q.answerType,
      options: q.answerType === 'mcq' 
        ? q.options.map(opt => opt.trim()).filter(opt => opt !== '')
        : []
    }));

    const surveyData = {
      surveyName: surveyName.trim(),
      description: description.trim(),
      projectIDfromClient: projectIDfromClient.trim(),
      projectIDfromInter: projectIDfromInter.trim(),
      redirectUrl: redirectUrl.trim(),
      questions: cleanedQuestions,
      maxResponses: maxResponses ? parseInt(maxResponses) : 0,
      customParams // Send custom params to backend
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/survey/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
      });

      const result = await response.json();

      if (result.success) {
        // Use the generatedLink from backend
        setSurveyUrl(result.generatedLink);
        setCurrentStep(3);
      } else {
        alert(result.message || 'Error creating survey');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="survey-create-container">
        <button onClick={() => navigate(-1)} className="survey-full-back-btn">
          ← Back
        </button>

        <div className="survey-create-wrapper">
          <div className="survey-create-header">
            <h1 className="survey-create-title">Survey Creator</h1>
            <p className="survey-create-subtitle">
              Create beautiful surveys in minutes
            </p>
          </div>

          {/* ================= PROGRESS ================= */}
          <div className="survey-create-progress">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: 'Questions' },
              { num: 3, label: 'Complete' }
            ].map(step => (
              <div key={step.num} className="survey-create-step-indicator">
                <div
                  className={`survey-create-step-circle ${
                    currentStep === step.num
                      ? 'survey-create-active'
                      : currentStep > step.num
                      ? 'survey-create-completed'
                      : ''
                  }`}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span
                  className={`survey-create-step-label ${
                    currentStep === step.num ? 'survey-create-active' : ''
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* ================= STEP 1 ================= */}
          {currentStep === 1 && (
            <div className="survey-create-card">
              <h2 className="survey-create-section-title">Survey Details</h2>

              <div className="survey-create-input-group">
                <label className="survey-create-label">
                  Survey Name *
                </label>
                <input
                  className="survey-create-input"
                  placeholder="Enter survey name"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  required
                />
              </div>

              <div className="survey-create-input-group">
                <label className="survey-create-label">
                  Client Project ID
                </label>
                <input
                  className="survey-create-input"
                  placeholder="Enter client project ID"
                  value={projectIDfromClient}
                  onChange={(e) => setProjectIDfromClient(e.target.value)}
                />
              </div>

              <div className="survey-create-input-group">
                <label className="survey-create-label">
                  Internal Project ID
                </label>
                <input
                  className="survey-create-input"
                  placeholder="Enter internal project ID"
                  value={projectIDfromInter}
                  onChange={(e) => setProjectIDfromInter(e.target.value)}
                />
              </div>

              <div className="survey-create-input-group">
                <label className="survey-create-label">
                  Redirect URL *
                </label>
                <input
                  className="survey-create-input"
                  placeholder="https://example.com?param1=value1&param2=value2"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  required
                />
                {redirectUrl && !redirectUrl.startsWith('http') && (
                  <p className="survey-create-error">
                    Please enter a valid URL starting with http:// or https://
                  </p>
                )}
              </div>

              {/* ===== CUSTOM PARAMETERS UI ===== */}
              {customParams.length > 0 && (
                <div className="survey-query-box">
                  <h4>Auto-detected Parameters from Redirect URL</h4>
                  <p className="survey-query-hint">
                    These parameters will be automatically included in your survey link
                  </p>

                  {customParams.map((param, index) => (
                    <div key={index} className="survey-query-row">
                      <div className="survey-query-col">
                        <label className="survey-query-label">Key</label>
                        <input
                          className="survey-query-input"
                          value={param.key}
                          onChange={(e) =>
                            updateCustomParam(index, 'key', e.target.value)
                          }
                          // readOnly
                        />
                      </div>
                      <div className="survey-query-col">
                        <label className="survey-query-label">Value</label>
                        <input
                          className="survey-query-input"
                          value={param.value}
                          onChange={(e) =>
                            updateCustomParam(index, 'value', e.target.value)
                          }
                        />
                      </div>
                      <div className="survey-query-col-action">
                        <button
                          className="survey-query-remove-btn"
                          onClick={() => removeCustomParam(index)}
                          title="Remove parameter"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    className="survey-create-btn-add-option"
                    onClick={addCustomParam}
                  >
                    <Plus size={16} /> Add Additional Parameters
                  </button>
                </div>
              )}

              <div className="survey-create-input-group">
                <label className="survey-create-label">
                  Maximum Responses
                </label>
                <input
                  type="number"
                  min="0"
                  className="survey-create-input"
                  placeholder="0 = Unlimited responses"
                  value={maxResponses}
                  onChange={(e) => setMaxResponses(e.target.value)}
                />
                <p className="survey-create-hint">
                  Set to 0 for unlimited responses
                </p>
              </div>

              <div className="survey-create-input-group">
                <label className="survey-create-label">
                  Description (Optional)
                </label>
                <textarea
                  className="survey-create-textarea"
                  placeholder="Enter survey description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="survey-create-actions">
                <div />
                <button
                  className="survey-create-btn survey-create-btn-primary"
                  disabled={!canProceedStep1}
                  onClick={() => setCurrentStep(2)}
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {currentStep === 2 && (
            <div className="survey-create-card">
              <div className="survey-create-section-header">
                <h2 className="survey-create-section-title">Survey Questions</h2>
                <p className="survey-create-section-subtitle">
                  Add questions to your survey
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="survey-create-empty-state">
                  <p>No questions added yet. Add your first question!</p>
                </div>
              ) : (
                questions.map((q, i) => (
                  <div key={i} className="survey-create-question-card">
                    <div className="survey-create-question-header">
                      <span className="survey-create-question-number">
                        Question {i + 1}
                      </span>
                      <button 
                        className="survey-query-remove-btn"
                        onClick={() => removeQuestion(i)}
                        title="Remove question"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="survey-create-input-group">
                      <label className="survey-create-label">
                        Question Text *
                      </label>
                      <input
                        className="survey-create-input"
                        placeholder="Enter your question here..."
                        value={q.questionText}
                        onChange={(e) =>
                          updateQuestion(i, 'questionText', e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="survey-create-input-group">
                      <label className="survey-create-label">
                        Answer Type
                      </label>
                      <select
                        className="survey-create-select"
                        value={q.answerType}
                        onChange={(e) =>
                          updateQuestion(i, 'answerType', e.target.value)
                        }
                      >
                        <option value="text">Text Answer</option>
                        <option value="mcq">Multiple Choice (MCQ)</option>
                      </select>
                    </div>

                    {q.answerType === 'mcq' && (
                      <div className="survey-create-options-container">
                        <label className="survey-create-label">
                          Options *
                        </label>
                        <p className="survey-create-hint">
                          Add at least 2 options for multiple choice questions
                        </p>
                        
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="survey-create-option-item">
                            <input
                              className="survey-create-option-input"
                              placeholder={`Option ${oi + 1}`}
                              value={opt}
                              onChange={(e) =>
                                updateOption(i, oi, e.target.value)
                              }
                            />
                            {q.options.length > 2 && (
                              <button
                                className="survey-create-option-remove-btn"
                                onClick={() => removeOption(i, oi)}
                                title="Remove option"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        
                        <button
                          className="survey-create-btn-add-option"
                          onClick={() => addOption(i)}
                        >
                          <Plus size={16} /> Add Option
                        </button>
                      </div>
                    )}

                    <div className="survey-create-question-footer">
                      <span className="survey-create-question-type">
                        Type: {q.answerType === 'text' ? 'Text Answer' : 'Multiple Choice'}
                      </span>
                      <span className="survey-create-question-info">
                        {q.answerType === 'mcq' ? `${q.options.length} options` : 'Text field'}
                      </span>
                    </div>
                  </div>
                ))
              )}

              <button 
                className="survey-create-btn-add-question"
                onClick={addQuestion}
              >
                <Plus size={20} /> Add Question
              </button>

              <div className="survey-create-actions">
                <button 
                  className="survey-create-btn-secondary"
                  onClick={() => setCurrentStep(1)}
                >
                  <ChevronLeft size={20} /> Back
                </button>
                <button
                  className="survey-create-btn-primary"
                  disabled={!canProceedStep2 || loading}
                  onClick={handleCreateSurvey}
                >
                  {loading ? 'Creating Survey...' : 'Create Survey'}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {currentStep === 3 && (
            <div className="survey-create-card survey-create-success-card">
              <div className="survey-create-success-icon">🎉</div>
              <h2 className="survey-create-success-title">Survey Created Successfully!</h2>
              <p className="survey-create-success-message">
                Your survey is now live. Share the link below with respondents.
              </p>

              <div className="survey-create-url-container">
                <label className="survey-create-label">Survey Link</label>
                <div className="survey-create-url-box">
                  <span className="survey-create-url-text">{surveyUrl}</span>
                  <button 
                    className="survey-create-copy-btn"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={20} color="green" /> : <Copy size={20} />}
                  </button>
                </div>
                <span className="survey-create-copy-status">
                  {copied ? 'Copied!' : 'Click the copy button above'}
                </span>
              </div>

              <div className="survey-create-success-actions">
                <button 
                  className="survey-create-btn-secondary"
                  onClick={() => window.open(surveyUrl, '_blank')}
                >
                  <ExternalLink size={20} /> Open Survey
                </button>
                <button 
                  className="survey-create-btn-secondary"
                  onClick={() => {
                    setCurrentStep(1);
                    setSurveyName('');
                    setDescription('');
                    setQuestions([]);
                    setRedirectUrl('');
                    setProjectIDfromClient('');
                    setProjectIDfromInter('');
                    setMaxResponses('');
                    setCustomParams([]);
                    setSurveyUrl('');
                  }}
                >
                  Create Another Survey
                </button>
              </div>

              <div className="survey-create-success-info">
                <h4>📊 Survey Details:</h4>
                <div className="survey-create-info-grid">
                  <div className="survey-create-info-item">
                    <strong>Name:</strong> {surveyName}
                  </div>
                  <div className="survey-create-info-item">
                    <strong>Total Questions:</strong> {questions.length}
                  </div>
                  <div className="survey-create-info-item">
                    <strong>Custom Parameters:</strong> {customParams.length}
                  </div>
                  <div className="survey-create-info-item">
                    <strong>Max Responses:</strong> {maxResponses || 0} {maxResponses === '0' || !maxResponses ? '(Unlimited)' : ''}
                  </div>
                  <div className="survey-create-info-item">
                    <strong>Status:</strong> Active
                  </div>
                  <div className="survey-create-info-item">
                    <strong>Created:</strong> {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SurveyBuilder;