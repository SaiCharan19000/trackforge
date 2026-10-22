import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  Activity,
  ShieldCheck,
  User,
  LogOut,
  X,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { UserRole } from '../../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpen,
  onClose
}) => {
  const { user, logout, switchDemoRole, isDemoMode } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    { path: '/kanban', label: 'Tasks & Kanban', icon: <Kanban size={18} /> },
    { path: '/activity', label: 'Activity Logs', icon: <Activity size={18} /> },
    // Admin only
    ...(user?.role === 'admin'
      ? [{ path: '/admin', label: 'Admin Panel', icon: <ShieldCheck size={18} /> }]
      : []),
    { path: '/profile', label: 'My Profile', icon: <User size={18} /> }
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-box">
              <Layers size={20} />
            </div>
            <span>TrackForge</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--sidebar-subtext)', display: isOpen ? 'flex' : 'none' }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Role Indicator & Demo Switcher */}
        <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sidebar-subtext)' }}>
              Active Role
            </span>
            {user?.role && <Badge value={user.role} />}
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.full_name || 'Guest User'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sidebar-subtext)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>

          {/* Quick Demo Switcher if in Demo Mode */}
          {isDemoMode && (
            <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--primary-300)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Switch Demo Role:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {(['admin', 'project_manager', 'team_member'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => switchDemoRole(r)}
                    style={{
                      flex: 1,
                      padding: '0.2rem 0.3rem',
                      fontSize: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid ' + (user?.role === r ? 'var(--primary-400)' : 'rgba(255,255,255,0.1)'),
                      background: user?.role === r ? 'var(--primary-600)' : 'rgba(255,255,255,0.05)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                    title={`Switch to ${r.replace('_', ' ')}`}
                  >
                    {r === 'project_manager' ? 'PM' : r === 'team_member' ? 'Member' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.path);
                  if (isOpen) onClose();
                }}
                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isDemoMode ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                boxShadow: isDemoMode ? '0 0 6px var(--accent-amber)' : '0 0 6px var(--accent-emerald)'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--sidebar-subtext)' }}>
              {isDemoMode ? 'Demo Mode' : 'Connected to Supabase'}
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--sidebar-subtext)' }}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
