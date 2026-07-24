import { getApiUrl } from "@/lib/api";

/**
 * Upload a file to Cloudinary via the SyncReach backend.
 * Returns the hosted secure URL (and metadata).
 */
export async function uploadToCloudinary(
  file: File,
  folder?: string,
): Promise<{
  url: string;
  publicId: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}> {
  const body = new FormData();
  body.append("file", file);
  if (folder) body.append("folder", folder);

  const headers: Record<string, string> = {};
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("syncreach_api_token")
      : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(getApiUrl("/upload"), {
    method: "POST",
    headers,
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Upload failed (${res.status})`);
  }
  if (!data.url) {
    throw new Error("Upload succeeded but no URL was returned.");
  }
  return data;
}

export async function getCloudinaryStatus(): Promise<{
  configured: boolean;
  cloudName: string | null;
  folder: string;
}> {
  const res = await fetch(getApiUrl("/upload/status"));
  if (!res.ok) {
    return { configured: false, cloudName: null, folder: "syncreach" };
  }
  return res.json();
}
