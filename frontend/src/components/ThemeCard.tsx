import type { Theme } from '../api';

interface ThemeCardProps {
  theme: Theme;
  index: number;
}

const COLORS = [
  { hex: '#00d4ff', dim: 'rgba(0, 212, 255, 0.08)', border: 'rgba(0, 212, 255, 0.2)' },   // cyan
  { hex: '#00ff88', dim: 'rgba(0, 255, 136, 0.08)', border: 'rgba(0, 255, 136, 0.2)' },   // green
  { hex: '#ffaa00', dim: 'rgba(255, 170, 0, 0.08)', border: 'rgba(255, 170, 0, 0.2)' },   // amber
  { hex: '#ff66aa', dim: 'rgba(255, 102, 170, 0.08)', border: 'rgba(255, 102, 170, 0.2)' }, // pink
  { hex: '#aa88ff', dim: 'rgba(170, 136, 255, 0.08)', border: 'rgba(170, 136, 255, 0.2)' }, // violet
  { hex: '#ff8844', dim: 'rgba(255, 136, 68, 0.08)', border: 'rgba(255, 136, 68, 0.2)' },  // orange
];

export default function ThemeCard({ theme, index }: ThemeCardProps) {
  const color = COLORS[index % COLORS.length];

  return (
    <div
      className="theme-card"
      style={{
        '--card-accent': color.hex,
        '--card-accent-dim': color.dim,
        '--card-accent-border': color.border,
      } as React.CSSProperties}
    >
      <div className="theme-header">
        <span className="theme-number">
          SIGNAL {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="theme-title">{theme.title}</h3>
      </div>
      <p className="theme-description">{theme.description}</p>
      {theme.student_names.length > 0 && (
        <div className="theme-students">
          {theme.student_names.map((name, i) => (
            <span key={i} className="student-tag">
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
