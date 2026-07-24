/** Detects generated / empty avatars so UI can show a profile icon instead. */
export function isRealProfileImage(url?: string | null): boolean {
  const value = url?.trim();
  if (!value) return false;
  if (/avatar\.vercel\.sh/i.test(value)) return false;
  if (/ui-avatars\.com/i.test(value)) return false;
  if (/dicebear\.com/i.test(value)) return false;
  return true;
}

/** Returns a usable image URL, or empty string when only a placeholder exists. */
export function sanitizeProfileImage(url?: string | null): string {
  return isRealProfileImage(url) ? url!.trim() : "";
}
