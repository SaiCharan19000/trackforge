-- ==============================================================================
-- TRACKFORGE COMPLETE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'project_manager', 'team_member')) DEFAULT 'team_member',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived')) DEFAULT 'planning',
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    start_date DATE,
    deadline DATE,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PROJECT MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_in_project TEXT NOT NULL DEFAULT 'contributor' CHECK (role_in_project IN ('lead', 'contributor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

-- 4. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'blocked')) DEFAULT 'todo',
    start_date DATE,
    due_date DATE,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TASK COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TASK ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('task_assigned', 'status_changed', 'deadline_approaching', 'comment_added', 'member_added')),
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR FAST PERFORMANCE & FILTERING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON public.projects(deadline);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_activity_logs_project ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ==============================================================================
-- AUTOMATIC TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 1. Helper function: Get Current User Role
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- 2. Helper function: Check if User is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- 3. Trigger: Automatically calculate Project Progress % when Tasks change
CREATE OR REPLACE FUNCTION public.calculate_project_progress()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_project_id UUID;
  total_count INTEGER;
  completed_count INTEGER;
  new_percentage INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_project_id := OLD.project_id;
  ELSE
    target_project_id := NEW.project_id;
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_count, completed_count
  FROM public.tasks
  WHERE project_id = target_project_id;

  IF total_count = 0 THEN
    new_percentage := 0;
  ELSE
    new_percentage := ROUND((completed_count::FLOAT / total_count::FLOAT) * 100);
  END IF;

  UPDATE public.projects
  SET progress_percentage = new_percentage,
      updated_at = now()
  WHERE id = target_project_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_task_progress_change ON public.tasks;
CREATE TRIGGER trigger_task_progress_change
AFTER INSERT OR UPDATE OF status, project_id OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.calculate_project_progress();

-- 4. Trigger: Handle User Signup (Create profile on auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'team_member'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Active users can read all active profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile (name, avatar), Admins can update any profile (including role, is_active)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- PROJECTS POLICIES
-- ------------------------------------------------------------------------------
-- Admins view all projects. Project Managers and Team members view projects they own or are members of.
CREATE POLICY "Users can view relevant projects"
ON public.projects FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR owner_id = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = projects.id AND user_id = auth.uid()
  )
);

-- Admins and Project Managers can insert projects
CREATE POLICY "Managers and Admins can create projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.get_user_role(auth.uid()) = 'project_manager'
);

-- Admins and project owners/managers can update projects
CREATE POLICY "Owners and Admins can update projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR owner_id = auth.uid()
  OR created_by = auth.uid()
)
WITH CHECK (
  public.is_admin()
  OR owner_id = auth.uid()
  OR created_by = auth.uid()
);

-- Only Admins can delete projects
CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- PROJECT MEMBERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "View project members"
ON public.project_members FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_members.project_id
    AND (
      p.owner_id = auth.uid()
      OR p.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Manage project members"
ON public.project_members FOR ALL
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_members.project_id
    AND (p.owner_id = auth.uid() OR p.created_by = auth.uid())
  )
);

-- ------------------------------------------------------------------------------
-- TASKS POLICIES
-- ------------------------------------------------------------------------------
-- View tasks if admin, project owner, member, or assigned
CREATE POLICY "View tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = tasks.project_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = tasks.project_id AND (owner_id = auth.uid() OR created_by = auth.uid())
  )
);

-- Admins and Project Managers can create tasks
CREATE POLICY "Create tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.get_user_role(auth.uid()) IN ('admin', 'project_manager')
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = tasks.project_id AND (owner_id = auth.uid() OR created_by = auth.uid())
  )
);

-- Admins and PMs can update any field; Assigned members can update status/progress
CREATE POLICY "Update tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = tasks.project_id AND (owner_id = auth.uid() OR created_by = auth.uid())
  )
);

-- Admins and PMs can delete tasks
CREATE POLICY "Delete tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (
  public.is_admin()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = tasks.project_id AND (owner_id = auth.uid() OR created_by = auth.uid())
  )
);

-- ------------------------------------------------------------------------------
-- TASK COMMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "View task comments"
ON public.task_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert task comments"
ON public.task_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own comments or admin"
ON public.task_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- TASK ATTACHMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "View attachments"
ON public.task_attachments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Upload attachments"
ON public.task_attachments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Delete attachments"
ON public.task_attachments FOR DELETE
TO authenticated
USING (auth.uid() = uploaded_by OR public.is_admin());

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users manage their own notifications"
ON public.notifications FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- ACTIVITY LOGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "View activity logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert activity logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ==============================================================================
-- SUPABASE STORAGE BUCKET FOR ATTACHMENTS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/zip', 'text/plain', 'text/csv', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload task files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Anyone authenticated can view task files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-attachments');
