import {
  Project,
  Task,
  UserProfile,
  ActivityLog,
  Notification,
  TaskComment,
  TaskAttachment,
  DashboardMetrics,
  UserRole,
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskPriority
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS
} from './mockData';

// Local storage keys for Demo Mode persistence
const STORAGE_KEYS = {
  PROJECTS: 'trackforge_demo_projects',
  TASKS: 'trackforge_demo_tasks',
  USERS: 'trackforge_demo_users',
  ACTIVITIES: 'trackforge_demo_activities',
  NOTIFICATIONS: 'trackforge_demo_notifications',
  COMMENTS: 'trackforge_demo_comments',
  ATTACHMENTS: 'trackforge_demo_attachments'
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// In-memory demo state initialized from localStorage
let demoUsers: UserProfile[] = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
let demoProjects: Project[] = loadStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
let demoTasks: Task[] = loadStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
let demoActivities: ActivityLog[] = loadStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
let demoNotifications: Notification[] = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
let demoComments: TaskComment[] = loadStorage(STORAGE_KEYS.COMMENTS, [
  {
    id: 'comm-1',
    task_id: 'task-1',
    user_id: 'user-pm-1',
    content: 'Please ensure we benchmark latency with 500 concurrent connections before switching production traffic.',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user: INITIAL_USERS[1]
  },
  {
    id: 'comm-2',
    task_id: 'task-1',
    user_id: 'user-dev-1',
    content: 'Tested with k6 benchmark suite. Average query latency dropped from 42ms to 9ms under 1k load!',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: INITIAL_USERS[2]
  }
]);
let demoAttachments: TaskAttachment[] = loadStorage(STORAGE_KEYS.ATTACHMENTS, [
  {
    id: 'att-1',
    task_id: 'task-1',
    file_name: 'supavisor-k6-benchmark-results.json',
    file_size: 42800,
    file_type: 'application/json',
    file_path: 'mock/benchmark.json',
    uploaded_by: 'user-dev-1',
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    uploader: INITIAL_USERS[2]
  }
]);

// Helper: auto recalculate project progress percentage
function updateProjectProgress(projectId: string) {
  const projectTasks = demoTasks.filter(t => t.project_id === projectId);
  const total = projectTasks.length;
  const completed = projectTasks.filter(t => t.status === 'completed').length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  demoProjects = demoProjects.map(p =>
    p.id === projectId ? { ...p, progress_percentage: percentage, updated_at: new Date().toISOString() } : p
  );
  saveStorage(STORAGE_KEYS.PROJECTS, demoProjects);
}

// Helper: log activity
export function recordActivity(
  action: string,
  user: UserProfile,
  projectId?: string,
  taskId?: string,
  details: Record<string, any> = {}
) {
  const proj = demoProjects.find(p => p.id === projectId);
  const task = demoTasks.find(t => t.id === taskId);

  const newLog: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    project_id: projectId,
    task_id: taskId,
    user_id: user.id,
    action,
    details,
    created_at: new Date().toISOString(),
    user,
    project_name: proj?.name,
    task_title: task?.title
  };

  demoActivities = [newLog, ...demoActivities];
  saveStorage(STORAGE_KEYS.ACTIVITIES, demoActivities);

  if (isSupabaseConfigured) {
    supabase.from('activity_logs').insert({
      project_id: projectId,
      task_id: taskId,
      user_id: user.id,
      action,
      details
    }).then();
  }
}

// ==============================================================================
// API INTERFACES
// ==============================================================================

export const api = {
  // ----------------------------------------------------------------------------
  // PROJECTS
  // ----------------------------------------------------------------------------
  async getProjects(filter?: { status?: string; priority?: string; search?: string }): Promise<Project[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('projects').select(`
          *,
          owner:profiles!projects_owner_id_fkey(*),
          members:project_members(*, user:profiles(*))
        `).order('created_at', { ascending: false });

        if (filter?.status && filter.status !== 'all') {
          query = query.eq('status', filter.status);
        }
        if (filter?.priority && filter.priority !== 'all') {
          query = query.eq('priority', filter.priority);
        }
        if (filter?.search) {
          query = query.ilike('name', `%${filter.search}%`);
        }

        const { data, error } = await query;
        if (!error && data) return data as Project[];
      } catch (e) {
        console.warn('Supabase projects query failed, falling back to local engine:', e);
      }
    }

    // Demo Fallback
    let result = [...demoProjects];
    if (filter?.status && filter.status !== 'all') {
      result = result.filter(p => p.status === filter.status);
    }
    if (filter?.priority && filter.priority !== 'all') {
      result = result.filter(p => p.priority === filter.priority);
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }
    return result;
  },

  async getProjectById(id: string): Promise<Project | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('projects').select(`
          *,
          owner:profiles!projects_owner_id_fkey(*),
          members:project_members(*, user:profiles(*))
        `).eq('id', id).single();
        if (!error && data) return data as Project;
      } catch (e) {
        console.warn('Supabase getProjectById failed:', e);
      }
    }
    return demoProjects.find(p => p.id === id) || null;
  },

  async createProject(
    data: { name: string; description?: string; priority: ProjectPriority; status: ProjectStatus; deadline?: string },
    user: UserProfile
  ): Promise<Project> {
    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase.from('projects').insert({
        name: data.name,
        description: data.description,
        priority: data.priority,
        status: data.status,
        deadline: data.deadline,
        owner_id: user.id,
        created_by: user.id,
        progress_percentage: 0
      }).select().single();

      if (error) throw new Error(error.message);

      // Add creator as lead member
      await supabase.from('project_members').insert({
        project_id: created.id,
        user_id: user.id,
        role_in_project: 'lead'
      });

      recordActivity('Project Created', user, created.id, undefined, { project_name: created.name });
      return created;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name,
      description: data.description,
      owner_id: user.id,
      status: data.status,
      priority: data.priority,
      start_date: new Date().toISOString().split('T')[0],
      deadline: data.deadline,
      progress_percentage: 0,
      created_by: user.id,
      created_at: new Date().toISOString(),
      owner: user,
      members: [
        {
          id: `pm-${Date.now()}`,
          project_id: `proj-${Date.now()}`,
          user_id: user.id,
          role_in_project: 'lead',
          created_at: new Date().toISOString(),
          user
        }
      ]
    };

    demoProjects = [newProject, ...demoProjects];
    saveStorage(STORAGE_KEYS.PROJECTS, demoProjects);
    recordActivity('Project Created', user, newProject.id, undefined, { project_name: newProject.name });
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>, user: UserProfile): Promise<Project> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      recordActivity('Project Updated', user, id, undefined, updates);
      return data as Project;
    }

    demoProjects = demoProjects.map(p => {
      if (p.id === id) {
        return { ...p, ...updates, updated_at: new Date().toISOString() };
      }
      return p;
    });
    saveStorage(STORAGE_KEYS.PROJECTS, demoProjects);
    recordActivity('Project Updated', user, id, undefined, updates);
    return demoProjects.find(p => p.id === id)!;
  },

  async deleteProject(id: string, user: UserProfile): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw new Error(error.message);
      recordActivity('Project Deleted', user, id);
      return;
    }

    const proj = demoProjects.find(p => p.id === id);
    demoProjects = demoProjects.filter(p => p.id !== id);
    demoTasks = demoTasks.filter(t => t.project_id !== id);
    saveStorage(STORAGE_KEYS.PROJECTS, demoProjects);
    saveStorage(STORAGE_KEYS.TASKS, demoTasks);
    recordActivity('Project Deleted', user, id, undefined, { project_name: proj?.name });
  },

  async addProjectMember(projectId: string, userId: string, role: 'lead' | 'contributor' | 'viewer', actor: UserProfile): Promise<void> {
    const targetUser = demoUsers.find(u => u.id === userId);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('project_members').insert({
        project_id: projectId,
        user_id: userId,
        role_in_project: role
      });
      if (error) throw new Error(error.message);
    } else {
      demoProjects = demoProjects.map(p => {
        if (p.id === projectId) {
          const members = p.members || [];
          if (!members.some(m => m.user_id === userId)) {
            members.push({
              id: `pm-${Date.now()}`,
              project_id: projectId,
              user_id: userId,
              role_in_project: role,
              created_at: new Date().toISOString(),
              user: targetUser
            });
          }
          return { ...p, members };
        }
        return p;
      });
      saveStorage(STORAGE_KEYS.PROJECTS, demoProjects);
    }

    recordActivity('Member Added', actor, projectId, undefined, { member_name: targetUser?.full_name, role });
  },

  async removeProjectMember(projectId: string, userId: string, actor: UserProfile): Promise<void> {
    const targetUser = demoUsers.find(u => u.id === userId);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('project_members').delete().eq('project_id', projectId).eq('user_id', userId);
      if (error) throw new Error(error.message);
    } else {
      demoProjects = demoProjects.map(p => {
        if (p.id === projectId && p.members) {
          return { ...p, members: p.members.filter(m => m.user_id !== userId) };
        }
        return p;
      });
      saveStorage(STORAGE_KEYS.PROJECTS, demoProjects);
    }

    recordActivity('Member Removed', actor, projectId, undefined, { member_name: targetUser?.full_name });
  },

  // ----------------------------------------------------------------------------
  // TASKS
  // ----------------------------------------------------------------------------
  async getTasks(filter?: { projectId?: string; assignedTo?: string; status?: string; search?: string }): Promise<Task[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('tasks').select(`
          *,
          assignee:profiles!tasks_assigned_to_fkey(*),
          creator:profiles!tasks_created_by_fkey(*),
          project:projects!tasks_project_id_fkey(id, name)
        `).order('created_at', { ascending: false });

        if (filter?.projectId) query = query.eq('project_id', filter.projectId);
        if (filter?.assignedTo) query = query.eq('assigned_to', filter.assignedTo);
        if (filter?.status && filter.status !== 'all') query = query.eq('status', filter.status);
        if (filter?.search) query = query.ilike('title', `%${filter.search}%`);

        const { data, error } = await query;
        if (!error && data) return data as Task[];
      } catch (e) {
        console.warn('Supabase tasks query failed:', e);
      }
    }

    let result = [...demoTasks];
    if (filter?.projectId) result = result.filter(t => t.project_id === filter.projectId);
    if (filter?.assignedTo) result = result.filter(t => t.assigned_to === filter.assignedTo);
    if (filter?.status && filter.status !== 'all') result = result.filter(t => t.status === filter.status);
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s));
    }
    return result;
  },

  async createTask(
    data: {
      project_id: string;
      title: string;
      description?: string;
      assigned_to?: string;
      priority: TaskPriority;
      status: TaskStatus;
      due_date?: string;
    },
    user: UserProfile
  ): Promise<Task> {
    const assignee = demoUsers.find(u => u.id === data.assigned_to);
    const proj = demoProjects.find(p => p.id === data.project_id);

    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase.from('tasks').insert({
        project_id: data.project_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to || null,
        created_by: user.id,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || null,
        progress: data.status === 'completed' ? 100 : 0
      }).select(`*, assignee:profiles!tasks_assigned_to_fkey(*), project:projects!tasks_project_id_fkey(id, name)`).single();

      if (error) throw new Error(error.message);
      recordActivity('Task Created', user, data.project_id, created.id, { task_title: created.title });
      return created;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      assigned_to: data.assigned_to,
      created_by: user.id,
      priority: data.priority,
      status: data.status,
      start_date: new Date().toISOString().split('T')[0],
      due_date: data.due_date,
      progress: data.status === 'completed' ? 100 : 0,
      created_at: new Date().toISOString(),
      assignee,
      creator: user,
      project: proj ? { id: proj.id, name: proj.name } : undefined,
      comments_count: 0,
      attachments_count: 0
    };

    demoTasks = [newTask, ...demoTasks];
    saveStorage(STORAGE_KEYS.TASKS, demoTasks);
    updateProjectProgress(data.project_id);

    recordActivity('Task Created', user, data.project_id, newTask.id, { task_title: newTask.title });

    if (data.assigned_to && data.assigned_to !== user.id) {
      api.createNotification({
        user_id: data.assigned_to,
        title: 'New Task Assigned',
        message: `${user.full_name} assigned you to "${newTask.title}"`,
        type: 'task_assigned',
        link: `/tasks/${newTask.id}`
      });
    }

    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>, user: UserProfile): Promise<Task> {
    const existing = demoTasks.find(t => t.id === id);
    if (!existing) throw new Error('Task not found');

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`*, assignee:profiles!tasks_assigned_to_fkey(*), project:projects!tasks_project_id_fkey(id, name)`)
        .single();
      if (error) throw new Error(error.message);

      if (updates.status && updates.status !== existing.status) {
        recordActivity('Status Changed', user, existing.project_id, id, {
          task_title: existing.title,
          previous_status: existing.status,
          new_status: updates.status
        });
      }
      return data as Task;
    }

    if (updates.assigned_to && updates.assigned_to !== existing.assigned_to) {
      updates.assignee = demoUsers.find(u => u.id === updates.assigned_to);
      recordActivity('Task Assigned', user, existing.project_id, id, {
        task_title: existing.title,
        assignee: updates.assignee?.full_name || 'Unassigned'
      });
    }

    if (updates.status && updates.status !== existing.status) {
      recordActivity('Status Changed', user, existing.project_id, id, {
        task_title: existing.title,
        previous_status: existing.status,
        new_status: updates.status
      });
      if (updates.status === 'completed') {
        updates.progress = 100;
      }
    }

    demoTasks = demoTasks.map(t => {
      if (t.id === id) {
        return { ...t, ...updates, updated_at: new Date().toISOString() };
      }
      return t;
    });

    saveStorage(STORAGE_KEYS.TASKS, demoTasks);
    updateProjectProgress(existing.project_id);

    return demoTasks.find(t => t.id === id)!;
  },

  async deleteTask(id: string, user: UserProfile): Promise<void> {
    const existing = demoTasks.find(t => t.id === id);
    if (!existing) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw new Error(error.message);
      recordActivity('Task Deleted', user, existing.project_id, undefined, { task_title: existing.title });
      return;
    }

    demoTasks = demoTasks.filter(t => t.id !== id);
    saveStorage(STORAGE_KEYS.TASKS, demoTasks);
    updateProjectProgress(existing.project_id);
    recordActivity('Task Deleted', user, existing.project_id, undefined, { task_title: existing.title });
  },

  // ----------------------------------------------------------------------------
  // COMMENTS
  // ----------------------------------------------------------------------------
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('task_comments')
        .select('*, user:profiles(*)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      if (data) return data;
    }
    return demoComments.filter(c => c.task_id === taskId);
  },

  async addTaskComment(taskId: string, content: string, user: UserProfile): Promise<TaskComment> {
    const task = demoTasks.find(t => t.id === taskId);
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('task_comments').insert({
        task_id: taskId,
        user_id: user.id,
        content
      }).select('*, user:profiles(*)').single();
      if (error) throw new Error(error.message);
      recordActivity('Comment Added', user, task?.project_id, taskId, { task_title: task?.title });
      return data;
    }

    const newComment: TaskComment = {
      id: `comm-${Date.now()}`,
      task_id: taskId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
      user
    };
    demoComments.push(newComment);
    saveStorage(STORAGE_KEYS.COMMENTS, demoComments);

    demoTasks = demoTasks.map(t =>
      t.id === taskId ? { ...t, comments_count: (t.comments_count || 0) + 1 } : t
    );
    saveStorage(STORAGE_KEYS.TASKS, demoTasks);

    recordActivity('Comment Added', user, task?.project_id, taskId, { task_title: task?.title });
    return newComment;
  },

  // ----------------------------------------------------------------------------
  // ATTACHMENTS
  // ----------------------------------------------------------------------------
  async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('task_attachments')
        .select('*, uploader:profiles(*)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      if (data) return data;
    }
    return demoAttachments.filter(a => a.task_id === taskId);
  },

  async addTaskAttachment(
    taskId: string,
    fileMeta: { name: string; size: number; type: string; path: string },
    user: UserProfile
  ): Promise<TaskAttachment> {
    const task = demoTasks.find(t => t.id === taskId);
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('task_attachments').insert({
        task_id: taskId,
        file_name: fileMeta.name,
        file_size: fileMeta.size,
        file_type: fileMeta.type,
        file_path: fileMeta.path,
        uploaded_by: user.id
      }).select('*, uploader:profiles(*)').single();
      if (error) throw new Error(error.message);
      recordActivity('File Uploaded', user, task?.project_id, taskId, { file_name: fileMeta.name });
      return data;
    }

    const newAttachment: TaskAttachment = {
      id: `att-${Date.now()}`,
      task_id: taskId,
      file_name: fileMeta.name,
      file_size: fileMeta.size,
      file_type: fileMeta.type,
      file_path: fileMeta.path,
      uploaded_by: user.id,
      created_at: new Date().toISOString(),
      uploader: user
    };
    demoAttachments.push(newAttachment);
    saveStorage(STORAGE_KEYS.ATTACHMENTS, demoAttachments);

    demoTasks = demoTasks.map(t =>
      t.id === taskId ? { ...t, attachments_count: (t.attachments_count || 0) + 1 } : t
    );
    saveStorage(STORAGE_KEYS.TASKS, demoTasks);

    recordActivity('File Uploaded', user, task?.project_id, taskId, { file_name: fileMeta.name });
    return newAttachment;
  },

  // ----------------------------------------------------------------------------
  // ACTIVITIES & AUDIT LOGS
  // ----------------------------------------------------------------------------
  async getActivities(projectId?: string, limit = 50): Promise<ActivityLog[]> {
    if (isSupabaseConfigured) {
      let q = supabase.from('activity_logs').select('*, user:profiles(*)').order('created_at', { ascending: false }).limit(limit);
      if (projectId) q = q.eq('project_id', projectId);
      const { data } = await q;
      if (data) return data;
    }

    if (projectId) {
      return demoActivities.filter(a => a.project_id === projectId).slice(0, limit);
    }
    return demoActivities.slice(0, limit);
  },

  // ----------------------------------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------------------------------
  async getNotifications(userId: string): Promise<Notification[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) return data;
    }
    return demoNotifications.filter(n => n.user_id === userId);
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }
    demoNotifications = demoNotifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, demoNotifications);
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    }
    demoNotifications = demoNotifications.map(n => n.user_id === userId ? { ...n, is_read: true } : n);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, demoNotifications);
  },

  async createNotification(notif: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<void> {
    const item: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    demoNotifications = [item, ...demoNotifications];
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, demoNotifications);

    if (isSupabaseConfigured) {
      await supabase.from('notifications').insert(notif);
    }
  },

  // ----------------------------------------------------------------------------
  // USERS / ADMIN
  // ----------------------------------------------------------------------------
  async getUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) return data;
    }
    return demoUsers;
  },

  async createUser(
    data: { full_name: string; email: string; role: UserRole },
    actor: UserProfile
  ): Promise<UserProfile> {
    const existing = demoUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error(`User with email "${data.email}" already exists.`);
    }

    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase.from('profiles').insert({
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        is_active: true
      }).select().single();
      if (error) throw new Error(error.message);
      recordActivity('User Created', actor, undefined, undefined, { user_name: data.full_name, role: data.role });
      return created;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      is_active: true,
      created_at: new Date().toISOString()
    };
    demoUsers = [newUser, ...demoUsers];
    saveStorage(STORAGE_KEYS.USERS, demoUsers);
    recordActivity('User Created', actor, undefined, undefined, { user_name: data.full_name, role: data.role });
    return newUser;
  },

  async updateUserRole(userId: string, role: UserRole, actor: UserProfile): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
      if (error) throw new Error(error.message);
    }
    const target = demoUsers.find(u => u.id === userId);
    demoUsers = demoUsers.map(u => u.id === userId ? { ...u, role } : u);
    saveStorage(STORAGE_KEYS.USERS, demoUsers);
    recordActivity('Role Updated', actor, undefined, undefined, { user_name: target?.full_name, new_role: role });
  },

  async toggleUserStatus(userId: string, isActive: boolean, actor: UserProfile): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId);
      if (error) throw new Error(error.message);
    }
    const target = demoUsers.find(u => u.id === userId);
    demoUsers = demoUsers.map(u => u.id === userId ? { ...u, is_active: isActive } : u);
    saveStorage(STORAGE_KEYS.USERS, demoUsers);
    recordActivity('User Status Changed', actor, undefined, undefined, {
      user_name: target?.full_name,
      status: isActive ? 'activated' : 'deactivated'
    });
  },

  // ----------------------------------------------------------------------------
  // DASHBOARD METRICS
  // ----------------------------------------------------------------------------
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const projects = await api.getProjects();
    const tasks = await api.getTasks();

    const now = new Date();
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    }).length;

    const totalTasks = tasks.length;
    const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalTasks,
      pendingTasks,
      overdueTasks,
      completedTasks,
      overallProgress
    };
  }
};
