import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import DashboardLayout from './Dashboard';
import './CSS/SurveyBuilder.css'
import { useNavigate } from 'react-router-dom';

const SurveyBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyName, setSurveyName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [surveyUrl, setSurveyUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const canProceedStep1 = surveyName.trim() !== '';
  const canProceedStep2 =
    questions.length > 0 &&
    questions.every(q =>
      q.questionText.trim() !== '' &&
      (q.answerType === 'text' ||
        q.options.filter(o => o.trim() !== '').length >= 2)
    );

  const canProceedStep3 = redirectUrl.trim() !== '';

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', answerType: 'text', options: [''] }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
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

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateSurvey = async () => {
    const surveyData = {
      surveyName,
      description,
      questions,
      redirectUrl
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
        alert('Error creating survey: ' + result.message);
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
        <button onClick={() => navigate(-1)} className="survey-full-back-btn">← Back</button>
        <div className="survey-create-wrapper">
          <div className="survey-create-header">
            <h1 className="survey-create-title">Survey Creator</h1>
            <p className="survey-create-subtitle">Create beautiful surveys in minutes</p>
          </div>

          {/* Progress indicator */}
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

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="survey-create-card">
              <h2 className="survey-create-section-title">Survey Details</h2>

              <div className="survey-create-form-group">
                <label className="survey-create-label">Survey Name *</label>
                <input
                  type="text"
                  className="survey-create-input"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  placeholder="e.g. Customer Survey"
                />
              </div>

              <div className="survey-create-form-group">
                <label className="survey-create-label">Description (Optional)</label>
                <textarea
                  className="survey-create-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="survey-create-actions">
                <div></div>
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

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="survey-create-card">
              <h2 className="survey-create-section-title">Add Questions</h2>

              {questions.map((q, i) => (
                <div key={i} className="survey-create-question-card">

                  <div className="survey-create-question-header">
                    <span>Question {i + 1}</span>
                    <button className="survey-create-btn-icon" onClick={() => removeQuestion(i)}>
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="survey-create-form-group">
                    <label className="survey-create-label">Question Text *</label>
                    <input
                      className="survey-create-input"
                      value={q.questionText}
                      onChange={(e) => updateQuestion(i, 'questionText', e.target.value)}
                    />
                  </div>

                  {/* Updated for only text + mcq */}
                  <div className="survey-create-form-group">
                    <label className="survey-create-label">Answer Type *</label>
                    <select
                      className="survey-create-select"
                      value={q.answerType}
                      onChange={(e) => updateQuestion(i, 'answerType', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="mcq">Multiple Choice</option>
                    </select>
                  </div>

                  {(q.answerType === 'mcq') && (
                    <div className="survey-create-form-group">
                      <label className="survey-create-label">Options *</label>

                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="survey-create-option-item">
                          <input
                            className="survey-create-option-input"
                            value={opt}
                            onChange={(e) => updateOption(i, optIndex, e.target.value)}
                          />
                          {q.options.length > 1 && (
                            <button
                              className="survey-create-btn-icon"
                              onClick={() => removeOption(i, optIndex)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      <button className="survey-create-btn-add-option" onClick={() => addOption(i)}>
                        <Plus size={16} /> Add Option
                      </button>
                    </div>
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
                <button className="survey-create-btn survey-create-btn-secondary" onClick={() => setCurrentStep(1)}>
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

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="survey-create-card">
              <h2 className="survey-create-section-title">Redirect URL</h2>

              <div className="survey-create-form-group">
                <label className="survey-create-label">Redirect URL *</label>
                <input
                  type="url"
                  className="survey-create-input"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://example.com/thank-you"
                />
              </div>

              <div className="survey-create-actions">
                <button className="survey-create-btn survey-create-btn-secondary" onClick={() => setCurrentStep(2)}>
                  <ChevronLeft size={20} /> Back
                </button>

                <button
                  className="survey-create-btn survey-create-btn-success"
                  onClick={handleCreateSurvey}
                  disabled={!canProceedStep3 || loading}
                >
                  {loading ? 'Creating...' : <>Create Survey <Check size={18} /></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="survey-create-card">
              <div className="survey-create-success-icon">
                <div className="survey-create-checkmark">✓</div>
              </div>

              <h2 className="survey-create-success-title">Survey Created Successfully!</h2>
              <p>Your survey is ready. Copy and share the link below.</p>

              <div className="survey-create-url-display">
                <div className="survey-create-url-box">
                  <span className="survey-create-url-text">{surveyUrl}</span>

                  <button className="survey-create-btn survey-create-btn-primary" onClick={copyToClipboard}>
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="survey-create-btn survey-create-btn-primary" onClick={() => window.open(surveyUrl)}>
                  <ExternalLink size={20} /> Open Survey
                </button>

                <button
                  className="survey-create-btn survey-create-btn-secondary"
                  onClick={() => {
                    setSurveyName('');
                    setDescription('');
                    setQuestions([]);
                    setRedirectUrl('');
                    setSurveyUrl('');
                    setCurrentStep(1);
                  }}
                >
                  Create Another
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default SurveyBuilder;
