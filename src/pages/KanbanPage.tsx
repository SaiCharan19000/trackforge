import React, { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { canCreateTask } from '../utils/permissions';
import { Task, TaskStatus } from '../types';
import { Plus, Filter } from 'lucide-react';

export const KanbanPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialStatus, setCreateModalInitialStatus] = useState<TaskStatus>('todo');

  const { projects } = useProjects();
  const taskFilter = useMemo(() => {
    return selectedProjectId !== 'all' ? { projectId: selectedProjectId } : undefined;
  }, [selectedProjectId]);

  const { tasks, loading, updateTaskStatus, createTask, refreshTasks } = useTasks(taskFilter);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!user) return;
    await updateTaskStatus(taskId, status, user);
  };

  const handleCreateTask = async (data: any) => {
    if (!user) return;
    await createTask(data, user);
    refreshTasks();
  };

  const allowCreate = canCreateTask(user?.role);

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
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Tasks & Kanban Board</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Visualize task workflows, drag to adjust statuses, and manage deadlines in real time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Project Filter Selector */}
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

          {allowCreate && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setCreateModalInitialStatus('todo');
                setIsCreateModalOpen(true);
              }}
            >
              Create Task
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading task board..." rows={4} />
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskClick={task => {
            setSelectedTask(task);
            setIsDrawerOpen(true);
          }}
          onStatusChange={handleStatusChange}
          onAddTask={status => {
            setCreateModalInitialStatus(status);
            setIsCreateModalOpen(true);
          }}
          canCreateTask={allowCreate}
        />
      )}

      {/* Task Drawer */}
      <TaskDetailDrawer
        taskId={selectedTask?.id || null}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={() => refreshTasks()}
        onTaskDeleted={() => refreshTasks()}
      />

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projects={projects}
        defaultProjectId={selectedProjectId !== 'all' ? selectedProjectId : undefined}
        onSubmit={handleCreateTask}
        initialData={createModalInitialStatus !== 'todo' ? ({ status: createModalInitialStatus } as any) : null}
      />
    </div>
  );
};
