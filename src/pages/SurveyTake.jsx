import { useEffect, useState } from "react";
import axios from "axios";
import './CSS/SurveyTake.css'

export default function SurveyTake() {
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const surveyId = window.location.pathname.split("/").pop();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchSurvey();
  }, []);

  const fetchSurvey = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/survey/getServey/${surveyId}`
      );
      setSurvey(res.data.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

const handleSubmit = async () => {
  setSubmitting(true);

  const payload = {
    surveyId,
    responses: survey.questions.map((q, index) => ({
      questionId: q._id,
      answer: answers[index] || "",
    })),
  };

  try {
    await axios.post(`${API_URL}/api/submission/submit`, payload);

    let url = survey.redirectUrl;

    // Agar http:// ya https:// missing ho to add kar do
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    window.open(url, "_self");
     setSubmitting(false);
  } catch (error) {
    console.error(error);
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <>
        <div className="take-survey-loading">
          <div className="take-survey-spinner"></div>
        </div>
      </>
    );
  }

  if (!survey) {
    return (
      <>
  
        <div className="take-survey-error">
          <p className="take-survey-error-text">Survey not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
       
      `}</style>
      <div className="take-survey-container">
        <div className="take-survey-form">
          <div className="take-survey-header">
            <h1 className="take-survey-title">{survey.surveyName}</h1>
            {survey.description && (
              <p className="take-survey-description">{survey.description}</p>
            )}
          </div>

          <div className="take-survey-body">
            {survey.questions.map((q, index) => (
              <div key={index} className="take-survey-question">
                <label className="take-survey-question-label">
                  {index + 1}. {q.questionText}
                </label>

                {/* TEXT INPUT */}
                {q.answerType === "text" && (
                  <input
                    type="text"
                    className="take-survey-input"
                    placeholder="Your answer"
                    value={answers[index] || ""}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                )}

                {/* RATING 1-5 */}
                {q.answerType === "rating" && (
                  <div className="take-survey-rating">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="take-survey-rating-item">
                        <input
                          type="radio"
                          id={`rating-${index}-${rating}`}
                          name={`rating-${index}`}
                          value={rating}
                          checked={answers[index] === String(rating)}
                          onChange={(e) => handleChange(index, e.target.value)}
                          className="take-survey-rating-input"
                        />
                        <label
                          htmlFor={`rating-${index}-${rating}`}
                          className="take-survey-rating-label"
                        >
                          {rating}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* MCQ OPTIONS */}
                {q.answerType === "mcq" && (
                  <div className="take-survey-mcq">
                    {q.options.map((option, i) => (
                      <div key={i} className="take-survey-mcq-option">
                        <label className="take-survey-mcq-label">
                          <input
                            type="radio"
                            name={`mcq-${index}`}
                            value={option}
                            checked={answers[index] === option}
                            onChange={() => handleChange(index, option)}
                            className="take-survey-mcq-input"
                          />
                          <span className="take-survey-mcq-text">{option}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="take-survey-footer">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="take-survey-submit"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}