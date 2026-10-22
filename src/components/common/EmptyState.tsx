import React from 'react';
import { FolderKanban, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'folder' | 'check' | 'alert';
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'folder',
  actionLabel,
  onAction
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'check':
        return <CheckCircle2 size={44} color="var(--accent-emerald)" />;
      case 'alert':
        return <AlertCircle size={44} color="var(--accent-amber)" />;
      default:
        return <FolderKanban size={44} color="var(--primary-400)" />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-strong)',
        margin: '1.5rem 0'
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}
      >
        {renderIcon()}
      </div>
      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ maxWidth: 420, fontSize: '0.875rem', marginBottom: actionLabel ? '1.5rem' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
