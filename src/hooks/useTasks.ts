import { useState, useEffect, useCallback } from 'react';
import { Task, TaskPriority, TaskStatus, UserProfile } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export function useTasks(initialFilter?: { projectId?: string; assignedTo?: string; status?: string; search?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useNotification();

  const filterKey = JSON.stringify(initialFilter);

  const fetchTasks = useCallback(async (filter?: typeof initialFilter) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilter = filter !== undefined ? filter : (filterKey ? JSON.parse(filterKey) : undefined);
      const data = await api.getTasks(activeFilter);
      setTasks(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (
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
  ) => {
    try {
      const created = await api.createTask(data, user);
      setTasks(prev => [created, ...prev]);
      addToast({ type: 'success', title: 'Task Created', message: `"${created.title}" added.` });
      return created;
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to create task' });
      throw e;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>, user: UserProfile) => {
    try {
      const updated = await api.updateTask(id, updates, user);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to update task' });
      throw e;
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus, user: UserProfile) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    try {
      const updated = await api.updateTask(id, { status }, user);
      addToast({ type: 'info', title: 'Status Updated', message: `Task moved to ${status.replace('_', ' ')}.` });
      return updated;
    } catch (e: any) {
      fetchTasks(); // Revert on failure
      addToast({ type: 'error', title: 'Error', message: 'Failed to update status' });
      throw e;
    }
  };

  const deleteTask = async (id: string, user: UserProfile) => {
    try {
      await api.deleteTask(id, user);
      setTasks(prev => prev.filter(t => t.id !== id));
      addToast({ type: 'info', title: 'Task Deleted', message: 'Task removed.' });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to delete task' });
      throw e;
    }
  };

  return {
    tasks,
    loading,
    error,
    refreshTasks: fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
}
