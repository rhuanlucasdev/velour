import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Provider, Session, User } from "@supabase/supabase-js";
import { createCreatorProfilePayload } from "../lib/creatorProfile";
import { supabase } from "../lib/supabase";
import { toast } from "../utils/toast";

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const syncingCreatorProfileIdsRef = useRef<Set<string>>(new Set());
  const announcedCreatorProfileIdsRef = useRef<Set<string>>(new Set());

  const syncCreatorProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      return;
    }

    if (syncingCreatorProfileIdsRef.current.has(nextUser.id)) {
      return;
    }

    syncingCreatorProfileIdsRef.current.add(nextUser.id);

    try {
      const { data: existingProfile, error: existingProfileError } =
        await supabase
          .from("creator_profiles")
          .select("id, plan")
          .eq("id", nextUser.id)
          .maybeSingle();

      if (existingProfileError) {
        return;
      }

      const { data: canonicalUserData } = await supabase.auth.getUser();
      const canonicalUser = canonicalUserData.user ?? nextUser;

      const { data: billingProfile } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", nextUser.id)
        .maybeSingle();

      const payload = createCreatorProfilePayload(canonicalUser, {
        isPro: billingProfile?.is_pro ?? false,
      });

      const existingPlan =
        typeof existingProfile?.plan === "string"
          ? existingProfile.plan.toLowerCase()
          : null;

      const hasExplicitPlanInMetadata = [
        canonicalUser.user_metadata?.plan,
        canonicalUser.app_metadata?.plan,
      ].some((value) =>
        ["free", "pro", "creator"].includes(String(value ?? "").toLowerCase()),
      );

      if (
        !hasExplicitPlanInMetadata &&
        existingPlan &&
        ["pro", "creator"].includes(existingPlan) &&
        payload.plan === "free"
      ) {
        payload.plan = existingPlan as "pro" | "creator";
      }

      const { error: upsertError } = await supabase
        .from("creator_profiles")
        .upsert(payload, { onConflict: "id" });

      if (upsertError) {
        const shouldRetryWithoutPlan = upsertError.message
          .toLowerCase()
          .includes("plan");

        if (!shouldRetryWithoutPlan) {
          return;
        }

        const { plan: _ignoredPlan, ...legacyPayload } = payload;
        const { error: legacyUpsertError } = await supabase
          .from("creator_profiles")
          .upsert(legacyPayload, { onConflict: "id" });

        if (legacyUpsertError) {
          return;
        }
      }

      if (
        !existingProfile &&
        !announcedCreatorProfileIdsRef.current.has(nextUser.id)
      ) {
        announcedCreatorProfileIdsRef.current.add(nextUser.id);
        toast("New feature unlocked: you now have a Creator Profile.", {
          type: "success",
        });
      }
    } finally {
      syncingCreatorProfileIdsRef.current.delete(nextUser.id);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return;
    }

    setUser(data.user ?? null);
  }, []);

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
      .then(async ({ data }) => {
        if (!isMounted) {
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          void syncCreatorProfile(data.session.user);
        }

        if (data.session?.user) {
          const { data: userData, error: userError } =
            await supabase.auth.getUser();

          if (!isMounted || userError) {
            setIsLoading(false);
            return;
          }

          setUser(userData.user ?? data.session.user);
        }

        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        void syncCreatorProfile(nextSession.user);
      }

      if (nextSession?.user) {
        void refreshUser();
      }

      if (!nextSession) {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser, syncCreatorProfile]);

  useEffect(() => {
    void refreshProfile();
    void refreshUser();
  }, [refreshProfile, refreshUser, session?.user?.id]);

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
      user,
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
      user,
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
