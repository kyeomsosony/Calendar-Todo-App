import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabase } from '../utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
      } else {
        // Try to recover from custom storage
        const stored = localStorage.getItem('sb-custom-session');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            
            await supabase.auth.setSession({
              access_token: parsed.access_token,
              refresh_token: parsed.refresh_token,
            });
            
            const { data: { session: recoveredSession } } = await supabase.auth.getSession();
            if (recoveredSession) {
              setSession(recoveredSession);
              setUser(recoveredSession.user);
            } else {
              setSession(null);
              setUser(null);
            }
          } catch (e) {
            console.error('Error recovering session:', e);
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      }
      setLoading(false);
    });

    // 세션 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Save to custom storage
        try {
          localStorage.setItem('sb-custom-session', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user: session.user,
          }));
        } catch (e) {
          console.error('Failed to save session:', e);
        }
      } else {
        localStorage.removeItem('sb-custom-session');
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const supabaseUrl = await import('../utils/supabase/info').then(m => `https://${m.projectId}.supabase.co`);
      const { publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-115a0b3d/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || '회원가입에 실패했습니다') };
      }

      // 회원가입 성공 후 자동 로그인
      return signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }
      
      if (!data.session) {
        return { error: new Error('No session returned') };
      }
      
      // Manually store session in localStorage as backup
      try {
        localStorage.setItem('sb-custom-session', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: data.user,
        }));
      } catch (e) {
        console.error('Failed to save session:', e);
      }
      
      // Set session in Supabase client
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      
      setSession(data.session);
      setUser(data.user);
      
      // Verify session persistence
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const { data: { session: verifySession } } = await supabase.auth.getSession();
      if (!verifySession?.access_token) {
        // Try to recover from manual storage
        const stored = localStorage.getItem('sb-custom-session');
        if (stored) {
          const parsed = JSON.parse(stored);
          await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
          });
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    
    // Clear all Supabase-related localStorage including custom session
    localStorage.removeItem('sb-custom-session');
    
    const allKeys = Object.keys(localStorage);
    const sbKeys = allKeys.filter(k => k.includes('sb-') || k.includes('supabase'));
    sbKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
