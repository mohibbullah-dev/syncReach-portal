import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const toneMap = {
  blue: "bg-[#E8F0FF] text-[#0061FF]",
  purple: "bg-[#F3E8FF] text-[#7C3AED]",
  green: "bg-[#E7F8EF] text-[#16A34A]",
  orange: "bg-[#FFF1E6] text-[#EA580C]",
} as const;

type StatCardProps = {
  title: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  tone?: keyof typeof toneMap;
};

export function AdminStatCard({
  title,
  value,
  delta,
  icon: Icon,
  tone = "blue",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            toneMap[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <MiniSpark tone={tone} />
      </div>
      <div className="mt-4 text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <TrendingUp className="h-3.5 w-3.5" />
        {delta}
      </div>
    </div>
  );
}

function MiniSpark({ tone }: { tone: keyof typeof toneMap }) {
  const stroke =
    tone === "blue"
      ? "#0061FF"
      : tone === "purple"
        ? "#7C3AED"
        : tone === "green"
          ? "#16A34A"
          : "#EA580C";
  return (
    <svg width="72" height="28" viewBox="0 0 72 28" fill="none" aria-hidden>
      <path
        d="M1 20 C10 18, 14 8, 22 10 C30 12, 34 22, 42 18 C50 14, 56 6, 71 8"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
