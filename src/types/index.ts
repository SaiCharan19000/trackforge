export type UserRole = 'admin' | 'project_manager' | 'team_member';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  deadline?: string;
  progress_percentage: number;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  owner?: UserProfile;
  members?: ProjectMember[];
  tasks_count?: number;
  completed_tasks_count?: number;
}

export type ProjectMemberRole = 'lead' | 'contributor' | 'viewer';

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role_in_project: ProjectMemberRole;
  created_at: string;
  user?: UserProfile;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  created_by?: string;
  priority: TaskPriority;
  status: TaskStatus;
  start_date?: string;
  due_date?: string;
  progress: number;
  created_at: string;
  updated_at?: string;
  assignee?: UserProfile;
  creator?: UserProfile;
  project?: {
    id: string;
    name: string;
  };
  comments_count?: number;
  attachments_count?: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: UserProfile;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
  uploader?: UserProfile;
}

export type NotificationType =
  | 'task_assigned'
  | 'status_changed'
  | 'deadline_approaching'
  | 'comment_added'
  | 'member_added';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  project_id?: string;
  task_id?: string;
  user_id?: string;
  action: string;
  details?: Record<string, any>;
  created_at: string;
  user?: UserProfile;
  project_name?: string;
  task_title?: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completedTasks: number;
  overallProgress: number;
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  isDemoMode: boolean;
}
