# TrackForge | Production Project Management & Operations SaaS

**TrackForge** is an enterprise-grade, multi-user project management and project tracking SaaS application built with **React**, **Vite**, **TypeScript**, **Modern Vanilla CSS design system**, and **Supabase** (PostgreSQL with Row Level Security, Supabase Auth, and Storage).

Designed as a real, usable SaaS platform with complete role-based authorization, responsive layouts, dark/light theme switching, and real-time activity logs.

---

## Features

- 🔐 **Multi-User Role-Based Access Control (RBAC)**:
  - **Admin**: User directory management (activation/deactivation, role assignment), organization dashboard, audit logs, project deletion.
  - **Project Manager**: Project creation & lifecycle management, member assignment, task management, deadlines, analytics.
  - **Team Member**: Assigned project and task views, status progression, comments, and file attachments.
- 📊 **Telemetry Dashboard**:
  - Live metric summary cards (Total, Active, Completed projects, Pending, Overdue, and Completed tasks).
  - SVG Circular Task Completion Gauge & distribution chart.
  - Urgency indicator with upcoming deadlines and overdue alerts.
  - Chronological Recent Activity feed.
- 📁 **Project Management**:
  - Filter by project status (`Planning`, `Active`, `On Hold`, `Completed`, `Archived`).
  - Filter by priority (`Low`, `Medium`, `High`, `Critical`).
  - Search by project title or description.
  - Automated project progress percentage calculation from task completions.
  - Project Team Member roster with lead/contributor/viewer roles.
- 📋 **5-Column Kanban Board**:
  - Columns: `TODO`, `IN PROGRESS`, `REVIEW`, `COMPLETED`, `BLOCKED`.
  - Native HTML5 Drag-and-Drop + quick touch-friendly status controls.
  - Filter by specific project or view organization-wide workflow.
- 💬 **Task Detail Drawer & Collaboration**:
  - Threaded discussion comments with timestamp and user attributions.
  - Secure file attachment uploader (size up to 10MB, type restrictions: images, PDF, ZIP, TXT, CSV, JSON).
  - Instant status and priority reassignments.
- 🔔 **Real-Time Notification System**:
  - Navbar notification bell with unread badge counter.
  - Interactive dropdown with "Mark all read" and direct links to tasks.
- 🌓 **Modern Design System**:
  - Custom Vanilla CSS tokens and sleek glassmorphism.
  - Persistent Light / Dark theme toggle.
  - Fully responsive on Desktop, Tablet, and Mobile devices (collapsible sidebar drawer).
- ⚡ **Dual-Engine Architecture**:
  - Connects directly to **Supabase** when credentials are provided in `.env`.
  - Automatically operates with an instant in-memory & `localStorage` **Demo Engine** (pre-seeded with 3 roles, projects, tasks, and audit logs) if unconfigured, allowing immediate showcase and testing without prior setup.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite 6 |
| **Styling** | Modern Vanilla CSS (Tokens, Custom Properties, Glassmorphism) |
| **Icons** | Lucide React |
| **Database & Auth** | Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security) |
| **Storage** | Supabase Storage (`task-attachments` bucket) |
| **Deployment Target** | Vercel / Netlify |

---

## Getting Started Locally

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd tracker
npm install
```

### 3. Environment Setup (Optional for Supabase)
Copy the environment template:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
> **Note**: If you leave `.env` empty or omit it, TrackForge will automatically boot in **Demo Engine Mode** pre-populated with Admin, Project Manager, and Team Member profiles so you can explore all features immediately.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase Database Setup & RLS

When connecting your live Supabase project:

1. Log in to [Supabase Dashboard](https://app.supabase.com) and select or create a project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository and paste its entire contents into the SQL Editor, then click **Run**.
   - This creates all 8 tables (`profiles`, `projects`, `project_members`, `tasks`, `task_comments`, `task_attachments`, `notifications`, `activity_logs`).
   - Enables Row Level Security (RLS) on all tables with strict access policies.
   - Sets up triggers for auto-calculating project progress and user profile creation.
   - Configures the `task-attachments` storage bucket with size and MIME type policies.
4. *(Optional)* Run [`supabase/seed.sql`](./supabase/seed.sql) to populate initial sample projects, tasks, and team members.

---

## Deployment to Vercel

TrackForge is configured for zero-config Vercel deployment:

### Deploy with Vercel CLI:
```bash
npm run build
npx vercel
```

### Deploy via GitHub:
1. Push your repository to GitHub.
2. Import the project in [Vercel Dashboard](https://vercel.com).
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will run `npm run build` and output the production build in `./dist`.

---

## Test Accounts & Roles (Demo Mode)

When running locally or in demo showcase, use these credentials or click the 1-click quick-fill buttons on the login page:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@trackforge.io` | `demo-password-123` | Full access, user role management, deactivation, project deletion, audit log |
| **Project Manager** | `manager@trackforge.io` | `demo-password-123` | Create projects, assign tasks, manage deadlines & project members |
| **Team Member** | `sai@trackforge.io` | `demo-password-123` | View assigned projects & tasks, update task status, add comments, upload files |

---

## Verification & Production Checklist

- [x] Multi-user authentication & session persistence
- [x] Role-based permissions (Admin, Project Manager, Team Member)
- [x] Row Level Security (RLS) database policies
- [x] Project creation, editing, deletion & progress auto-calculation
- [x] 5-column Kanban board (Todo, In Progress, Review, Completed, Blocked)
- [x] Task details drawer with discussions & file attachments
- [x] Real-time notifications bell with unread counters
- [x] Chronological activity logging & audit trail
- [x] Global debounced multi-entity search (projects, tasks, members)
- [x] Light & Dark theme toggle with persistent preference
- [x] Clean TypeScript build (`npm run build`) with zero errors
- [x] Fully responsive layout on mobile, tablet, and desktop
