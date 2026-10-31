import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, getSupabaseCredentials } from '../lib/supabase';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, company?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  switchDemoRole: (role: UserRole, email?: string, company?: string) => void;
}

// Default Admin profile
const DEFAULT_ADMIN_PROFILE: UserProfile = {
  id: 'usr_admin_01',
  email: 'admin@brightloop.io',
  fullName: 'Aditya Varma',
  role: 'admin',
  company: 'Brightloop RevOpsHQ',
};

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  admin: DEFAULT_ADMIN_PROFILE,
  staff: {
    id: 'usr_staff_02',
    email: 'sarah.revops@brightloop.io',
    fullName: 'Sarah Jenkins',
    role: 'staff',
    company: 'Brightloop RevOpsHQ',
  },
  customer: {
    id: 'usr_customer_03',
    email: 'aravind@lineardynamics.io',
    fullName: 'Aravind Swaminathan',
    role: 'customer',
    company: 'Linear Dynamics Labs',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_ADMIN_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Initialize auth
  useEffect(() => {
    const { isConfigured } = getSupabaseCredentials();
    setIsSupabaseConnected(isConfigured);

    const supabase = getSupabase();

    if (isConfigured) {
      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setIsLoading(false);
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await fetchUserProfile(newSession.user);
          } else {
            // Revert to demo admin or current stored demo profile
            setIsLoading(false);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchUserProfile(authUser: User) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name || authUser.email?.split('@')[0] || 'User',
          role: data.role as UserRole || 'customer',
          company: data.company,
        });
      } else {
        // Fallback profile from user metadata
        const metaRole = (authUser.user_metadata?.role as UserRole) || 'customer';
        setProfile({
          id: authUser.id,
          email: authUser.email || '',
          fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: metaRole,
          company: authUser.user_metadata?.company,
        });
      }
    } catch (e) {
      console.error('Error fetching user profile:', e);
    } finally {
      setIsLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { isConfigured } = getSupabaseCredentials();

    if (!isConfigured) {
      // Offline / Demo authentication
      const matched = Object.values(DEMO_PROFILES).find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setProfile(matched);
        setIsLoading(false);
        return { success: true };
      }
      // Or create dynamic demo user
      setProfile({
        id: `usr_${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : 'customer',
      });
      setIsLoading(false);
      return { success: true };
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user);
      }
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'customer',
    company?: string
  ) => {
    setIsLoading(true);
    const { isConfigured } = getSupabaseCredentials();

    if (!isConfigured) {
      setProfile({
        id: `usr_${Date.now()}`,
        email,
        fullName,
        role,
        company,
      });
      setIsLoading(false);
      return { success: true };
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            company,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Try creating profile record
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          company,
        });

        await fetchUserProfile(data.user);
      }
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const signOut = async () => {
    const { isConfigured } = getSupabaseCredentials();
    if (isConfigured) {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(DEFAULT_ADMIN_PROFILE);
  };

  const resetPasswordForEmail = async (email: string) => {
    setIsLoading(true);
    const { isConfigured } = getSupabaseCredentials();
    if (!isConfigured) {
      setIsLoading(false);
      return { success: true };
    }
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setIsLoading(false);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Failed to send reset email' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    const { isConfigured } = getSupabaseCredentials();
    if (!isConfigured) {
      setIsLoading(false);
      return { success: true };
    }
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setIsLoading(false);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Failed to update password' };
    }
  };

  const switchDemoRole = (newRole: UserRole, customEmail?: string, customCompany?: string) => {
    const demo = DEMO_PROFILES[newRole];
    setProfile({
      ...demo,
      email: customEmail || demo.email,
      company: customCompany || demo.company,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        role: profile.role,
        isLoading,
        isSupabaseConnected,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
