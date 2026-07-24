/**
 * CMS-ready team model for the public Team section.
 */

import marketerUrl from "@/assets/marketer.png";
import sabidUrl from "@/assets/sabid.jpg";
import safiqUrl from "@/assets/safiq.png";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  img: string;
  facebookUrl: string;
  linkedinUrl: string;
  sortOrder: number;
  published: boolean;
};

/** Seed — swap for CMS / API later */
export const teamMembers: TeamMember[] = [
  {
    id: "t1",
    name: "Md Sabid Khan",
    role: "Co-Founder & CEO",
    img: sabidUrl,
    facebookUrl: "https://facebook.com",
    linkedinUrl: "https://linkedin.com",
    sortOrder: 1,
    published: true,
  },
  {
    id: "t2",
    name: "Safiq Ahmed",
    role: "Co-Founder & CTO",
    img: safiqUrl,
    facebookUrl: "https://facebook.com",
    linkedinUrl: "https://linkedin.com",
    sortOrder: 2,
    published: true,
  },
  {
    id: "t3",
    name: "Rahim Uddin",
    role: "Head of Deliverability",
    img: marketerUrl,
    facebookUrl: "https://facebook.com",
    linkedinUrl: "https://linkedin.com",
    sortOrder: 3,
    published: true,
  },
];

export function getPublishedTeamMembers(): TeamMember[] {
  let source = teamMembers;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("syncreach_cms_team");
      if (raw) source = JSON.parse(raw) as TeamMember[];
    } catch {
      /* keep seed */
    }
  }
  return source
    .filter((m) => m.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
