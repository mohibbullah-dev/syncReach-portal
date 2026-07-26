/** Shared API helper for portal + public-site (Vite). */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export function getApiUrl(path = "") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${p}`;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("syncreach_api_token")
      : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(getApiUrl(path), { ...options, headers });
  } catch {
    throw new Error("Failed to fetch");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}
