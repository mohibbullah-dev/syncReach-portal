/**
 * Portal auth → MERN /api/auth (JWT).
 * Also mirrors the token to a cookie so the public site (same parent domain / localhost)
 * can detect an active Admin / SuperAdmin session.
 */

import { apiFetch, getApiUrl } from "@/lib/api";

export type AdminRole = "SuperAdmin" | "Admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  createdAt: string;
};

const SESSION_KEY = "syncreach_admin_session";
export const TOKEN_KEY = "syncreach_api_token";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function cookieDomainAttr() {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "";
  if (host.endsWith("syncreachai.com")) return "; Domain=.syncreachai.com";
  return "";
}

function syncAuthCookie(token: string | null) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domain = cookieDomainAttr();
  if (token) {
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}${domain}`;
  } else {
    document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secure}${domain}`;
  }
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
  syncAuthCookie(token);
}

export function clearSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  syncAuthCookie(null);
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
      syncAuthCookie(token);
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

export function isSuperAdmin(user: AdminUser | null | undefined) {
  return user?.role === "SuperAdmin";
}

export function roleLabel(role?: string) {
  if (role === "SuperAdmin") return "Super Admin";
  if (role === "Admin") return "Admin";
  return role || "Admin";
}

export function apiBaseUrl() {
  return getApiUrl("");
}
