import { UserProfile, Project, Task, ActivityLog, Notification } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'admin@trackforge.io',
    full_name: 'Rahul Sharma',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-pm-1',
    email: 'manager@trackforge.io',
    full_name: 'Elena Rostova',
    role: 'project_manager',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-01-15T09:30:00Z'
  },
  {
    id: 'user-dev-1',
    email: 'sai@trackforge.io',
    full_name: 'Sai Krishna',
    role: 'team_member',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-02-01T10:15:00Z'
  },
  {
    id: 'user-dev-2',
    email: 'sarah@trackforge.io',
    full_name: 'Sarah Jenkins',
    role: 'team_member',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-02-10T11:00:00Z'
  },
  {
    id: 'user-dev-3',
    email: 'alex@trackforge.io',
    full_name: 'Alex Chen',
    role: 'team_member',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-02-15T12:00:00Z'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Next-Gen Cloud Infrastructure',
    description: 'Modernizing Kubernetes cluster orchestration, multi-region database failover, and zero-trust IAM boundaries.',
    owner_id: 'user-pm-1',
    status: 'active',
    priority: 'critical',
    start_date: '2026-08-01',
    deadline: '2026-10-30',
    progress_percentage: 60,
    created_by: 'user-admin-1',
    created_at: '2026-08-01T09:00:00Z',
    members: [
      { id: 'pm-1', project_id: 'proj-1', user_id: 'user-admin-1', role_in_project: 'lead', created_at: '2026-08-01T09:00:00Z', user: INITIAL_USERS[0] },
      { id: 'pm-2', project_id: 'proj-1', user_id: 'user-pm-1', role_in_project: 'lead', created_at: '2026-08-01T09:00:00Z', user: INITIAL_USERS[1] },
      { id: 'pm-3', project_id: 'proj-1', user_id: 'user-dev-1', role_in_project: 'contributor', created_at: '2026-08-02T10:00:00Z', user: INITIAL_USERS[2] },
      { id: 'pm-4', project_id: 'proj-1', user_id: 'user-dev-2', role_in_project: 'contributor', created_at: '2026-08-02T10:00:00Z', user: INITIAL_USERS[3] }
    ]
  },
  {
    id: 'proj-2',
    name: 'Mobile Payment Gateway SDK',
    description: 'High-throughput mobile checkout SDK supporting Apple Pay, Google Pay, and localized instant bank rails.',
    owner_id: 'user-pm-1',
    status: 'planning',
    priority: 'high',
    start_date: '2026-09-01',
    deadline: '2026-11-15',
    progress_percentage: 25,
    created_by: 'user-pm-1',
    created_at: '2026-09-01T10:00:00Z',
    members: [
      { id: 'pm-5', project_id: 'proj-2', user_id: 'user-pm-1', role_in_project: 'lead', created_at: '2026-09-01T10:00:00Z', user: INITIAL_USERS[1] },
      { id: 'pm-6', project_id: 'proj-2', user_id: 'user-dev-1', role_in_project: 'contributor', created_at: '2026-09-02T10:00:00Z', user: INITIAL_USERS[2] },
      { id: 'pm-7', project_id: 'proj-2', user_id: 'user-dev-3', role_in_project: 'contributor', created_at: '2026-09-02T10:00:00Z', user: INITIAL_USERS[4] }
    ]
  },
  {
    id: 'proj-3',
    name: 'Design System 2.0 & Brand Refresh',
    description: 'Unifying cross-platform token architecture, accessibility WCAG AAA compliance, and dark mode foundations.',
    owner_id: 'user-admin-1',
    status: 'completed',
    priority: 'medium',
    start_date: '2026-06-01',
    deadline: '2026-08-20',
    progress_percentage: 100,
    created_by: 'user-admin-1',
    created_at: '2026-06-01T08:30:00Z',
    members: [
      { id: 'pm-8', project_id: 'proj-3', user_id: 'user-admin-1', role_in_project: 'lead', created_at: '2026-06-01T08:30:00Z', user: INITIAL_USERS[0] },
      { id: 'pm-9', project_id: 'proj-3', user_id: 'user-dev-2', role_in_project: 'contributor', created_at: '2026-06-02T09:00:00Z', user: INITIAL_USERS[3] }
    ]
  },
  {
    id: 'proj-4',
    name: 'Customer Self-Service Portal',
    description: 'Revamping enterprise billing, usage analytics, API token issuance, and organization team management.',
    owner_id: 'user-pm-1',
    status: 'on_hold',
    priority: 'high',
    start_date: '2026-07-15',
    deadline: '2026-12-01',
    progress_percentage: 35,
    created_by: 'user-pm-1',
    created_at: '2026-07-15T11:00:00Z',
    members: [
      { id: 'pm-10', project_id: 'proj-4', user_id: 'user-pm-1', role_in_project: 'lead', created_at: '2026-07-15T11:00:00Z', user: INITIAL_USERS[1] },
      { id: 'pm-11', project_id: 'proj-4', user_id: 'user-dev-3', role_in_project: 'contributor', created_at: '2026-07-16T10:00:00Z', user: INITIAL_USERS[4] }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    title: 'Migrate Postgres Connection Pooling to Supavisor',
    description: 'Audit connection timeouts under peak load and configure dedicated transaction mode pooling for high throughput.',
    assigned_to: 'user-dev-1',
    created_by: 'user-pm-1',
    priority: 'critical',
    status: 'in_progress',
    start_date: '2026-09-15',
    due_date: '2026-09-24',
    progress: 65,
    created_at: '2026-09-15T09:00:00Z',
    assignee: INITIAL_USERS[2],
    creator: INITIAL_USERS[1],
    project: { id: 'proj-1', name: 'Next-Gen Cloud Infrastructure' },
    comments_count: 2,
    attachments_count: 1
  },
  {
    id: 'task-2',
    project_id: 'proj-1',
    title: 'Implement OAuth2 PKCE Flow & Session Persistence',
    description: 'Add client-side silent refresh tokens, state verification, and secure local storage abstraction.',
    assigned_to: 'user-dev-2',
    created_by: 'user-pm-1',
    priority: 'high',
    status: 'todo',
    start_date: '2026-09-20',
    due_date: '2026-09-28',
    progress: 0,
    created_at: '2026-09-18T11:00:00Z',
    assignee: INITIAL_USERS[3],
    creator: INITIAL_USERS[1],
    project: { id: 'proj-1', name: 'Next-Gen Cloud Infrastructure' },
    comments_count: 0,
    attachments_count: 0
  },
  {
    id: 'task-3',
    project_id: 'proj-1',
    title: 'Audit Row-Level Security Policies for Tenant Isolation',
    description: 'Perform penetration test simulation and verify tenant leakage prevention on all queries and storage buckets.',
    assigned_to: 'user-admin-1',
    created_by: 'user-admin-1',
    priority: 'critical',
    status: 'review',
    start_date: '2026-09-10',
    due_date: '2026-09-22',
    progress: 90,
    created_at: '2026-09-10T14:30:00Z',
    assignee: INITIAL_USERS[0],
    creator: INITIAL_USERS[0],
    project: { id: 'proj-1', name: 'Next-Gen Cloud Infrastructure' },
    comments_count: 1,
    attachments_count: 0
  },
  {
    id: 'task-4',
    project_id: 'proj-1',
    title: 'Provision Multi-Region Terraform EKS Clusters',
    description: 'Roll out staging clusters in us-east-1 and eu-central-1 with cross-region VPC peering and mesh routing.',
    assigned_to: 'user-dev-1',
    created_by: 'user-pm-1',
    priority: 'medium',
    status: 'completed',
    start_date: '2026-09-01',
    due_date: '2026-09-14',
    progress: 100,
    created_at: '2026-09-01T08:00:00Z',
    assignee: INITIAL_USERS[2],
    creator: INITIAL_USERS[1],
    project: { id: 'proj-1', name: 'Next-Gen Cloud Infrastructure' },
    comments_count: 0,
    attachments_count: 0
  },
  {
    id: 'task-5',
    project_id: 'proj-1',
    title: 'Partner Webhook Mutual TLS Verification',
    description: 'Blocked waiting on the banking partner to supply updated CA root certificates for sandbox mutual TLS handshakes.',
    assigned_to: 'user-dev-3',
    created_by: 'user-pm-1',
    priority: 'high',
    status: 'blocked',
    start_date: '2026-09-12',
    due_date: '2026-09-26',
    progress: 30,
    created_at: '2026-09-12T16:00:00Z',
    assignee: INITIAL_USERS[4],
    creator: INITIAL_USERS[1],
    project: { id: 'proj-1', name: 'Next-Gen Cloud Infrastructure' },
    comments_count: 1,
    attachments_count: 0
  },
  {
    id: 'task-6',
    project_id: 'proj-2',
    title: 'Apple Pay Web Merchant Validation Endpoint',
    description: 'Construct the session verification backend route using Apple merchant domain certification files.',
    assigned_to: 'user-dev-1',
    created_by: 'user-pm-1',
    priority: 'high',
    status: 'todo',
    start_date: '2026-09-22',
    due_date: '2026-10-05',
    progress: 10,
    created_at: '2026-09-20T10:00:00Z',
    assignee: INITIAL_USERS[2],
    creator: INITIAL_USERS[1],
    project: { id: 'proj-2', name: 'Mobile Payment Gateway SDK' },
    comments_count: 0,
    attachments_count: 0
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    project_id: 'proj-1',
    task_id: 'task-1',
    user_id: 'user-pm-1',
    action: 'Task Assigned',
    details: { task_title: 'Migrate Postgres Connection Pooling', assignee: 'Sai Krishna' },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: INITIAL_USERS[1],
    project_name: 'Next-Gen Cloud Infrastructure',
    task_title: 'Migrate Postgres Connection Pooling'
  },
  {
    id: 'act-2',
    project_id: 'proj-1',
    task_id: 'task-4',
    user_id: 'user-dev-1',
    action: 'Task Completed',
    details: { task_title: 'Provision Multi-Region Terraform EKS Clusters', previous_status: 'in_progress', new_status: 'completed' },
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    user: INITIAL_USERS[2],
    project_name: 'Next-Gen Cloud Infrastructure',
    task_title: 'Provision Multi-Region Terraform EKS Clusters'
  },
  {
    id: 'act-3',
    project_id: 'proj-1',
    task_id: 'task-3',
    user_id: 'user-admin-1',
    action: 'Status Changed',
    details: { task_title: 'Audit Row-Level Security Policies', previous_status: 'in_progress', new_status: 'review' },
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    user: INITIAL_USERS[0],
    project_name: 'Next-Gen Cloud Infrastructure',
    task_title: 'Audit Row-Level Security Policies'
  },
  {
    id: 'act-4',
    project_id: 'proj-1',
    user_id: 'user-admin-1',
    action: 'Project Created',
    details: { project_name: 'Next-Gen Cloud Infrastructure' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    user: INITIAL_USERS[0],
    project_name: 'Next-Gen Cloud Infrastructure'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-dev-1',
    title: 'New Task Assignment',
    message: 'Elena Rostova assigned you to "Migrate Postgres Connection Pooling to Supavisor"',
    type: 'task_assigned',
    link: '/tasks/task-1',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'user-admin-1',
    title: 'Task Ready for Review',
    message: 'The task "Audit Row-Level Security Policies" was moved to Review status',
    type: 'status_changed',
    link: '/tasks/task-3',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'user-dev-1',
    title: 'Upcoming Deadline',
    message: 'Task "Migrate Postgres Connection Pooling" is due in 3 days',
    type: 'deadline_approaching',
    link: '/tasks/task-1',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];
