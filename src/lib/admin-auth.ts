/**
 * Portal auth → MERN /api/auth (JWT).
 */

import { apiFetch, getApiUrl } from "@/lib/api";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor";
  avatarUrl?: string;
  createdAt: string;
};

const SESSION_KEY = "syncreach_admin_session";
const TOKEN_KEY = "syncreach_api_token";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): AdminUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function setSession(user: AdminUser, token: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export type AuthResult =
  | { ok: true; user: AdminUser }
  | { ok: false; error: string };

export async function restoreSession(): Promise<AdminUser | null> {
  const token = getToken();
  if (!token) {
    clearSession();
    return null;
  }
  try {
    const data = await apiFetch("/auth/me");
    const user = data.user as AdminUser;
    if (canUseStorage()) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    return user;
  } catch {
    clearSession();
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSession(data.user, data.token);
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Login failed." };
  }
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}): Promise<AuthResult> {
  try {
    const data = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setSession(data.user, data.token);
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sign up failed." };
  }
}

export async function updateProfile(patch: {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  password?: string;
}): Promise<AuthResult> {
  try {
    const data = await apiFetch("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (data.token) setSession(data.user, data.token);
    else if (canUseStorage()) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    }
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Update failed." };
  }
}

export function signOut() {
  clearSession();
}

export const DEMO_CREDENTIALS = {
  email: "admin@syncreach.com",
  password: "admin123",
} as const;

export function apiBaseUrl() {
  return getApiUrl("");
}
