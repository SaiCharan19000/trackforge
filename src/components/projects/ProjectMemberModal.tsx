import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ProjectMember, UserProfile } from '../../types';
import { api } from '../../services/api';
import { getInitials } from '../../utils/formatters';
import { UserPlus, Trash2 } from 'lucide-react';

interface ProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentMembers: ProjectMember[];
  onAddMember: (userId: string, role: 'lead' | 'contributor' | 'viewer') => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  canManage: boolean;
}

export const ProjectMemberModal: React.FC<ProjectMemberModalProps> = ({
  isOpen,
  onClose,
  currentMembers,
  onAddMember,
  onRemoveMember,
  canManage
}) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'lead' | 'contributor' | 'viewer'>('contributor');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getUsers().then(users => {
        setAllUsers(users);
        const existingIds = new Set(currentMembers.map(m => m.user_id));
        const available = users.filter(u => !existingIds.has(u.id));
        if (available.length > 0) setSelectedUserId(available[0].id);
      });
    }
  }, [isOpen, currentMembers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await onAddMember(selectedUserId, selectedRole);
      // reset selected
      const existingIds = new Set([...currentMembers.map(m => m.user_id), selectedUserId]);
      const available = allUsers.filter(u => !existingIds.has(u.id));
      setSelectedUserId(available.length > 0 ? available[0].id : '');
    } finally {
      setLoading(false);
    }
  };

  const existingMemberIds = new Set(currentMembers.map(m => m.user_id));
  const availableUsers = allUsers.filter(u => !existingMemberIds.has(u.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Team Members">
      <div className="modal-body">
        {/* Add Member Form (if permitted) */}
        {canManage && availableUsers.length > 0 && (
          <form onSubmit={handleAdd} style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Add New Member</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">User</label>
                <select
                  className="form-select"
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                >
                  {availableUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Project Role</label>
                <select
                  className="form-select"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as any)}
                >
                  <option value="contributor">Contributor</option>
                  <option value="lead">Lead</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <Button type="submit" variant="primary" icon={<UserPlus size={15} />} loading={loading}>
                Add
              </Button>
            </div>
          </form>
        )}

        {/* Current Members List */}
        <div>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Current Members ({currentMembers.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {currentMembers.map(member => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>
                    {member.user?.avatar_url ? (
                      <img src={member.user.avatar_url} alt={member.user.full_name} />
                    ) : (
                      getInitials(member.user?.full_name)
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {member.user?.full_name || 'Member'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {member.user?.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: member.role_in_project === 'lead' ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-surface)',
                      color: member.role_in_project === 'lead' ? 'var(--primary-500)' : 'var(--text-secondary)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {member.role_in_project}
                  </span>

                  {canManage && (
                    <button
                      onClick={() => onRemoveMember(member.user_id)}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--accent-rose)' }}
                      title="Remove member"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
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
