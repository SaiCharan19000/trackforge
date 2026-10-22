import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatDate, getInitials } from '../../utils/formatters';
import { Search, Shield, UserCheck, UserX, UserPlus } from 'lucide-react';

interface UserManagementTableProps {
  users: UserProfile[];
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
  onToggleStatus: (userId: string, isActive: boolean) => Promise<void>;
  onAddUser?: (data: { full_name: string; email: string; role: UserRole }) => Promise<void>;
  currentAdminId?: string;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onRoleChange,
  onToggleStatus,
  onAddUser,
  currentAdminId
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('team_member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRole = async (userId: string, newRole: UserRole) => {
    setActionLoading(userId);
    try {
      await onRoleChange(userId, newRole);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      await onToggleStatus(userId, !currentStatus);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setFormError('Please enter both name and email.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (onAddUser) {
        await onAddUser({
          full_name: newName.trim(),
          email: newEmail.trim(),
          role: newRole
        });
      }
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRole('team_member');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>User Management</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Manage team roles, access permissions, and activation states.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onAddUser && (
            <Button
              variant="primary"
              size="sm"
              icon={<UserPlus size={15} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add User
            </Button>
          )}

          <select
            className="form-select"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ width: 'auto', height: 36, fontSize: '0.8125rem' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="project_manager">Project Manager</option>
            <option value="team_member">Team Member</option>
          </select>

          <div style={{ position: 'relative', width: 220 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ height: 36, paddingLeft: '2rem', fontSize: '0.8125rem' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>User</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Joined</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const isSelf = u.id === currentAdminId;
              const isLoading = actionLoading === u.id;

              return (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.full_name} />
                        ) : (
                          getInitials(u.full_name)
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {u.full_name} {isSelf && <span style={{ color: 'var(--primary-500)', fontSize: '0.7rem' }}>(You)</span>}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '0.75rem 1rem' }}>
                    <select
                      className="form-select"
                      value={u.role}
                      disabled={isSelf || isLoading}
                      onChange={e => handleRole(u.id, e.target.value as UserRole)}
                      style={{ height: 30, fontSize: '0.75rem', width: 'auto', padding: '0.1rem 0.5rem' }}
                    >
                      <option value="team_member">Team Member</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        background: u.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: u.is_active ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: u.is_active ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                        }}
                      />
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>

                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {formatDate(u.created_at)}
                  </td>

                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    {!isSelf && (
                      <Button
                        size="sm"
                        variant={u.is_active ? 'danger' : 'secondary'}
                        onClick={() => handleStatus(u.id, u.is_active)}
                        loading={isLoading}
                        icon={u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormError(null);
        }}
        title="Add New User"
        maxWidth="480px"
      >
        <form onSubmit={handleCreateUser}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {formError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--accent-rose)',
                  fontSize: '0.8125rem'
                }}
              >
                {formError}
              </div>
            )}

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                Full Name *
              </label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. John Doe"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                Email Address *
              </label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="e.g. john@trackforge.io"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                System Role *
              </label>
              <select
                className="form-select"
                value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}
              >
                <option value="team_member">Team Member (Contribute to assigned tasks)</option>
                <option value="project_manager">Project Manager (Create & manage projects)</option>
                <option value="admin">System Admin (Full unrestricted control)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setFormError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
