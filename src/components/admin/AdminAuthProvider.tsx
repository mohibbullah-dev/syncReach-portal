import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  restoreSession,
  signIn as authSignIn,
  signOut as authSignOut,
  updateProfile as authUpdateProfile,
  type AdminUser,
  type AuthResult,
} from "@/lib/admin-auth";

type UpdateProfileInput = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  password?: string;
};

type AdminAuthContextValue = {
  user: AdminUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  updateProfile: (input: UpdateProfileInput) => Promise<AuthResult>;
  signOut: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const session = await restoreSession();
      if (!cancelled) {
        setUser(session);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const result = await authUpdateProfile(input);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(() => {
    authSignOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, updateProfile, signOut }),
    [user, ready, signIn, updateProfile, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
