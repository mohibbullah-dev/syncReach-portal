/**
 * CMS-ready gallery model.
 * Later: replace `getGalleryItems()` with GET /api/gallery from the MERN admin panel.
 * Admin uploads photos/videos → stored in media library → public site reads this shape.
 */
export type GalleryMediaType = "photo" | "video";

export type GalleryItem = {
  id: string;
  type: GalleryMediaType;
  title: string;
  caption: string;
  /** Image URL or video file URL from CMS */
  src: string;
  /** Poster/cover for videos (optional for photos) */
  thumbnailUrl?: string;
  /** Larger tile in the bento layout */
  featured?: boolean;
  sortOrder: number;
  published: boolean;
};

/** Mock data — swap for API when CMS is live */
export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    type: "video",
    title: "Outbound war room",
    caption: "Weekly pipeline review with the growth team.",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
    featured: true,
    sortOrder: 1,
    published: true,
  },
  {
    id: "g2",
    type: "photo",
    title: "Campaign kickoff",
    caption: "Launch day for a new ICP sequence.",
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80",
    featured: false,
    sortOrder: 2,
    published: true,
  },
  {
    id: "g3",
    type: "photo",
    title: "Deliverability lab",
    caption: "Inbox warm-up and domain health checks.",
    src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
    featured: false,
    sortOrder: 3,
    published: true,
  },
  {
    id: "g4",
    type: "video",
    title: "Client win call",
    caption: "First 30 days, meetings on the board.",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
    featured: false,
    sortOrder: 4,
    published: true,
  },
  {
    id: "g5",
    type: "photo",
    title: "Studio session",
    caption: "Creative for the next outreach creative pack.",
    src: "https://images.unsplash.com/photo-1542744173-8e2bd1f53ce0?w=900&q=80",
    featured: false,
    sortOrder: 5,
    published: true,
  },
  {
    id: "g6",
    type: "photo",
    title: "Faridpur HQ",
    caption: "Where SyncReach ships outbound systems.",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    featured: false,
    sortOrder: 6,
    published: true,
  },
  {
    id: "g7",
    type: "photo",
    title: "Team sync",
    caption: "Operators building predictable pipelines.",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80",
    featured: false,
    sortOrder: 7,
    published: true,
  },
];

/** Temporary data layer — replace with fetch('/api/gallery') later */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  return getPublishedGalleryItems();
}

export function getPublishedGalleryItems(): GalleryItem[] {
  let source = galleryItems;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("syncreach_cms_gallery");
      if (raw) source = JSON.parse(raw) as GalleryItem[];
    } catch {
      /* keep seed */
    }
  }
  return source
    .filter((item) => item.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Homepage marquee preview — only a few items */
export function getHomeGalleryItems(limit = 6): GalleryItem[] {
  return getPublishedGalleryItems().slice(0, limit);
}
