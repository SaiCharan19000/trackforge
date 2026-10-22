import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserProfile, UserRole } from '../types';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { SystemAuditLog } from '../components/admin/SystemAuditLog';
import { StatCard } from '../components/dashboard/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import { useNotification } from '../context/NotificationContext';
import { ShieldCheck, Users, ShieldAlert, Database, Server } from 'lucide-react';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, isDemoMode } = useAuth();
  const { addToast } = useNotification();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Guard: if user is not admin, deny access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      addToast({ type: 'error', title: 'Unauthorized', message: 'Admin privileges required to access this console.' });
      onNavigate('/');
    }
  }, [user, onNavigate, addToast]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return null;
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!user) return;
    await api.updateUserRole(userId, newRole, user);
    await loadUsers();
    addToast({ type: 'success', title: 'Role Updated', message: `User role changed to ${newRole.replace('_', ' ')}.` });
  };

  const handleToggleStatus = async (userId: string, newStatus: boolean) => {
    if (!user) return;
    await api.toggleUserStatus(userId, newStatus, user);
    await loadUsers();
    addToast({
      type: newStatus ? 'success' : 'warning',
      title: 'Status Updated',
      message: `User account has been ${newStatus ? 'activated' : 'deactivated'}.`
    });
  };

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalPMs = users.filter(u => u.role === 'project_manager').length;
  const totalMembers = users.filter(u => u.role === 'team_member').length;
  const activeUsers = users.filter(u => u.is_active).length;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <ShieldCheck size={26} color="var(--accent-rose)" />
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Admin Console</h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage user identity, authorization roles, system integrity, and security policies.
        </p>
      </div>

      {/* Stats Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.1rem',
          marginBottom: '1.75rem'
        }}
      >
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle={`${activeUsers} active accounts`}
          icon={<Users size={20} />}
          accentColor="var(--primary-500)"
        />
        <StatCard
          title="Project Managers"
          value={totalPMs}
          subtitle="Authorized to create & lead"
          icon={<Server size={20} />}
          accentColor="var(--accent-cyan)"
        />
        <StatCard
          title="System Admins"
          value={totalAdmins}
          subtitle="Full access control"
          icon={<ShieldAlert size={20} />}
          accentColor="var(--accent-rose)"
        />
        <StatCard
          title="Database Mode"
          value={isDemoMode ? 'Demo Engine' : 'Live Supabase'}
          subtitle={isDemoMode ? 'In-memory + LocalStorage' : 'PostgreSQL with RLS'}
          icon={<Database size={20} />}
          accentColor="var(--accent-emerald)"
        />
      </div>

      {/* User Management Table */}
      {loading ? (
        <LoadingState message="Loading directory..." rows={3} />
      ) : (
        <UserManagementTable
          users={users}
          currentAdminId={user.id}
          onRoleChange={handleRoleChange}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Audit Log Trail */}
      <SystemAuditLog />
    </div>
  );
};
