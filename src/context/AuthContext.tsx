import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_USERS } from '../services/mockData';

interface AuthContextType {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, fullName: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'trackforge_active_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  // Fetch Supabase user profile
  const fetchSupabaseProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setUser(data as UserProfile);
        return;
      }
    } catch (e) {
      console.error('Failed to fetch Supabase profile', e);
    }
  }, []);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (mounted && initialSession?.user) {
            setSession(initialSession);
            setIsDemoMode(false);
            await fetchSupabaseProfile(initialSession.user.id);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase auth initialization error, falling back to demo mode:', e);
        }
      }

      // Demo Mode Initializer
      const savedUser = localStorage.getItem(DEMO_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(INITIAL_USERS[0]); // Default to Admin
        }
      } else {
        // Default to Admin demo user for comprehensive out-of-the-box experience
        setUser(INITIAL_USERS[0]);
      }
      setIsDemoMode(true);
      setLoading(false);
    }

    initAuth();

    // Supabase auth state listener
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          setIsDemoMode(false);
          await fetchSupabaseProfile(newSession.user.id);
        } else {
          // If logged out from Supabase, switch to Demo user
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [fetchSupabaseProfile]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw new Error(error.message);
        setSession(data.session);
        setIsDemoMode(false);
        if (data.user) {
          await fetchSupabaseProfile(data.user.id);
        }
        return;
      }

      // Demo login: match email or choose appropriate mock user
      const matched = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setUser(matched);
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(matched));
      } else {
        // Create dynamic demo user
        const dynamicUser: UserProfile = {
          id: `demo-${Date.now()}`,
          email,
          full_name: email.split('@')[0],
          role: 'team_member',
          is_active: true,
          created_at: new Date().toISOString()
        };
        setUser(dynamicUser);
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(dynamicUser));
      }
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, fullName: string, role: UserRole = 'team_member') => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { full_name: fullName, role }
          }
        });
        if (error) throw new Error(error.message);
        if (data.session) setSession(data.session);
        return;
      }

      const newUser: UserProfile = {
        id: `demo-${Date.now()}`,
        email,
        full_name: fullName,
        role,
        is_active: true,
        created_at: new Date().toISOString()
      };
      setUser(newUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && session) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      localStorage.removeItem(DEMO_USER_KEY);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw new Error(error.message);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    const target = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    setUser(target);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(target));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw new Error(error.message);
    }
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    if (isDemoMode) {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemoMode,
        login,
        signup,
        logout,
        resetPassword,
        switchDemoRole,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
