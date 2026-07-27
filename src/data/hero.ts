export type HeroMediaType = "video" | "image";

export type HeroContent = {
  id?: string;
  headlineBefore: string;
  headlineHighlight: string;
  headlineLine2: string;
  description: string;
  mediaType: HeroMediaType;
  mediaUrl: string;
  posterUrl: string;
  published: boolean;
};

export const defaultHeroContent: HeroContent = {
  headlineBefore: "We bring",
  headlineHighlight: "the leads.",
  headlineLine2: "You close the deal.",
  description:
    "We help B2B businesses build qualified sales pipelines through strategic cold email and LinkedIn outreach, powered by AI driven personalisation, lead qualification, and appointment setting.",
  mediaType: "video",
  mediaUrl: "",
  posterUrl: "",
  published: true,
};
