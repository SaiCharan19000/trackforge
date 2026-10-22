import React from 'react';
import { Task } from '../../types';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { Clock, AlertTriangle } from 'lucide-react';

interface UpcomingDeadlinesProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ tasks, onSelectTask }) => {
  const now = new Date();

  // Filter tasks with deadlines that aren't completed, sorted by due_date ascending
  const deadlineTasks = tasks
    .filter(t => t.due_date && t.status !== 'completed')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  return (
    <div className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--accent-amber)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Upcoming Deadlines</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgent items</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {deadlineTasks.length === 0 ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No upcoming deadlines pending
          </div>
        ) : (
          deadlineTasks.map(task => {
            const dueDate = new Date(task.due_date!);
            const isOverdue = dueDate < now;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask && onSelectTask(task)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid ' + (isOverdue ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: onSelectTask ? 'pointer' : 'default',
                  transition: 'transform var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  if (onSelectTask) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  if (onSelectTask) e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 2 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {task.project?.name || 'Project'}
                    </span>
                    <Badge value={task.priority} />
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isOverdue ? 'var(--accent-rose)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {isOverdue && <AlertTriangle size={12} color="var(--accent-rose)" />}
                    {formatDate(task.due_date)}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: isOverdue ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    {isOverdue ? 'Overdue' : 'Due Soon'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
