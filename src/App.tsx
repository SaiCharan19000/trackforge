import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingState } from './components/common/LoadingState';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { KanbanPage } from './pages/KanbanPage';
import { ActivityPage } from './pages/ActivityPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync browser navigation (Back/Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState message="Initializing TrackForge security & workspace..." rows={2} />
      </div>
    );
  }

  // If user is not authenticated, render Auth routes only
  if (!user) {
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage onNavigate={navigate} />;
    }
    return <LoginPage onNavigate={navigate} />;
  }

  // Parse project detail route: /projects/:id
  const projectDetailMatch = currentPath.match(/^\/projects\/([a-zA-Z0-9_-]+)/);
  const searchParams = new URLSearchParams(window.location.search);
  const taskQuery = searchParams.get('task');

  const renderPage = () => {
    if (currentPath === '/' || currentPath === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/projects') {
      return <ProjectsPage onNavigate={navigate} />;
    }
    if (projectDetailMatch) {
      return (
        <ProjectDetailPage
          projectId={projectDetailMatch[1]}
          onNavigate={navigate}
          initialTaskId={taskQuery}
        />
      );
    }
    if (currentPath === '/kanban') {
      return <KanbanPage />;
    }
    if (currentPath === '/activity') {
      return <ActivityPage />;
    }
    if (currentPath === '/admin') {
      return <AdminPage onNavigate={navigate} />;
    }
    if (currentPath === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }
    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <AppLayout currentPath={currentPath} onNavigate={navigate}>
      {renderPage()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProviderWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
}

// Wrapper to feed active user ID into NotificationProvider
const NotificationProviderWrapper: React.FC = () => {
  const { user } = useAuth();
  return (
    <NotificationProvider currentUserId={user?.id}>
      <AppContent />
    </NotificationProvider>
  );
};
