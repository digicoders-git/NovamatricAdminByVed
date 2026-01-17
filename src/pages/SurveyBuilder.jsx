import React, { useState } from 'react';
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

  // 🔥 NEW: Submission Limit
  const [maxResponses, setMaxResponses] = useState('');

  const [surveyUrl, setSurveyUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // ================= VALIDATIONS =================
  const canProceedStep1 = surveyName.trim() !== '';

  const canProceedStep2 =
    questions.length > 0 &&
    questions.every(q =>
      q.questionText.trim() !== '' &&
      (q.answerType === 'text' ||
        q.options.filter(o => o.trim() !== '').length >= 2)
    );

  const canProceedStep3 = redirectUrl.trim() !== '';

  // ================= QUESTION HANDLERS =================
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', answerType: 'text', options: [''] }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
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
    setQuestions(updated);
  };

  // ================= CREATE SURVEY =================
  const handleCreateSurvey = async () => {
    const surveyData = {
      surveyName,
      description,
      projectIDfromClient,
      projectIDfromInter,
      questions,
      redirectUrl,

      // 🔥 QUOTA FIELD
      maxResponses: maxResponses ? Number(maxResponses) : 0
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
        setSurveyUrl(result.generatedLink);
        setCurrentStep(4);
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
              { num: 3, label: 'Redirect' },
              { num: 4, label: 'Complete' }
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
              <h2 className="survey-create-section-title">
                Survey Details
              </h2>

              <div className="survey-create-form-group">
                <label className="survey-create-label">
                  Survey Name *
                </label>
                <input
                  className="survey-create-input"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                />
              </div>

              <div className="survey-create-form-group">
                <label className="survey-create-label">
                  Client Project ID
                </label>
                <input
                  className="survey-create-input"
                  value={projectIDfromClient}
                  onChange={(e) =>
                    setProjectIDfromClient(e.target.value)
                  }
                />
              </div>

              <div className="survey-create-form-group">
                <label className="survey-create-label">
                  Internal Project ID
                </label>
                <input
                  className="survey-create-input"
                  value={projectIDfromInter}
                  onChange={(e) =>
                    setProjectIDfromInter(e.target.value)
                  }
                />
              </div>

             
              {/* 🔥 QUOTA INPUT */}
              <div className="survey-create-form-group">
                <label className="survey-create-label">
                  Max Responses
                </label>
                <input
                  type="number"
                  min="0"
                  className="survey-create-input"
                  value={maxResponses}
                  onChange={(e) =>
                    setMaxResponses(e.target.value)
                  }
                  placeholder="0 = Unlimited"
                />
                <small style={{ color: '#666' }}>
                  Survey will auto-close after this many submissions
                </small>
              </div>

               <div className="survey-create-form-group">
                <label className="survey-create-label">
                  Description
                </label>
                <textarea
                  className="survey-create-textarea"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
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
              <h2 className="survey-create-section-title">
                Add Questions
              </h2>

              {questions.map((q, i) => (
                <div key={i} className="survey-create-question-card">
                  <div className="survey-create-question-header">
                    <span>Question {i + 1}</span>
                    <button
                      className="survey-create-btn-icon"
                      onClick={() => removeQuestion(i)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <input
                    className="survey-create-input"
                    value={q.questionText}
                    onChange={(e) =>
                      updateQuestion(i, 'questionText', e.target.value)
                    }
                  />

                  <select
                    className="survey-create-select"
                    value={q.answerType}
                    onChange={(e) =>
                      updateQuestion(i, 'answerType', e.target.value)
                    }
                  >
                    <option value="text">Text</option>
                    <option value="mcq">Multiple Choice</option>
                  </select>

                  {q.answerType === 'mcq' &&
                    q.options.map((opt, oi) => (
                      <div key={oi} className="survey-create-option-item">
                        <input
                          className="survey-create-option-input"
                          value={opt}
                          onChange={(e) =>
                            updateOption(i, oi, e.target.value)
                          }
                        />
                        <button
                          className="survey-create-btn-icon"
                          onClick={() => removeOption(i, oi)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                  {q.answerType === 'mcq' && (
                    <button
                      className="survey-create-btn-add-option"
                      onClick={() => addOption(i)}
                    >
                      <Plus size={16} /> Add Option
                    </button>
                  )}
                </div>
              ))}

              <button
                className="survey-create-btn survey-create-btn-secondary"
                onClick={addQuestion}
                style={{ width: '100%' }}
              >
                <Plus size={20} /> Add Question
              </button>

              <div className="survey-create-actions">
                <button
                  className="survey-create-btn survey-create-btn-secondary"
                  onClick={() => setCurrentStep(1)}
                >
                  <ChevronLeft size={20} /> Back
                </button>
                <button
                  className="survey-create-btn survey-create-btn-primary"
                  disabled={!canProceedStep2}
                  onClick={() => setCurrentStep(3)}
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {currentStep === 3 && (
            <div className="survey-create-card">
              <h2 className="survey-create-section-title">
                Redirect URL
              </h2>

              <input
                className="survey-create-input"
                value={redirectUrl}
                onChange={(e) =>
                  setRedirectUrl(e.target.value)
                }
                placeholder="https://example.com/thank-you"
              />

              <div className="survey-create-actions">
                <button
                  className="survey-create-btn survey-create-btn-secondary"
                  onClick={() => setCurrentStep(2)}
                >
                  <ChevronLeft size={20} /> Back
                </button>
                <button
                  className="survey-create-btn survey-create-btn-success"
                  disabled={!canProceedStep3 || loading}
                  onClick={handleCreateSurvey}
                >
                  {loading ? 'Creating...' : 'Create Survey'}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4 ================= */}
          {currentStep === 4 && (
            <div className="survey-create-card">
              <h2 className="survey-create-success-title">
                Survey Created Successfully 🎉
              </h2>

              <div className="survey-create-url-box">
                <span className="survey-create-url-text">
                  {surveyUrl}
                </span>
                <button
                  className="survey-create-btn survey-create-btn-primary"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>

              <button
                className="survey-create-btn survey-create-btn-primary"
                onClick={() => window.open(surveyUrl)}
              >
                <ExternalLink size={20} /> Open Survey
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SurveyBuilder;
