import React from 'react';
import { Search } from 'lucide-react';

interface ProjectFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  search,
  onSearchChange
}) => {
  const statuses = [
    { value: 'all', label: 'All Projects' },
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}
    >
      {/* Status Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {statuses.map(s => {
          const active = statusFilter === s.value;
          return (
            <button
              key={s.value}
              onClick={() => onStatusChange(s.value)}
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                background: active ? 'var(--primary-600)' : 'var(--bg-surface)',
                color: active ? '#ffffff' : 'var(--text-secondary)',
                borderColor: active ? 'var(--primary-600)' : 'var(--border-subtle)',
                boxShadow: active ? '0 2px 6px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Right controls: Priority dropdown & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140, height: 36, padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
          value={priorityFilter}
          onChange={e => onPriorityChange(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div style={{ position: 'relative', width: 220 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter projects..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            style={{ height: 36, paddingLeft: '2rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>
    </div>
  );
};
