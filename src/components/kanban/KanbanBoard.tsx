import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from '../tasks/TaskCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onAddTask?: (initialStatus: TaskStatus) => void;
  canCreateTask?: boolean;
}

interface ColumnDef {
  status: TaskStatus;
  label: string;
  accent: string;
  badgeBg: string;
}

const COLUMNS: ColumnDef[] = [
  { status: 'todo', label: 'To Do', accent: '#94a3b8', badgeBg: 'rgba(148, 163, 184, 0.15)' },
  { status: 'in_progress', label: 'In Progress', accent: 'var(--primary-500)', badgeBg: 'rgba(79, 70, 229, 0.15)' },
  { status: 'review', label: 'Review', accent: 'var(--accent-purple)', badgeBg: 'rgba(139, 92, 246, 0.15)' },
  { status: 'completed', label: 'Completed', accent: 'var(--accent-emerald)', badgeBg: 'rgba(16, 185, 129, 0.15)' },
  { status: 'blocked', label: 'Blocked', accent: 'var(--accent-rose)', badgeBg: 'rgba(244, 63, 94, 0.15)' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onAddTask,
  canCreateTask = false
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setActiveDropColumn(null);
    setDraggedTaskId(null);

    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== status) {
        onStatusChange(taskId, status);
      }
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        alignItems: 'start',
        overflowX: 'auto',
        paddingBottom: '1rem'
      }}
    >
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        const isTarget = activeDropColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={e => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.status)}
            style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: isTarget
                ? '2px dashed var(--primary-500)'
                : '1px solid var(--border-subtle)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 460,
              transition: 'border-color var(--transition-fast), background var(--transition-fast)'
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                paddingBottom: '0.6rem',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: col.accent
                  }}
                />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {col.label}
                </h4>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    background: col.badgeBg,
                    color: col.accent
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {canCreateTask && onAddTask && (
                <button
                  onClick={() => onAddTask(col.status)}
                  className="btn btn-ghost btn-icon btn-sm"
                  title={`Add task to ${col.label}`}
                  aria-label={`Add task to ${col.label}`}
                >
                  <Plus size={15} />
                </button>
              )}
            </div>

            {/* Task Cards Column Body */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                flex: 1
              }}
            >
              {colTasks.length === 0 ? (
                <div
                  style={{
                    border: '1px dashed var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    margin: 'auto 0'
                  }}
                >
                  Drop tasks here
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onStatusChange={newStatus => onStatusChange(task.id, newStatus)}
                    onDragStart={e => handleDragStart(e, task.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
