import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Project, Task } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { formatDate, getInitials } from '../utils/formatters';
import { User, Mail, Calendar, Shield, Save, CheckCircle2, FolderKanban, ListTodo } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setAvatarUrl(user.avatar_url || '');

      Promise.all([
        api.getProjects(),
        api.getTasks({ assignedTo: user.id })
      ]).then(([projs, tasks]) => {
        // filter projects where user is owner or member
        const userProjects = projs.filter(
          p => p.owner_id === user.id || p.members?.some(m => m.user_id === user.id)
        );
        setAssignedProjects(userProjects);
        setAssignedTasks(tasks);
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || undefined
      });
      addToast({ type: 'success', title: 'Profile Updated', message: 'Your profile changes were saved.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Account Profile</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage your personal details, credentials, and review assigned responsibilities.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Profile Card & Editor */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="avatar" style={{ width: 68, height: 68, fontSize: '1.5rem' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} />
              ) : (
                getInitials(fullName)
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user.full_name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 4 }}>
                <Badge value={user.role} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Active User
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                type="text"
                className="form-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-email">Email Address</label>
              <input
                id="prof-email"
                type="email"
                className="form-input"
                value={user.email}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Email cannot be changed directly. Contact an administrator.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-avatar">Avatar Image URL</label>
              <input
                id="prof-avatar"
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button type="submit" variant="primary" icon={<Save size={15} />} loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Account Metadata & Summary */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Role & Permissions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield size={18} color="var(--primary-500)" />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Role Level</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {user.role === 'admin'
                      ? 'Full System Administrator — All permissions granted'
                      : user.role === 'project_manager'
                      ? 'Project Manager — Create projects, manage tasks, add team members'
                      : 'Team Member — Assigned tasks, status progression, and discussions'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={18} color="var(--accent-cyan)" />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>System Identifier</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {user.id}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={18} color="var(--accent-emerald)" />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Member Since</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {formatDate(user.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-around'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-500)' }}>
                {assignedProjects.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Projects</div>
            </div>
            <div style={{ width: 1, background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                {assignedTasks.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Tasks Section */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <ListTodo size={20} color="var(--primary-500)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Your Assigned Tasks ({assignedTasks.length})
          </h3>
        </div>

        {assignedTasks.length === 0 ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            You currently have no tasks directly assigned to you.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {assignedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => {
                  setSelectedTask(task);
                  setIsTaskDrawerOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <TaskDetailDrawer
        taskId={selectedTask?.id || null}
        isOpen={isTaskDrawerOpen}
        onClose={() => {
          setIsTaskDrawerOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={() => {
          if (user) {
            api.getTasks({ assignedTo: user.id }).then(setAssignedTasks);
          }
        }}
        onTaskDeleted={() => {
          if (user) {
            api.getTasks({ assignedTo: user.id }).then(setAssignedTasks);
          }
        }}
      />
    </div>
  );
};
