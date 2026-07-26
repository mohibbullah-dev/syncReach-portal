/**
 * Portal CMS → MERN API (/api/reviews|gallery|team|pricing|contact).
 */

import type { ContactMessage } from "@/data/contact";
import type { FaqItem } from "@/data/faq";
import type { GalleryItem } from "@/data/gallery";
import type { PricingPlan } from "@/data/pricing";
import type { Review } from "@/data/reviews";
import type { TeamMember } from "@/data/team";
import type { AdminUser } from "@/lib/admin-auth";
import { apiFetch } from "@/lib/api";
import { sanitizeProfileImage } from "@/lib/profile-image";

export async function getCmsReviews(): Promise<Review[]> {
  const items = (await apiFetch("/reviews")) as Review[];
  return items.map((r) => ({
    ...r,
    type: ((r.type as string) === "audio" ? "image" : r.type) as Review["type"],
    avatar: sanitizeProfileImage(r.avatar),
  }));
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

export async function getCmsFaq(): Promise<FaqItem[]> {
  return apiFetch("/faq") as Promise<FaqItem[]>;
}

export async function upsertCmsFaqItem(item: FaqItem): Promise<FaqItem[]> {
  const { id, ...rest } = item;
  const isNew = !id || id.startsWith("f_");
  if (isNew) {
    await apiFetch("/faq", { method: "POST", body: JSON.stringify(rest) });
  } else {
    await apiFetch(`/faq/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  }
  return getCmsFaq();
}

export async function deleteCmsFaqItem(id: string): Promise<FaqItem[]> {
  await apiFetch(`/faq/${id}`, { method: "DELETE" });
  return getCmsFaq();
}

export async function getCmsPricing(): Promise<PricingPlan[]> {
  return apiFetch("/pricing") as Promise<PricingPlan[]>;
}

export async function upsertCmsPricingPlan(plan: PricingPlan): Promise<PricingPlan[]> {
  const { id, ...rest } = plan;
  const isNew = !id || id.startsWith("p_");
  if (isNew) {
    await apiFetch("/pricing", { method: "POST", body: JSON.stringify(rest) });
  } else {
    await apiFetch(`/pricing/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  }
  return getCmsPricing();
}

export async function deleteCmsPricingPlan(id: string): Promise<PricingPlan[]> {
  await apiFetch(`/pricing/${id}`, { method: "DELETE" });
  return getCmsPricing();
}

export async function getCmsMessages(): Promise<ContactMessage[]> {
  return apiFetch("/contact") as Promise<ContactMessage[]>;
}

export async function markCmsMessageRead(id: string): Promise<ContactMessage[]> {
  await apiFetch(`/contact/${id}/read`, { method: "PATCH" });
  return getCmsMessages();
}

export async function deleteCmsMessage(id: string): Promise<ContactMessage[]> {
  await apiFetch(`/contact/${id}`, { method: "DELETE" });
  return getCmsMessages();
}

export async function getCmsUsers(): Promise<AdminUser[]> {
  return apiFetch("/users") as Promise<AdminUser[]>;
}

export async function createCmsAdmin(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AdminUser[]> {
  await apiFetch("/users", { method: "POST", body: JSON.stringify(input) });
  return getCmsUsers();
}

export async function deleteCmsUser(id: string): Promise<AdminUser[]> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
  return getCmsUsers();
}

/** Client temp id before API assigns Mongo id */
export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
