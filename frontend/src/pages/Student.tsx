import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSession, submitResponse } from '../api';

export default function Student() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [question, setQuestion] = useState('');
  const [studentName, setStudentName] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then((data) => {
        setQuestion(data.question);
        setLoading(false);
      })
      .catch(() => {
        setError('Session not found. It may have expired.');
        setLoading(false);
      });
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !studentName.trim() || !answer.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await submitResponse(sessionId, studentName.trim(), answer.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Establishing uplink...</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">&#10003;</div>
            <h2>Transmission Received</h2>
            <p>Signal confirmed from <strong>{studentName}</strong>.</p>
            <p>Your response is being processed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="student-header">
          <h1 className="logo logo-small">CLASSPULSE</h1>
          <div className="hero-badge">// uplink terminal</div>
        </div>

        {error ? (
          <div className="error-card">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="question-display">
              <span className="question-label">// mission briefing</span>
              <h2 className="question-text">{question}</h2>
            </div>

            <form onSubmit={handleSubmit} className="response-form">
              <span className="panel-label">// your transmission</span>
              <label htmlFor="name" className="form-label">Callsign</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                maxLength={100}
                required
              />

              <label htmlFor="answer" className="form-label">Response</label>
              <textarea
                id="answer"
                className="form-textarea"
                placeholder="Share your thoughts..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                maxLength={5000}
                required
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !studentName.trim() || !answer.trim()}
              >
                {submitting ? 'Transmitting...' : 'Transmit'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
