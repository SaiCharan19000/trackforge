import React from 'react';
import { ProjectStatus, ProjectPriority, TaskStatus, TaskPriority, UserRole } from '../../types';

interface BadgeProps {
  type?: 'status' | 'priority' | 'role';
  value: ProjectStatus | ProjectPriority | TaskStatus | TaskPriority | UserRole | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ value, className = '' }) => {
  const normalized = value.toLowerCase().replace(/\s+/g, '_');
  const badgeClass = `badge-${normalized}`;

  const formatText = (val: string) => {
    return val.replace(/_/g, ' ');
  };

  return (
    <span className={`badge ${badgeClass} ${className}`.trim()}>
      {formatText(value)}
    </span>
  );
};
