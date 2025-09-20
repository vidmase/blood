import { supabase } from './supabaseClient';
import type { User, AuthError, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
    };
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  data?: {
    full_name?: string;
  };
}

class AuthService {
  // Sign up with email and password
  async signUp({ email, password, options }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });
    
    if (error) throw error;
    return data;
  }

  // Sign in with email and password
  async signInWithPassword({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  // Sign in with magic link via email
  async signInWithOtp(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email
    });
    
    if (error) throw error;
    return data;
  }

  // Sign in with phone and password
  async signInWithPhone(phone: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password
    });
    
    if (error) throw error;
    return data;
  }

  // Sign up with phone and password
  async signUpWithPhone(phone: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      phone,
      password
    });
    
    if (error) throw error;
    return data;
  }

  // Verify OTP for phone or email
  async verifyOtp(phone: string, token: string, type: 'sms' | 'phone_change' = 'sms') {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type
    });
    
    if (error) throw error;
    return data;
  }

  // Sign in with third party OAuth (Google, GitHub, etc.)
  async signInWithOAuth(provider: 'github' | 'google' | 'facebook' | 'twitter') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider
    });
    
    if (error) throw error;
    return data;
  }

  // Get current user
  async getUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    return user;
  }

  // Get current session
  async getSession(): Promise<Session | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    return session;
  }

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
  }

  // Update user profile
  async updateUser(updates: UpdateUserData) {
    const { data, error } = await supabase.auth.updateUser(updates);
    
    if (error) throw error;
    return data;
  }

  // Reset password via email
  async resetPasswordForEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) throw error;
    return data;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Invite user by email (requires service_role key)
  async inviteUserByEmail(email: string) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
    
    if (error) throw error;
    return data;
  }
}

export const authService = new AuthService();
