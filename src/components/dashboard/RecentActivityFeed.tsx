import React from 'react';
import { ActivityLog } from '../../types';
import { formatRelativeTime, getInitials } from '../../utils/formatters';
import { Activity } from 'lucide-react';

interface RecentActivityFeedProps {
  activities: ActivityLog[];
  onViewAll?: () => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities, onViewAll }) => {
  return (
    <div className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--primary-500)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Activity</h4>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}
          >
            View all
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No recent activity recorded
          </div>
        ) : (
          activities.slice(0, 6).map(act => (
            <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                {act.user?.avatar_url ? (
                  <img src={act.user.avatar_url} alt={act.user.full_name} />
                ) : (
                  getInitials(act.user?.full_name)
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>
                  <strong>{act.user?.full_name || 'System'}</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{act.action.toLowerCase()}</span>
                  {act.details?.task_title && (
                    <>
                      {' '}
                      <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
                        "{act.details.task_title}"
                      </span>
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
                  {act.details?.new_status && (
                    <>
                      {' '}to{' '}
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {act.details.new_status.replace('_', ' ')}
                      </span>
                    </>
                  )}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {formatRelativeTime(act.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
