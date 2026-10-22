import { UserRole } from '../types';

export function canManageUsers(role?: UserRole): boolean {
  return role === 'admin';
}

export function canCreateProject(role?: UserRole): boolean {
  return role === 'admin' || role === 'project_manager';
}

export function canEditProject(role?: UserRole, isOwner = false): boolean {
  if (role === 'admin') return true;
  if (role === 'project_manager' && isOwner) return true;
  return false;
}

export function canDeleteProject(role?: UserRole): boolean {
  return role === 'admin';
}

export function canManageProjectMembers(role?: UserRole, isOwner = false): boolean {
  if (role === 'admin') return true;
  if (role === 'project_manager' && isOwner) return true;
  return false;
}

export function canCreateTask(role?: UserRole): boolean {
  return role === 'admin' || role === 'project_manager';
}

export function canDeleteTask(role?: UserRole, isCreator = false): boolean {
  if (role === 'admin') return true;
  if (role === 'project_manager') return true;
  return isCreator;
}

export function canUpdateTaskStatus(role?: UserRole, isAssignee = false): boolean {
  // All authenticated users can update status if they are assigned or have manager/admin role
  if (role === 'admin' || role === 'project_manager') return true;
  return isAssignee;
}

export function canUploadAttachments(): boolean {
  return true;
}
