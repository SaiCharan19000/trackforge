import React from 'react';
import { Task, TaskStatus } from '../../types';
import { Badge } from '../common/Badge';
import { formatDate, getInitials } from '../../utils/formatters';
import { Calendar, MessageSquare, Paperclip, CheckCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  isDraggable = true,
  onDragStart
}) => {
  const isOverdue =
    task.due_date && task.status !== 'completed' && new Date(task.due_date) < new Date();

  return (
    <div
      className="card card-interactive"
      draggable={isDraggable}
      onDragStart={onDragStart}
      onClick={onClick}
      style={{
        padding: '1rem',
        cursor: 'grab',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <Badge value={task.priority} />
        {task.project && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {task.project.name}
          </span>
        )}
      </div>

      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
        {task.title}
      </h4>

      {task.description && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4
          }}
        >
          {task.description}
        </p>
      )}

      {/* Meta Row: Date, Assignee, Comments/Attachments */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.72rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: isOverdue ? 'var(--accent-rose)' : 'var(--text-muted)',
            fontWeight: isOverdue ? 700 : 500
          }}
        >
          <Calendar size={12} />
          <span>{formatDate(task.due_date)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {(task.comments_count || 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-muted)' }}>
              <MessageSquare size={12} />
              <span>{task.comments_count}</span>
            </div>
          )}

          {(task.attachments_count || 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-muted)' }}>
              <Paperclip size={12} />
              <span>{task.attachments_count}</span>
            </div>
          )}

          <div
            className="avatar"
            style={{ width: 22, height: 22, fontSize: '0.6rem' }}
            title={task.assignee ? `Assigned to ${task.assignee.full_name}` : 'Unassigned'}
          >
            {task.assignee?.avatar_url ? (
              <img src={task.assignee.avatar_url} alt={task.assignee.full_name} />
            ) : (
              getInitials(task.assignee?.full_name || 'U')
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
