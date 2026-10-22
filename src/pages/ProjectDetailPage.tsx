import React, { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, TaskPriority, ProjectMemberRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { ProjectMemberModal } from '../components/projects/ProjectMemberModal';
import { formatDate, formatRelativeTime, getInitials } from '../utils/formatters';
import {
  canEditProject,
  canDeleteProject,
  canManageProjectMembers,
  canCreateTask
} from '../utils/permissions';
import {
  ArrowLeft,
  Calendar,
  Users,
  ListTodo,
  Kanban,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Search
} from 'lucide-react';

interface ProjectDetailPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
  initialTaskId?: string | null;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onNavigate,
  initialTaskId
}) => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'tasks' | 'kanban' | 'members' | 'activity'>('tasks');

  // Task Filter & Sort in List Tab
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [taskSortBy, setTaskSortBy] = useState<'priority' | 'due_date' | 'status' | 'assignee'>('due_date');
  const [taskSearch, setTaskSearch] = useState('');

  // Modals & Drawers
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalInitialStatus, setTaskModalInitialStatus] = useState<TaskStatus>('todo');
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [proj, t, act] = await Promise.all([
        api.getProjectById(projectId),
        api.getTasks({ projectId }),
        api.getActivities(projectId, 30)
      ]);
      setProject(proj);
      setTasks(t);
      setActivities(act);

      if (initialTaskId) {
        const found = t.find((taskItem: Task) => taskItem.id === initialTaskId);
        if (found) {
          setSelectedTask(found);
          setIsTaskDrawerOpen(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId, initialTaskId]);

  if (loading) {
    return <LoadingState message="Loading project specifications..." rows={4} />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project Not Found"
        description="The project you requested does not exist or you lack viewing permissions."
        actionLabel="Back to Projects"
        onAction={() => onNavigate('/projects')}
      />
    );
  }

  const isOwner = project.owner_id === user?.id || project.created_by === user?.id;
  const allowEdit = canEditProject(user?.role, isOwner);
  const allowDelete = canDeleteProject(user?.role);
  const allowManageMembers = canManageProjectMembers(user?.role, isOwner);
  const allowCreateTask = canCreateTask(user?.role);

  // Filtered & Sorted Tasks for List Tab
  const priorityWeight: Record<TaskPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const filteredTasks = tasks
    .filter(t => {
      const matchesStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;
      const s = taskSearch.toLowerCase();
      const matchesSearch = !s || t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (taskSortBy === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (taskSortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (taskSortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      if (taskSortBy === 'assignee') {
        return (a.assignee?.full_name || '').localeCompare(b.assignee?.full_name || '');
      }
      return 0;
    });

  // Task Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;

  // Handlers
  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    if (!user) return;
    await api.updateTask(taskId, { status }, user);
    await loadProjectData();
  };

  const handleCreateTask = async (data: any) => {
    if (!user) return;
    await api.createTask({ ...data, project_id: projectId }, user);
    await loadProjectData();
  };

  const handleEditProject = async (data: any) => {
    if (!user) return;
    const updated = await api.updateProject(projectId, data, user);
    setProject(updated);
    addToast({ type: 'success', title: 'Project Updated', message: 'Project details saved.' });
  };

  const handleDeleteProject = async () => {
    if (!user || !window.confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) return;
    await api.deleteProject(projectId, user);
    onNavigate('/projects');
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => onNavigate('/projects')}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '1.25rem', paddingLeft: 0, gap: '0.4rem' }}
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Project Header Banner Card */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{project.name}</h1>
              <Badge value={project.status} />
              <Badge value={project.priority} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 750, lineHeight: 1.5 }}>
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {allowManageMembers && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Users size={14} />}
                onClick={() => setIsMembersModalOpen(true)}
              >
                Members ({project.members?.length || 0})
              </Button>
            )}
            {allowEdit && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Edit2 size={14} />}
                onClick={() => setIsEditProjectOpen(true)}
              >
                Edit
              </Button>
            )}
            {allowDelete && (
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={handleDeleteProject}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Project Meta Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            alignItems: 'center'
          }}
        >
          {/* Progress */}
          <div>
            <ProgressBar progress={project.progress_percentage} showLabel size="md" />
          </div>

          {/* Deadline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="var(--primary-500)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target Deadline</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{formatDate(project.deadline)}</div>
            </div>
          </div>

          {/* Owner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem' }}>
              {project.owner?.avatar_url ? (
                <img src={project.owner.avatar_url} alt={project.owner.full_name} />
              ) : (
                getInitials(project.owner?.full_name || 'Owner')
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Project Lead</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{project.owner?.full_name || 'Unassigned'}</div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Tasks:</span>{' '}
              <strong>{totalTasks}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--accent-emerald)' }}>Done:</span>{' '}
              <strong>{completedTasks}</strong>
            </div>
            {blockedTasks > 0 && (
              <div>
                <span style={{ color: 'var(--accent-rose)' }}>Blocked:</span>{' '}
                <strong>{blockedTasks}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'tasks', label: 'Tasks', icon: <ListTodo size={16} />, count: totalTasks },
            { id: 'kanban', label: 'Kanban Board', icon: <Kanban size={16} /> },
            { id: 'members', label: 'Team Members', icon: <Users size={16} />, count: project.members?.length },
            { id: 'activity', label: 'Activity Trail', icon: <Activity size={16} /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  color: isActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      background: isActive ? 'var(--primary-100)' : 'var(--bg-subtle)',
                      color: isActive ? 'var(--primary-700)' : 'var(--text-muted)'
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {allowCreateTask && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => {
              setTaskModalInitialStatus('todo');
              setIsTaskModalOpen(true);
            }}
          >
            Add Task
          </Button>
        )}
      </div>

      {/* Tab 1: Tasks List */}
      {activeTab === 'tasks' && (
        <div>
          {/* Filters Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {['all', 'todo', 'in_progress', 'review', 'completed', 'blocked'].map(st => (
                <button
                  key={st}
                  onClick={() => setTaskStatusFilter(st)}
                  className="btn btn-sm"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    background: taskStatusFilter === st ? 'var(--primary-600)' : 'var(--bg-surface)',
                    color: taskStatusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: taskStatusFilter === st ? 'var(--primary-600)' : 'var(--border-subtle)',
                    textTransform: 'capitalize'
                  }}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Sort & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort:</span>
                <select
                  className="form-select"
                  value={taskSortBy}
                  onChange={e => setTaskSortBy(e.target.value as any)}
                  style={{ width: 'auto', height: 34, padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                >
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="assignee">Assignee</option>
                </select>
              </div>

              <div style={{ position: 'relative', width: 180 }}>
                <Search
                  size={13}
                  style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search tasks..."
                  value={taskSearch}
                  onChange={e => setTaskSearch(e.target.value)}
                  style={{ height: 34, paddingLeft: '1.8rem', fontSize: '0.75rem' }}
                />
              </div>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks match the filter"
              description="Adjust your status filter or create a new task for this project."
              actionLabel={allowCreateTask ? 'Add First Task' : undefined}
              onAction={allowCreateTask ? () => setIsTaskModalOpen(true) : undefined}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsTaskDrawerOpen(true);
                  }}
                  onStatusChange={(newSt: TaskStatus) => handleUpdateStatus(task.id, newSt)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Kanban Board */}
      {activeTab === 'kanban' && (
        <div>
          <KanbanBoard
            tasks={tasks}
            onTaskClick={(task: Task) => {
              setSelectedTask(task);
              setIsTaskDrawerOpen(true);
            }}
            onStatusChange={handleUpdateStatus}
            onAddTask={(initialStatus: TaskStatus) => {
              setTaskModalInitialStatus(initialStatus);
              setIsTaskModalOpen(true);
            }}
            canCreateTask={allowCreateTask}
          />
        </div>
      )}

      {/* Tab 3: Team Members */}
      {activeTab === 'members' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Project Roster</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Collaborators assigned to project tasks and delivery.
              </p>
            </div>
            {allowManageMembers && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setIsMembersModalOpen(true)}
              >
                Manage Members
              </Button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {project.members?.map(m => (
              <div
                key={m.id}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem'
                }}
              >
                <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.85rem' }}>
                  {m.user?.avatar_url ? (
                    <img src={m.user.avatar_url} alt={m.user.full_name} />
                  ) : (
                    getInitials(m.user?.full_name)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.user?.full_name || 'Member'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.user?.email}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 4,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: m.role_in_project === 'lead' ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-surface)',
                      color: m.role_in_project === 'lead' ? 'var(--primary-500)' : 'var(--text-secondary)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {m.role_in_project}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Activity Trail */}
      {activeTab === 'activity' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Project Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No events recorded for this project yet.
              </div>
            ) : (
              activities.map(act => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                    {act.user?.avatar_url ? (
                      <img src={act.user.avatar_url} alt={act.user.full_name} />
                    ) : (
                      getInitials(act.user?.full_name || 'S')
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>
                      <strong>{act.user?.full_name || 'System'}</strong> {act.action.toLowerCase()}{' '}
                      {act.details?.task_title && (
                        <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
                          "{act.details.task_title}"
                        </span>
                      )}
                      {act.details?.new_status && (
                        <span> to <strong>{act.details.new_status.replace('_', ' ')}</strong></span>
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
      )}

      {/* Modals & Drawers */}
      <TaskDetailDrawer
        taskId={selectedTask?.id || null}
        isOpen={isTaskDrawerOpen}
        onClose={() => {
          setIsTaskDrawerOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={loadProjectData}
        onTaskDeleted={loadProjectData}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultProjectId={projectId}
        onSubmit={handleCreateTask}
        initialData={taskModalInitialStatus !== 'todo' ? ({ status: taskModalInitialStatus } as any) : null}
      />

      <ProjectFormModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={handleEditProject}
        initialData={project}
      />

      <ProjectMemberModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={projectId}
        currentMembers={project.members || []}
        canManage={allowManageMembers}
        onAddMember={async (userId: string, role: ProjectMemberRole) => {
          if (!user) return;
          await api.addProjectMember(projectId, userId, role, user);
          await loadProjectData();
        }}
        onRemoveMember={async (userId: string) => {
          if (!user) return;
          await api.removeProjectMember(projectId, userId, user);
          await loadProjectData();
        }}
      />
    </div>
  );
};
