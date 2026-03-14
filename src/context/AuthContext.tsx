import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Provider, Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  is_pro: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isPro: boolean;
  isLoading: boolean;
  login: (provider: Provider) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  registerWithPassword: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;

    if (!userId) {
      setProfile(null);
      return;
    }

    await supabase
      .from("profiles")
      .upsert({ id: userId }, { onConflict: "id" });

    const { data, error } = await supabase
      .from("profiles")
      .select("id, is_pro")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      setProfile(null);
      return;
    }

    setProfile(data);
  }, [session?.user?.id]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        setSession(data.session);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSession(null);
        setProfile(null);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [session?.user?.id]);

  const login = useCallback(async (provider: Provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
  }, []);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    },
    [],
  );

  const registerWithPassword = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Supabase silently "succeeds" for existing emails (returns empty identities)
      // to prevent email enumeration. We detect and surface it explicitly.
      if (
        data.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        const err = new Error("This email is already registered.");
        (err as Error & { code?: string }).code = "email_already_exists";
        throw err;
      }

      return {
        requiresEmailConfirmation: !data.session,
      };
    },
    [],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isPro: profile?.is_pro ?? false,
      isLoading,
      login,
      loginWithPassword,
      registerWithPassword,
      requestPasswordReset,
      logout,
      refreshProfile,
    }),
    [
      isLoading,
      login,
      loginWithPassword,
      logout,
      profile,
      refreshProfile,
      registerWithPassword,
      requestPasswordReset,
      session,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
