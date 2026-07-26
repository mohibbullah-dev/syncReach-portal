/**
 * CMS-ready review model.
 * Later: replace `getReviews()` with GET /api/reviews from the MERN admin panel.
 */
import { sanitizeProfileImage } from "@/lib/profile-image";

export type ReviewType = "text" | "image" | "video";

export type Review = {
  id: string;
  type: ReviewType;
  name: string;
  username: string;
  role: string;
  avatar: string;
  /** Quote / caption shown on the card */
  body: string;
  /** Image or video source URL from CMS media library */
  mediaUrl?: string;
  /** Optional video poster / cover image */
  thumbnailUrl?: string;
  rating: number;
  featured: boolean;
};

/** Mock data — swap for API response when CMS is live */
export const reviews: Review[] = [
  {
    id: "r1",
    type: "text",
    name: "Amina Rahman",
    username: "@amina",
    role: "Head of Growth · SaaS agency",
    avatar: "",
    body: "We went from 3 meetings a week to 3 a day. SyncReach paid for itself in 11 days.",
    rating: 5,
    featured: true,
  },
  {
    id: "r2",
    type: "video",
    name: "Jordan Lee",
    username: "@jordan",
    role: "Founder · B2B startup",
    avatar: "",
    body: "The personalization is spot-on. Prospects reply asking who wrote it? Our team did.",
    mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&q=80",
    rating: 5,
    featured: true,
  },
  {
    id: "r3",
    type: "image",
    name: "Priya Sen",
    username: "@priya",
    role: "SDR Manager · Fintech",
    avatar: "",
    body: "Deliverability is the best I've ever seen. Finally, cold email that lands.",
    mediaUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80",
    rating: 5,
    featured: true,
  },
  {
    id: "r4",
    type: "text",
    name: "Marcus Chen",
    username: "@marcus",
    role: "VP Sales · Agency",
    avatar: "",
    body: "Pipeline went predictable for the first time. Our reps just show up and close.",
    rating: 5,
    featured: true,
  },
  {
    id: "r5",
    type: "video",
    name: "Sara Okonkwo",
    username: "@sara",
    role: "Revenue Lead · SaaS",
    avatar: "",
    body: "Booked 38 qualified meetings in our first 30 days on SyncReach.",
    mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&q=80",
    rating: 5,
    featured: true,
  },
  {
    id: "r6",
    type: "image",
    name: "Diego Alvarez",
    username: "@diego",
    role: "Outbound Lead · Services",
    avatar: "",
    body: "Warm up + sequences in one place. We killed four other tools.",
    mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
    rating: 5,
    featured: true,
  },
  {
    id: "r7",
    type: "text",
    name: "Emily Park",
    username: "@emily",
    role: "Founder · Agency",
    avatar: "",
    body: "Reply rates jumped into double digits within the first campaign cycle.",
    rating: 5,
    featured: false,
  },
  {
    id: "r8",
    type: "video",
    name: "Noah Kim",
    username: "@noah",
    role: "Growth · Fintech",
    avatar: "",
    body: "Sync today, reach tomorrow. That tagline became our weekly rhythm.",
    mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=640&q=80",
    rating: 5,
    featured: false,
  },
];

/** Temporary data layer — replace body with fetch('/api/reviews') later */
export async function getReviews(): Promise<Review[]> {
  if (typeof window !== "undefined") {
    const { getCmsReviews } = await import("@/lib/cms-store");
    return getCmsReviews();
  }
  return reviews.map((r) => ({ ...r, avatar: sanitizeProfileImage(r.avatar) }));
}

export function getFeaturedReviews(): Review[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("syncreach_cms_reviews");
      if (raw) {
        const list = JSON.parse(raw) as Review[];
        return list
          .map((r) => ({ ...r, avatar: sanitizeProfileImage(r.avatar) }))
          .filter((r) => r.featured);
      }
    } catch {
      /* fall through */
    }
  }
  return reviews
    .map((r) => ({ ...r, avatar: sanitizeProfileImage(r.avatar) }))
    .filter((r) => r.featured);
}

export function getReviewById(id: string): Review | undefined {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("syncreach_cms_reviews");
      if (raw) {
        const list = JSON.parse(raw) as Review[];
        const found = list.find((r) => r.id === id);
        return found
          ? { ...found, avatar: sanitizeProfileImage(found.avatar) }
          : undefined;
      }
    } catch {
      /* fall through */
    }
  }
  const found = reviews.find((r) => r.id === id);
  return found
    ? { ...found, avatar: sanitizeProfileImage(found.avatar) }
    : undefined;
}

