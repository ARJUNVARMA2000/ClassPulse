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
      <div className="state-page">
        <div className="loading-state" role="status">
          <span className="pixel-loader" aria-hidden="true" />
          <span>Opening your class pulse…</span>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-inner topbar-narrow">
            <a href="/" className="brand" aria-label="ClassPulse home">
              <span className="brand-mark" aria-hidden="true" />
              <span>ClassPulse</span>
            </a>
            <span className="topbar-context">Student response</span>
          </div>
        </header>
        <main className="student-main student-main-centered">
          <div className="success-card">
            <div className="success-icon" aria-hidden="true">✓</div>
            <span className="section-label">Response received</span>
            <h1>You’re all set, {studentName}.</h1>
            <p>Your response has been added to the class pulse.</p>
            <div className="success-detail">
              <span className="status-dot" aria-hidden="true" />
              Your teacher will see it in the live summary
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner topbar-narrow">
          <a href="/" className="brand" aria-label="ClassPulse home">
            <span className="brand-mark" aria-hidden="true" />
            <span>ClassPulse</span>
          </a>
          <span className="topbar-context">Student response</span>
        </div>
      </header>

      <main className="student-main">
        {error && !question ? (
          <div className="error-card" role="alert">
            <span className="section-label">Unable to join</span>
            <h1>We couldn’t open this pulse.</h1>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <section className="student-question" aria-labelledby="class-question">
              <div className="live-label">
                <span className="status-dot status-dot-live" aria-hidden="true" />
                Live class pulse
              </div>
              <h1 id="class-question">{question}</h1>
              <p>Share what you genuinely think. A few thoughtful sentences are enough.</p>
            </section>

            <form onSubmit={handleSubmit} className="response-card">
              <div className="card-heading compact-heading">
                <div>
                  <span className="section-label">Your response</span>
                  <h2>Add your perspective</h2>
                </div>
                <span className="privacy-chip">Shared with your teacher</span>
              </div>

              <div className="field-group">
                <div className="field-label-row">
                  <label htmlFor="name" className="form-label">Your name</label>
                  <span>{studentName.length} / 100</span>
                </div>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="How should your teacher identify you?"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="field-group">
                <div className="field-label-row">
                  <label htmlFor="answer" className="form-label">Your thoughts</label>
                  <span>{answer.length} / 5,000</span>
                </div>
                <textarea
                  id="answer"
                  className="form-textarea response-textarea"
                  placeholder="Write your response here…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={7}
                  maxLength={5000}
                  required
                />
              </div>

              {error && <p className="error-text" role="alert">{error}</p>}

              <div className="response-actions">
                <p>Take your time—your response can’t be edited after sending.</p>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !studentName.trim() || !answer.trim()}
                >
                  {submitting ? 'Sending…' : 'Send response'}
                  {!submitting && <span aria-hidden="true">↗</span>}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
