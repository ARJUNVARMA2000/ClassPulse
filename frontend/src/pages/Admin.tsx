import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getSession, getStreamUrl } from '../api';
import type { SummaryPayload, StatusPayload } from '../api';
import ThemeCard from '../components/ThemeCard';

export default function Admin() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const adminToken = searchParams.get('token') || '';

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseCount, setResponseCount] = useState(0);
  const [minRequired, setMinRequired] = useState(3);
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [sseError, setSseError] = useState('');
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const responseCountRef = useRef(responseCount);
  useEffect(() => { responseCountRef.current = responseCount; }, [responseCount]);

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then((data) => {
        setQuestion(data.question);
        setResponseCount(data.response_count);
        setLoading(false);
      })
      .catch(() => {
        setError('Session not found');
        setLoading(false);
      });
  }, [sessionId]);

  const connectSSE = useCallback(() => {
    if (!sessionId || !adminToken) return;

    const url = getStreamUrl(sessionId, adminToken);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setSseError('');
    };

    es.addEventListener('summary', (e) => {
      try {
        const data: SummaryPayload = JSON.parse(e.data);
        setSummary(data);
        setResponseCount(data.response_count);
        setSseError('');
      } catch {
        console.error('Failed to parse summary event');
      }
    });

    es.addEventListener('status', (e) => {
      try {
        const data: StatusPayload = JSON.parse(e.data);
        setResponseCount(data.response_count);
        setMinRequired(data.min_required);
      } catch {
        console.error('Failed to parse status event');
      }
    });

    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setSseError(data.message || 'Summarization error');
        setResponseCount(data.response_count || responseCountRef.current);
      } catch {
        // Connection errors are handled by EventSource's automatic retry below.
      }
    });

    es.onerror = () => {
      setConnected(false);
      // Keep the stream open so EventSource can use its built-in retry behavior.
    };
  }, [sessionId, adminToken]);

  useEffect(() => {
    connectSSE();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connectSSE]);

  const studentUrl = sessionId
    ? `${window.location.origin}/session/${sessionId}`
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(studentUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="state-page">
        <div className="loading-state" role="status">
          <span className="pixel-loader" aria-hidden="true" />
          <span>Preparing your live pulse…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-page">
        <div className="error-card" role="alert">
          <span className="section-label">Unable to load</span>
          <h1>We couldn’t open this session.</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar admin-topbar">
        <div className="topbar-inner admin-topbar-inner">
          <a href="/" className="brand" aria-label="ClassPulse home">
            <span className="brand-mark" aria-hidden="true" />
            <span>ClassPulse</span>
          </a>
          <div className="connection-badge" data-connected={connected} role="status">
            <span className="connection-dot" aria-hidden="true" />
            {connected ? 'Live and listening' : 'Reconnecting'}
          </div>
        </div>
      </header>

      <main className="admin-shell">
        <section className="session-hero" aria-labelledby="session-question">
          <div className="session-copy">
            <div className="eyebrow">Live session</div>
            <h1 id="session-question">{question}</h1>
            <p>Themes update automatically as more students respond.</p>
          </div>
          <div className="session-stats" aria-label="Session status">
            <div className="stat-block">
              <span>Responses</span>
              <strong>{responseCount}</strong>
            </div>
            <div className="stat-block">
              <span>Analysis</span>
              <strong className="stat-text">
                {responseCount < minRequired ? `${minRequired - responseCount} to go` : 'Active'}
              </strong>
            </div>
          </div>
        </section>

        <div className="admin-layout">
          <section className="results-panel" aria-labelledby="themes-title">
            <div className="results-header">
              <div>
                <span className="section-label">Live understanding</span>
                <h2 id="themes-title">What your class is saying</h2>
              </div>
              {summary && (
                <span className="analysis-chip">
                  <span className="status-dot" aria-hidden="true" />
                  Updated from {summary.response_count}
                </span>
              )}
            </div>

            {sseError && <div className="error-banner" role="alert">{sseError}</div>}

            {summary && summary.themes.length > 0 ? (
              <div>
                <div className="themes-grid">
                  {summary.themes.map((theme, i) => (
                    <ThemeCard key={`${theme.title}-${i}`} theme={theme} index={i} />
                  ))}
                </div>
                <p className="summary-meta">
                  Based on {summary.response_count} student {summary.response_count === 1 ? 'response' : 'responses'}
                  {summary.model_used && <> · Generated with {summary.model_used}</>}
                </p>
              </div>
            ) : (
              <div className="empty-state">
                <div className="pixel-grid" aria-hidden="true">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <span key={index} />
                  ))}
                </div>
                <h3>Waiting for the room</h3>
                <p>
                  Themes will appear here after {minRequired} students respond.
                  You can share the link or QR code while you wait.
                </p>
                <div className="response-progress" aria-label={`${responseCount} of ${minRequired} responses needed`}>
                  <span style={{ width: `${Math.min(100, (responseCount / minRequired) * 100)}%` }} />
                </div>
                <span className="progress-copy">{responseCount} / {minRequired} responses</span>
              </div>
            )}
          </section>

          <aside className="share-card" aria-labelledby="share-title">
            <div className="card-heading compact-heading">
              <div>
                <span className="section-label">Invite students</span>
                <h2 id="share-title">Join this pulse</h2>
              </div>
              <span className="share-step">Share</span>
            </div>

            <p className="share-description">
              Students can scan the code or open the link on any device.
            </p>

            <div className="qr-wrapper">
              <QRCodeSVG value={studentUrl} size={176} level="M" />
            </div>

            <div className="link-field">
              <label htmlFor="student-link">Student link</label>
              <div className="link-row">
                <input
                  id="student-link"
                  type="text"
                  className="link-input"
                  value={studentUrl}
                  readOnly
                />
                <button className="btn btn-secondary copy-button" onClick={copyLink}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="share-note">
              <span className="share-note-icon" aria-hidden="true">↗</span>
              <p><strong>Keep this page open.</strong> New themes arrive here automatically.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
