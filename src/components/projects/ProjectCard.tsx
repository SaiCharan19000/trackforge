import React from 'react';
import { Project } from '../../types';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { formatDate, getInitials } from '../../utils/formatters';
import { Calendar, Users, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div
      className="card card-interactive"
      onClick={onClick}
      style={{
        padding: '1.4rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {project.name}
          </h3>
          <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
            <Badge value={project.priority} />
            <Badge value={project.status} />
          </div>
        </div>

        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.5rem'
          }}
        >
          {project.description || 'No description provided.'}
        </p>

        {/* Progress */}
        <div style={{ marginBottom: '1.25rem' }}>
          <ProgressBar progress={project.progress_percentage} showLabel size="md" />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={13} />
          <span>Due {formatDate(project.deadline)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {project.members && project.members.length > 0 && (
            <div className="avatar-group">
              {project.members.slice(0, 3).map(m => (
                <div key={m.id} className="avatar" style={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                  {m.user?.avatar_url ? (
                    <img src={m.user.avatar_url} alt={m.user.full_name} />
                  ) : (
                    getInitials(m.user?.full_name)
                  )}
                </div>
              ))}
              {project.members.length > 3 && (
                <div
                  className="avatar"
                  style={{
                    width: 24,
                    height: 24,
                    fontSize: '0.65rem',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  +{project.members.length - 3}
                </div>
              )}
            </div>
          )}
          <ArrowUpRight size={15} color="var(--primary-500)" />
        </div>
      </div>
    </div>
  );
};
