import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'google' | 'facebook' | 'twitter') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { email?: string; password?: string; full_name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await authService.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      await authService.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signInWithPassword({ email, password });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithOtp = async (email: string) => {
    setLoading(true);
    try {
      await authService.signInWithOtp(email);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: 'github' | 'google' | 'facebook' | 'twitter') => {
    setLoading(true);
    try {
      await authService.signInWithOAuth(provider);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPasswordForEmail(email);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: { email?: string; password?: string; full_name?: string }) => {
    setLoading(true);
    try {
      const updateData: any = {};
      
      if (updates.email) updateData.email = updates.email;
      if (updates.password) updateData.password = updates.password;
      if (updates.full_name) {
        updateData.data = { full_name: updates.full_name };
      }

      await authService.updateUser(updateData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOtp,
    signInWithOAuth,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
