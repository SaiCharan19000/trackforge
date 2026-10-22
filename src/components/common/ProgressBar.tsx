import React from 'react';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  size = 'md',
  className = ''
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const isComplete = clamped === 100;

  const height = size === 'sm' ? 5 : size === 'lg' ? 10 : 7;

  return (
    <div className={`progress-container ${className}`} style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
          <span style={{ color: isComplete ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>{clamped}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className={`progress-fill ${isComplete ? 'success' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
