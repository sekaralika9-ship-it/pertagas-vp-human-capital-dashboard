import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user) => {
    if (!user || !supabase) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) console.error('Unable to load profile', error);
    setProfile(data || null);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      return loadProfile(data.session?.user);
    }).finally(() => setLoading(false));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadProfile(nextSession?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    profile,
    loading,
    configured: isSupabaseConfigured,
    role: profile?.role || 'viewer',
    canWrite: ['admin', 'editor'].includes(profile?.role),
    canDelete: profile?.role === 'admin',
    refreshProfile: () => loadProfile(session?.user),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: async (email, password, metadata) => {
      const registration = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (registration.error || registration.data.session) return registration;
      return supabase.auth.signInWithPassword({ email, password });
    },
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email),
    signOut: () => supabase.auth.signOut(),
  }), [session, profile, loading, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
