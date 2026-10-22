import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskComment, TaskAttachment, TaskStatus, TaskPriority, UserProfile } from '../../types';
import { api } from '../../services/api';
import { uploadTaskAttachment, validateFile } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatDate, formatRelativeTime, formatFileSize, getInitials } from '../../utils/formatters';
import { canDeleteTask, canUpdateTaskStatus } from '../../utils/permissions';
import {
  Calendar,
  Clock,
  User,
  Send,
  UploadCloud,
  File,
  Trash2,
  Paperclip,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface TaskDetailDrawerProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (updated: Task) => void;
  onTaskDeleted?: (id: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted
}) => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true);
      Promise.all([
        api.getTasks().then(tasks => tasks.find(t => t.id === taskId) || null),
        api.getTaskComments(taskId),
        api.getTaskAttachments(taskId),
        api.getUsers()
      ]).then(([t, comms, atts, users]) => {
        setTask(t);
        setComments(comms);
        setAttachments(atts);
        setAllUsers(users);
        setLoading(false);
      });
    }
  }, [isOpen, taskId]);

  if (!isOpen || !task) return null;

  const isAssignee = task.assigned_to === user?.id;
  const isCreator = task.created_by === user?.id;
  const canUpdate = canUpdateTaskStatus(user?.role, isAssignee);
  const canDelete = canDeleteTask(user?.role, isCreator);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!user) return;
    try {
      const updated = await api.updateTask(task.id, { status: newStatus }, user);
      setTask(updated);
      onTaskUpdated && onTaskUpdated(updated);
      addToast({ type: 'info', title: 'Status Updated', message: `Moved to ${newStatus.replace('_', ' ')}` });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update status' });
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    if (!user) return;
    try {
      const updated = await api.updateTask(task.id, { assigned_to: newAssigneeId || undefined }, user);
      setTask(updated);
      onTaskUpdated && onTaskUpdated(updated);
      addToast({ type: 'success', title: 'Assignee Changed', message: 'Task assigned.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to reassign task' });
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!user) return;
    try {
      const updated = await api.updateTask(task.id, { priority: newPriority }, user);
      setTask(updated);
      onTaskUpdated && onTaskUpdated(updated);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update priority' });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmittingComment(true);
    try {
      const created = await api.addTaskComment(task.id, newComment.trim(), user);
      setComments(prev => [...prev, created]);
      setNewComment('');
      // update comments count locally
      const updatedTask = { ...task, comments_count: (task.comments_count || 0) + 1 };
      setTask(updatedTask);
      onTaskUpdated && onTaskUpdated(updatedTask);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to post comment' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      addToast({ type: 'error', title: 'File Upload Error', message: validation.error });
      return;
    }

    setUploading(true);
    try {
      const uploadedMeta = await uploadTaskAttachment(task.id, file, user.id);
      const newAtt = await api.addTaskAttachment(task.id, uploadedMeta, user);
      setAttachments(prev => [newAtt, ...prev]);
      const updatedTask = { ...task, attachments_count: (task.attachments_count || 0) + 1 };
      setTask(updatedTask);
      onTaskUpdated && onTaskUpdated(updatedTask);
      addToast({ type: 'success', title: 'File Attached', message: file.name });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message || 'File could not be uploaded.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!user || !window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(task.id, user);
      onTaskDeleted && onTaskDeleted(task.id);
      onClose();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete task' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.project?.name || 'Task Details'} maxWidth="700px">
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Task Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{task.title}</h2>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: 'var(--accent-rose)' }}
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* Task Properties Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {/* Status */}
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Status
            </span>
            {canUpdate ? (
              <select
                className="form-select"
                style={{ height: 32, fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                value={task.status}
                onChange={e => handleStatusChange(e.target.value as TaskStatus)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            ) : (
              <Badge value={task.status} />
            )}
          </div>

          {/* Priority */}
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Priority
            </span>
            {user?.role === 'admin' || user?.role === 'project_manager' ? (
              <select
                className="form-select"
                style={{ height: 32, fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                value={task.priority}
                onChange={e => handlePriorityChange(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <Badge value={task.priority} />
            )}
          </div>

          {/* Assignee */}
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Assignee
            </span>
            {user?.role === 'admin' || user?.role === 'project_manager' ? (
              <select
                className="form-select"
                style={{ height: 32, fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                value={task.assigned_to || ''}
                onChange={e => handleAssigneeChange(e.target.value)}
              >
                <option value="">Unassigned</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>
                  {task.assignee?.avatar_url ? (
                    <img src={task.assignee.avatar_url} alt={task.assignee.full_name} />
                  ) : (
                    getInitials(task.assignee?.full_name || 'U')
                  )}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  {task.assignee?.full_name || 'Unassigned'}
                </span>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Due Date
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', fontWeight: 600 }}>
              <Calendar size={13} color="var(--primary-500)" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Paperclip size={16} color="var(--primary-500)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                Attachments ({attachments.length})
              </h4>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                variant="secondary"
                size="sm"
                icon={<UploadCloud size={14} />}
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
              >
                Upload File
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {attachments.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                No attachments uploaded. Permitted: Images, PDF, ZIP, TXT, CSV (Max 10MB).
              </div>
            ) : (
              attachments.map(att => (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    <File size={16} color="var(--primary-500)" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.file_name}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {formatFileSize(att.file_size)} • by {att.uploader?.full_name || 'Member'}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatRelativeTime(att.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Discussion / Comments Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <MessageSquare size={16} color="var(--primary-500)" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              Discussion ({comments.length})
            </h4>
          </div>

          {/* Comment input form */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Write a comment or update..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              style={{ fontSize: '0.8125rem' }}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<Send size={14} />}
              loading={submittingComment}
              disabled={!newComment.trim()}
            >
              Post
            </Button>
          </form>

          {/* Comments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 250, overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                    {c.user?.avatar_url ? (
                      <img src={c.user.avatar_url} alt={c.user.full_name} />
                    ) : (
                      getInitials(c.user?.full_name)
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {c.user?.full_name || 'Member'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {formatRelativeTime(c.created_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
