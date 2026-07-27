export type HeroMediaType = "video" | "image";

export type HeroSlide = {
  id?: string;
  type: HeroMediaType;
  mediaUrl: string;
  posterUrl: string;
  sortOrder: number;
};

export type HeroCarouselSettings = {
  autoplay: boolean;
  autoplayIntervalMs: number;
  loop: boolean;
  showDots: boolean;
  showArrows: boolean;
  pauseOnHover: boolean;
};

export type HeroContent = {
  id?: string;
  headlineBefore: string;
  headlineHighlight: string;
  headlineLine2: string;
  description: string;
  slides: HeroSlide[];
  carousel: HeroCarouselSettings;
  published: boolean;
};

export const defaultHeroCarousel: HeroCarouselSettings = {
  autoplay: true,
  autoplayIntervalMs: 5000,
  loop: true,
  showDots: true,
  showArrows: true,
  pauseOnHover: true,
};

export const defaultHeroContent: HeroContent = {
  headlineBefore: "We bring",
  headlineHighlight: "the leads.",
  headlineLine2: "You close the deal.",
  description:
    "We help B2B businesses build qualified sales pipelines through strategic cold email and LinkedIn outreach, powered by AI driven personalisation, lead qualification, and appointment setting.",
  slides: [],
  carousel: defaultHeroCarousel,
  published: true,
};

export function emptyHeroSlide(sortOrder: number): HeroSlide {
  return {
    type: "image",
    mediaUrl: "",
    posterUrl: "",
    sortOrder,
  };
}
