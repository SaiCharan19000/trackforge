import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useProjects } from '../hooks/useProjects';
import { ActivityLog } from '../types';
import { formatRelativeTime, formatDate, getInitials } from '../utils/formatters';
import { LoadingState } from '../components/common/LoadingState';
import { Activity, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const { projects } = useProjects();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getActivities(
        selectedProjectId !== 'all' ? selectedProjectId : undefined,
        60
      );
      setActivities(data);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Activity History</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Complete audit trail of all project milestones, task state transitions, and member actions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{ width: 'auto', minWidth: 180, height: 36, fontSize: '0.8125rem' }}
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={fetchActivities}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <LoadingState message="Loading activity trail..." rows={4} />
        ) : activities.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No activity logs found for the selected view.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activities.map(act => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
                  {act.user?.avatar_url ? (
                    <img src={act.user.avatar_url} alt={act.user.full_name} />
                  ) : (
                    getInitials(act.user?.full_name || 'S')
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                      <strong>{act.user?.full_name || 'System'}</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {act.action.toLowerCase()}
                      </span>
                      {act.details?.task_title && (
                        <>
                          {' '}
                          <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
                            "{act.details.task_title}"
                          </span>
                        </>
                      )}
                      {act.details?.assignee && (
                        <>
                          {' '}to <strong>{act.details.assignee}</strong>
                        </>
                      )}
                      {act.details?.new_status && (
                        <>
                          {' '}from{' '}
                          <span style={{ textTransform: 'capitalize' }}>
                            {act.details.previous_status?.replace('_', ' ') || 'previous'}
                          </span>{' '}
                          to{' '}
                          <strong style={{ textTransform: 'capitalize' }}>
                            {act.details.new_status.replace('_', ' ')}
                          </strong>
                        </>
                      )}
                      {act.details?.file_name && (
                        <>
                          {' '}file <code>{act.details.file_name}</code>
                        </>
                      )}
                      {act.details?.project_name && !act.details?.task_title && (
                        <>
                          {' '}
                          <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
                            "{act.details.project_name}"
                          </span>
                        </>
                      )}
                    </p>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                      {formatRelativeTime(act.created_at)}
                    </span>
                  </div>

                  {act.project_name && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 4,
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      Project: <strong>{act.project_name}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
