import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Layers, Shield, Briefcase, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isDemoMode, switchDemoRole } = useAuth();
  const { addToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      addToast({ type: 'success', title: 'Welcome back!', message: 'Signed in successfully.' });
      onNavigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    const emails: Record<UserRole, string> = {
      admin: 'admin@trackforge.io',
      project_manager: 'manager@trackforge.io',
      team_member: 'sai@trackforge.io'
    };
    setEmail(emails[role]);
    setPassword('demo-password-123');
    login(emails[role], 'demo-password-123');
    addToast({ type: 'info', title: `Demo Mode: ${role.replace('_', ' ')}`, message: 'Signed in as demo persona.' });
    onNavigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(circle at 50% 20%, rgba(79, 70, 229, 0.12) 0%, transparent 70%), var(--bg-app)'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '2.25rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-strong)'
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Layers size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Welcome to TrackForge
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Multi-User Project Tracking & Operations Platform
          </p>
        </div>

        {/* Demo Credentials Panel */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(79,70,229,0.04) 100%)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(79,70,229,0.25)'
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={11} /> Demo Mode — Click any role to log in instantly
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {[
              { role: 'admin' as UserRole, label: 'Admin', email: 'admin@trackforge.io', color: 'var(--accent-rose)', icon: <Shield size={12} /> },
              { role: 'project_manager' as UserRole, label: 'Project Manager', email: 'manager@trackforge.io', color: 'var(--primary-500)', icon: <Briefcase size={12} /> },
              { role: 'team_member' as UserRole, label: 'Team Member', email: 'sai@trackforge.io', color: 'var(--accent-emerald)', icon: <UserCheck size={12} /> },
            ].map(({ role, label, email, color, icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleQuickDemoLogin(role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{email}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', color, fontWeight: 700, background: `${color}18`, padding: '0.15rem 0.45rem', borderRadius: 4 }}>
                  LOGIN →
                </span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.6rem', textAlign: 'center' }}>
            Password: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>demo-password-123</span> (any password works in demo)
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '0.65rem 0.9rem',
              marginBottom: '1.25rem',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-rose)',
              fontSize: '0.8125rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-pass">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-pass"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }} loading={loading}>
            Sign In to TrackForge
          </Button>
        </form>
      </div>
    </div>
  );
};
