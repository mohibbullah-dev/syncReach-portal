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

/**
 * Square face-focused crop for circular avatars (Cloudinary delivery transform).
 * Falls back to the original URL for non-Cloudinary images.
 */
export function faceCropAvatarUrl(url?: string | null, size = 128): string {
  const value = sanitizeProfileImage(url);
  if (!value) return "";
  if (!/res\.cloudinary\.com/i.test(value) || !/\/upload\//.test(value)) {
    return value;
  }
  // Avoid stacking transforms if already present after /upload/
  if (/\/upload\/[^/]+,/.test(value)) return value;
  return value.replace(
    "/upload/",
    `/upload/c_fill,g_auto:face,w_${size},h_${size},q_auto,f_auto/`,
  );
}
