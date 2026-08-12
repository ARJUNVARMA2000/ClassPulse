import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../api';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await createSession(question.trim());
      navigate(`/session/${data.session_id}/admin?token=${data.admin_token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'What part of today\'s lesson still feels unclear?',
    'What is one idea you would explain differently?',
    'What should we revisit before moving on?',
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a href="/" className="brand" aria-label="ClassPulse home">
            <span className="brand-mark" aria-hidden="true" />
            <span>ClassPulse</span>
          </a>
          <div className="topbar-note">
            <span className="status-dot" aria-hidden="true" />
            No sign-in required
          </div>
        </div>
      </header>

      <main className="home-main">
        <section className="home-intro" aria-labelledby="home-title">
          <div className="eyebrow">Live classroom feedback</div>
          <h1 id="home-title">Turn every voice into a clear next step.</h1>
          <p className="home-lede">
            Ask one thoughtful question, hear from the whole room, and see the
            ideas your class has in common as they respond.
          </p>

          <div className="workflow-list" aria-label="How ClassPulse works">
            <div className="workflow-item">
              <span className="workflow-number">01</span>
              <div>
                <strong>Ask</strong>
                <p>Start with the question you want everyone to consider.</p>
              </div>
            </div>
            <div className="workflow-item">
              <span className="workflow-number">02</span>
              <div>
                <strong>Collect</strong>
                <p>Students respond from any device using one shared link.</p>
              </div>
            </div>
            <div className="workflow-item">
              <span className="workflow-number">03</span>
              <div>
                <strong>Understand</strong>
                <p>Key themes appear live, with student voices attached.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="create-card" aria-labelledby="create-title">
          <div className="card-heading">
            <div>
              <span className="section-label">New pulse</span>
              <h2 id="create-title">What do you want to ask?</h2>
            </div>
            <span className="card-step">01 / 01</span>
          </div>

          <form onSubmit={handleSubmit} className="composer-form">
            <label htmlFor="question" className="sr-only">
              Question for your class
            </label>
            <textarea
              id="question"
              className="composer-textarea"
              placeholder="Ask a question that invites reflection…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={6}
              maxLength={1000}
              required
              autoFocus
            />

            <div className="composer-actions">
              <span className="character-count">{question.length} / 1,000</span>
              <button
                type="submit"
                className="btn btn-primary btn-compact"
                disabled={loading || !question.trim()}
              >
                {loading ? 'Starting…' : 'Start live pulse'}
                {!loading && <span aria-hidden="true">↗</span>}
              </button>
            </div>
          </form>

          {error && <p className="error-text" role="alert">{error}</p>}

          <div className="prompt-suggestions">
            <span className="suggestions-label">Try a prompt</span>
            <div className="suggestion-list">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => setQuestion(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>Designed for honest, low-friction classroom reflection.</span>
        <span>ClassPulse · Live understanding</span>
      </footer>
    </div>
  );
}
