import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';
import { api } from '../../services/api';
import { formatDate, formatRelativeTime, getInitials } from '../../utils/formatters';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

export const SystemAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities(undefined, 100);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Shield size={20} color="var(--primary-500)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>System Audit & Security Trail</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Immutable record of security mutations, task reassignments, and administrative actions.
            </p>
          </div>
        </div>

        <Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={fetchAuditLogs} loading={loading}>
          Refresh Trail
        </Button>
      </div>

      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Actor</th>
              <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Action</th>
              <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatRelativeTime(log.created_at)}
                </td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.6rem' }}>
                      {log.user?.avatar_url ? (
                        <img src={log.user.avatar_url} alt={log.user.full_name} />
                      ) : (
                        getInitials(log.user?.full_name || 'S')
                      )}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.user?.full_name || 'System'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>
                  {log.details ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {JSON.stringify(log.details)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
