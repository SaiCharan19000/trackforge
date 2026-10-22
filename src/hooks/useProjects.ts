import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectPriority, ProjectStatus, UserProfile } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export function useProjects(initialFilter?: { status?: string; priority?: string; search?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useNotification();

  const filterKey = JSON.stringify(initialFilter);

  const fetchProjects = useCallback(async (filter?: typeof initialFilter) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilter = filter !== undefined ? filter : (filterKey ? JSON.parse(filterKey) : undefined);
      const data = await api.getProjects(activeFilter);
      setProjects(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load projects');
      addToast({ type: 'error', title: 'Error', message: 'Unable to load projects' });
    } finally {
      setLoading(false);
    }
  }, [filterKey, addToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (
    data: { name: string; description?: string; priority: ProjectPriority; status: ProjectStatus; deadline?: string },
    user: UserProfile
  ) => {
    try {
      const created = await api.createProject(data, user);
      setProjects(prev => [created, ...prev]);
      addToast({ type: 'success', title: 'Success', message: `Project "${created.name}" created!` });
      return created;
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to create project' });
      throw e;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>, user: UserProfile) => {
    try {
      const updated = await api.updateProject(id, updates, user);
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      addToast({ type: 'success', title: 'Project Updated', message: 'Changes saved successfully.' });
      return updated;
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to update project' });
      throw e;
    }
  };

  const deleteProject = async (id: string, user: UserProfile) => {
    try {
      await api.deleteProject(id, user);
      setProjects(prev => prev.filter(p => p.id !== id));
      addToast({ type: 'info', title: 'Project Deleted', message: 'Project removed.' });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to delete project' });
      throw e;
    }
  };

  return {
    projects,
    loading,
    error,
    refreshProjects: fetchProjects,
    createProject,
    updateProject,
    deleteProject
  };
}
