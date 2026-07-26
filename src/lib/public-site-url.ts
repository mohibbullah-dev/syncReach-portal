/** Live marketing site URL (View public site, etc.). */
export function getPublicSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined;
  const fallback = import.meta.env.PROD
    ? "https://syncreachai.com"
    : "http://localhost:8080";
  return (fromEnv || fallback).replace(/\/$/, "");
}
