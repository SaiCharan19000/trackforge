-- ==============================================================================
-- TRACKFORGE SEED DATA FOR SUPABASE
-- Note: Replace UUIDs with actual auth.users IDs if syncing with real auth users
-- ==============================================================================

-- 1. Create Sample Profiles (UUIDs generated for demo reference)
INSERT INTO public.profiles (id, email, full_name, role, avatar_url, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@trackforge.io', 'Rahul Sharma', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', true),
  ('a0000000-0000-0000-0000-000000000002', 'manager@trackforge.io', 'Elena Rostova', 'project_manager', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', true),
  ('a0000000-0000-0000-0000-000000000003', 'sai@trackforge.io', 'Sai Krishna', 'team_member', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', true),
  ('a0000000-0000-0000-0000-000000000004', 'sarah@trackforge.io', 'Sarah Jenkins', 'team_member', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', true),
  ('a0000000-0000-0000-0000-000000000005', 'alex@trackforge.io', 'Alex Chen', 'team_member', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Sample Projects
INSERT INTO public.projects (id, name, description, owner_id, status, priority, start_date, deadline, progress_percentage, created_by)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Next-Gen Cloud Infrastructure',
    'Modernizing Kubernetes cluster orchestration, multi-region database failover, and zero-trust IAM boundaries.',
    'a0000000-0000-0000-0000-000000000002',
    'active',
    'critical',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '45 days',
    60,
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Mobile Payment Gateway SDK',
    'High-throughput mobile checkout SDK supporting Apple Pay, Google Pay, and localized bank rails.',
    'a0000000-0000-0000-0000-000000000002',
    'planning',
    'high',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '60 days',
    25,
    'a0000000-0000-0000-0000-000000000002'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Design System 2.0 & Brand Guidelines',
    'Unifying cross-platform token architecture, accessibility WCAG AAA compliance, and component library.',
    'a0000000-0000-0000-0000-000000000001',
    'completed',
    'medium',
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '5 days',
    100,
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Customer Self-Service Portal',
    'Revamping enterprise billing, usage analytics, API token issuance, and organization team management.',
    'a0000000-0000-0000-0000-000000000002',
    'on_hold',
    'high',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '90 days',
    35,
    'a0000000-0000-0000-0000-000000000002'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Project Members
INSERT INTO public.project_members (project_id, user_id, role_in_project)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'lead'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'contributor'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'contributor'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'lead'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'contributor'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'contributor')
ON CONFLICT DO NOTHING;

-- 4. Sample Tasks
INSERT INTO public.tasks (id, project_id, title, description, assigned_to, created_by, priority, status, start_date, due_date, progress)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Migrate Postgres Connection Pooling to Supavisor',
    'Audit connection timeouts under peak load and configure dedicated transaction mode pooling.',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'critical',
    'in_progress',
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '2 days',
    60
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Implement OAuth2 PKCE Flow & Session Refresh',
    'Add client-side silent refresh tokens and secure local storage abstraction.',
    'a0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'high',
    'todo',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    0
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'Audit Row-Level Security Policies for Multi-Tenant Isolation',
    'Perform penetration test simulation and verify tenant leakage prevention on all queries.',
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'critical',
    'review',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '1 day',
    90
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'Provision Multi-Region Terraform EKS Clusters',
    'Roll out staging clusters in us-east-1 and eu-central-1 with cross-region mesh.',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'medium',
    'completed',
    CURRENT_DATE - INTERVAL '12 days',
    CURRENT_DATE - INTERVAL '1 day',
    100
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000001',
    'Partner Webhook Mutual TLS Verification',
    'Blocked until the payment clearinghouse provides updated CA root certificates.',
    'a0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000002',
    'high',
    'blocked',
    CURRENT_DATE - INTERVAL '4 days',
    CURRENT_DATE + INTERVAL '5 days',
    30
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Task Comments
INSERT INTO public.task_comments (task_id, user_id, content)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Please ensure we benchmark latency with 500 concurrent connections before switching production traffic.'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Tested with k6 benchmark suite. Average query latency dropped from 42ms to 9ms under 1k load!'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Verified all 8 tables. Added explicit WITH CHECK constraints for project insert.')
ON CONFLICT DO NOTHING;

-- 6. Activity Logs
INSERT INTO public.activity_logs (project_id, task_id, user_id, action, details)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Task Assigned', '{"task_title": "Migrate Postgres Connection Pooling", "assignee": "Sai Krishna"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Task Completed', '{"task_title": "Provision Multi-Region Terraform EKS Clusters", "previous_status": "in_progress", "new_status": "completed"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Status Changed', '{"task_title": "Audit Row-Level Security Policies", "previous_status": "in_progress", "new_status": "review"}'::jsonb)
ON CONFLICT DO NOTHING;

-- 7. Notifications
INSERT INTO public.notifications (user_id, title, message, type, link, is_read)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'New Task Assigned', 'Elena assigned you to "Migrate Postgres Connection Pooling"', 'task_assigned', '/tasks/c0000000-0000-0000-0000-000000000001', false),
  ('a0000000-0000-0000-0000-000000000001', 'Task Ready for Review', 'Rahul, the RLS policy audit has been submitted for your review.', 'status_changed', '/tasks/c0000000-0000-0000-0000-000000000003', false)
ON CONFLICT DO NOTHING;
