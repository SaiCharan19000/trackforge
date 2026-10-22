import React from 'react';
import { Button } from '../components/common/Button';
import { AlertCircle } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}
      >
        <AlertCircle size={38} color="var(--accent-rose)" />
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        404 - Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 420, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        The page you are looking for might have been moved, renamed, or is temporarily unavailable.
      </p>
      <Button variant="primary" onClick={() => onNavigate('/')}>
        Back to Dashboard
      </Button>
    </div>
  );
};
