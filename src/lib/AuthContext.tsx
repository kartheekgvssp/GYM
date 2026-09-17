import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getPreferredUnit, setPreferredUnit } from './localStore';
import { AuthUser } from '../types';

interface AuthContextType {
  session: any;
  user: AuthUser | null;
  loading: boolean;
  isCloudConnected: boolean;
  unit: 'kg' | 'lb';
  setUnit: (unit: 'kg' | 'lb') => void;
  signUp: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  useGuestDemo: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnitState] = useState<'kg' | 'lb'>('kg');

  useEffect(() => {
    setUnitState(getPreferredUnit());

    supabase.auth.getSession().then(({ data }: any) => {
      setSession(data?.session || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, newSession: any) => {
      setSession(newSession);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSetUnit = (newUnit: 'kg' | 'lb') => {
    setUnitState(newUnit);
    setPreferredUnit(newUnit);
  };

  const useGuestDemo = () => {
    const demoUser: AuthUser = { id: 'usr_guest_' + Date.now().toString(36), email: 'demo.lifter@ironlog.app' };
    setSession({ user: demoUser, access_token: 'demo-token' });
  };

  const value: AuthContextType = {
    session,
    user: session?.user ? { id: session.user.id, email: session.user.email || 'athlete@ironlog.app' } : null,
    loading,
    isCloudConnected: isSupabaseConfigured,
    unit,
    setUnit: handleSetUnit,
    signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
    signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    useGuestDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
