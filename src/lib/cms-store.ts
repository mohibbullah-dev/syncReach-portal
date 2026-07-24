/**
 * Portal CMS → MERN API (/api/reviews|gallery|team).
 */

import type { GalleryItem } from "@/data/gallery";
import type { Review } from "@/data/reviews";
import type { TeamMember } from "@/data/team";
import { apiFetch } from "@/lib/api";
import { sanitizeProfileImage } from "@/lib/profile-image";

export async function getCmsReviews(): Promise<Review[]> {
  const items = (await apiFetch("/reviews")) as Review[];
  return items.map((r) => ({ ...r, avatar: sanitizeProfileImage(r.avatar) }));
}

export async function upsertCmsReview(review: Review): Promise<Review[]> {
  const { id, ...rest } = review;
  const isNew = !id || id.startsWith("r_");
  if (isNew) {
    await apiFetch("/reviews", { method: "POST", body: JSON.stringify(rest) });
  } else {
    await apiFetch(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  }
  return getCmsReviews();
}

export async function deleteCmsReview(id: string): Promise<Review[]> {
  await apiFetch(`/reviews/${id}`, { method: "DELETE" });
  return getCmsReviews();
}

export async function getCmsGallery(): Promise<GalleryItem[]> {
  return apiFetch("/gallery") as Promise<GalleryItem[]>;
}

export async function upsertCmsGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  const { id, ...rest } = item;
  const isNew = !id || id.startsWith("g_");
  if (isNew) {
    await apiFetch("/gallery", { method: "POST", body: JSON.stringify(rest) });
  } else {
    await apiFetch(`/gallery/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  }
  return getCmsGallery();
}

export async function deleteCmsGalleryItem(id: string): Promise<GalleryItem[]> {
  await apiFetch(`/gallery/${id}`, { method: "DELETE" });
  return getCmsGallery();
}

export async function getCmsTeam(): Promise<TeamMember[]> {
  return apiFetch("/team") as Promise<TeamMember[]>;
}

export async function upsertCmsTeamMember(member: TeamMember): Promise<TeamMember[]> {
  const { id, ...rest } = member;
  const isNew = !id || id.startsWith("t_");
  if (isNew) {
    await apiFetch("/team", { method: "POST", body: JSON.stringify(rest) });
  } else {
    await apiFetch(`/team/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  }
  return getCmsTeam();
}

export async function deleteCmsTeamMember(id: string): Promise<TeamMember[]> {
  await apiFetch(`/team/${id}`, { method: "DELETE" });
  return getCmsTeam();
}

/** Client temp id before API assigns Mongo id */
export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
