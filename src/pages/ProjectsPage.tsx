import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectFilters } from '../components/projects/ProjectFilters';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { Button } from '../components/common/Button';
import { canCreateProject } from '../utils/permissions';
import { Plus } from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { projects, loading, createProject, refreshProjects } = useProjects();

  const allowCreate = canCreateProject(user?.role);

  // Filter projects
  const filtered = projects.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      p.name.toLowerCase().includes(s) ||
      (p.description && p.description.toLowerCase().includes(s));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleCreate = async (data: any) => {
    if (!user) return;
    await createProject(data, user);
    refreshProjects();
  };

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
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Projects</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Track progress, milestones, and team assignments across all active initiatives.
          </p>
        </div>

        {allowCreate && (
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Project
          </Button>
        )}
      </div>

      <ProjectFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {loading ? (
        <LoadingState message="Fetching project portfolio..." rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={
            search || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Get started by creating your team\'s first project.'
          }
          actionLabel={allowCreate ? 'Create First Project' : undefined}
          onAction={allowCreate ? () => setIsCreateModalOpen(true) : undefined}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {filtered.map(proj => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onClick={() => onNavigate(`/projects/${proj.id}`)}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};
