import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardMetrics, Project, Task, ActivityLog } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { ProjectProgressChart } from '../components/dashboard/ProjectProgressChart';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { canCreateProject, canCreateTask } from '../utils/permissions';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, p, t, a] = await Promise.all([
        api.getDashboardMetrics(),
        api.getProjects(),
        api.getTasks(),
        api.getActivities(undefined, 10)
      ]);
      setMetrics(m);
      setProjects(p);
      setTasks(t);
      setActivities(a);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDrawerOpen(true);
  };

  const handleCreateProject = async (data: any) => {
    if (!user) return;
    await api.createProject(data, user);
    await loadData();
  };

  const handleCreateTask = async (data: any) => {
    if (!user) return;
    await api.createTask(data, user);
    await loadData();
  };

  if (loading || !metrics) {
    return <LoadingState message="Loading organization telemetry & progress..." rows={4} />;
  }

  const allowCreateProj = canCreateProject(user?.role);
  const allowCreateTask = canCreateTask(user?.role);

  return (
    <div>
      {/* Top Banner / Welcome */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
            Welcome back, {user?.full_name?.split(' ')[0] || 'Team'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Here is your live project tracking portfolio and operational status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {allowCreateTask && (
            <Button
              variant="secondary"
              icon={<Plus size={16} />}
              onClick={() => setIsTaskModalOpen(true)}
            >
              New Task
            </Button>
          )}
          {allowCreateProj && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsProjectModalOpen(true)}
            >
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.1rem',
          marginBottom: '1.75rem'
        }}
      >
        <StatCard
          title="Total Projects"
          value={metrics.totalProjects}
          subtitle={`${metrics.activeProjects} active in pipeline`}
          icon={<FolderKanban size={20} />}
          accentColor="var(--primary-500)"
        />
        <StatCard
          title="Active Projects"
          value={metrics.activeProjects}
          subtitle={`${metrics.completedProjects} marked completed`}
          icon={<TrendingUp size={20} />}
          accentColor="var(--accent-cyan)"
        />
        <StatCard
          title="Pending Tasks"
          value={metrics.pendingTasks}
          subtitle={`${metrics.totalTasks} total tasks`}
          icon={<Clock size={20} />}
          accentColor="var(--accent-purple)"
        />
        <StatCard
          title="Overdue Tasks"
          value={metrics.overdueTasks}
          subtitle={metrics.overdueTasks > 0 ? 'Requires attention' : 'On schedule'}
          icon={<AlertTriangle size={20} />}
          accentColor="var(--accent-rose)"
          trend={metrics.overdueTasks > 0 ? `${metrics.overdueTasks} Overdue` : undefined}
          trendPositive={false}
        />
        <StatCard
          title="Completed Tasks"
          value={metrics.completedTasks}
          subtitle={`${metrics.overallProgress}% completion rate`}
          icon={<CheckCircle2 size={20} />}
          accentColor="var(--accent-emerald)"
        />
      </div>

      {/* Visual Analytics & Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <ProjectProgressChart metrics={metrics} />
        </div>
        <div>
          <UpcomingDeadlines tasks={tasks} onSelectTask={handleTaskClick} />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <RecentActivityFeed
          activities={activities}
          onViewAll={() => onNavigate('/activity')}
        />
      </div>

      {/* Modals & Drawers */}
      <TaskDetailDrawer
        taskId={selectedTask?.id || null}
        isOpen={isTaskDrawerOpen}
        onClose={() => {
          setIsTaskDrawerOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={loadData}
        onTaskDeleted={loadData}
      />

      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projects={projects}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
