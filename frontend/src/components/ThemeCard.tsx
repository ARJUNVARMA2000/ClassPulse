import type { Theme } from '../api';

interface ThemeCardProps {
  theme: Theme;
  index: number;
}

export default function ThemeCard({ theme, index }: ThemeCardProps) {
  return (
    <article className={`theme-card${index === 0 ? ' theme-card-featured' : ''}`}>
      <div className="theme-header">
        <span className="theme-number">
          Theme {String(index + 1).padStart(2, '0')}
        </span>
        <span className="theme-mentions">
          {theme.student_names.length} {theme.student_names.length === 1 ? 'voice' : 'voices'}
        </span>
      </div>
      <h3 className="theme-title">{theme.title}</h3>
      <p className="theme-description">{theme.description}</p>
      {theme.student_names.length > 0 && (
        <div className="theme-attribution">
          <span className="attribution-label">Mentioned by</span>
          <div className="theme-students">
            {theme.student_names.map((name, i) => (
              <span key={`${name}-${i}`} className="student-tag">
                <span className="student-avatar" aria-hidden="true">
                  {name.trim().charAt(0).toUpperCase()}
                </span>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
