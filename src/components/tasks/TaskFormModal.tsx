import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Task, TaskPriority, TaskStatus, Project, UserProfile } from '../../types';
import { api } from '../../services/api';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    project_id: string;
    title: string;
    description?: string;
    assigned_to?: string;
    priority: TaskPriority;
    status: TaskStatus;
    due_date?: string;
  }) => Promise<void>;
  defaultProjectId?: string;
  projects?: Project[];
  initialData?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultProjectId,
  projects = [],
  initialData
}) => {
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getUsers().then(setUsers);
      if (initialData) {
        setProjectId(initialData.project_id);
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setAssignedTo(initialData.assigned_to || '');
        setPriority(initialData.priority);
        setStatus(initialData.status);
        setDueDate(initialData.due_date || '');
      } else {
        setProjectId(defaultProjectId || (projects[0]?.id ?? ''));
        setTitle('');
        setDescription('');
        setAssignedTo('');
        setPriority('medium');
        setStatus('todo');
        setDueDate('');
      }
      setError(null);
    }
  }, [isOpen, initialData, defaultProjectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!projectId) {
      setError('Project selection is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        assigned_to: assignedTo || undefined,
        priority,
        status,
        due_date: dueDate || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && (
            <div style={{ padding: '0.65rem 1rem', marginBottom: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}

          {/* Project Selector (if not locked by context) */}
          {!defaultProjectId && projects.length > 0 && (
            <div className="form-group">
              <label className="form-label" htmlFor="task-proj">Project *</label>
              <select
                id="task-proj"
                className="form-select"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Task Title *</label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Implement OAuth2 PKCE Flow"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className="form-textarea"
              placeholder="Detailed description, acceptance criteria, or technical details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">Assignee</label>
              <select
                id="task-assignee"
                className="form-select"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
