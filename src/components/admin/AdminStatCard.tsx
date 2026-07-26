import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const toneStyles = {
  blue: {
    card: "from-[#F4F8FF] via-white to-white",
    icon: "bg-[#0061FF] text-white shadow-[0_8px_20px_-6px_rgba(0,97,255,0.55)]",
    bar: "bg-[#0061FF]",
    soft: "text-[#0061FF]",
  },
  purple: {
    card: "from-[#F8F4FF] via-white to-white",
    icon: "bg-[#7C3AED] text-white shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)]",
    bar: "bg-[#7C3AED]",
    soft: "text-[#7C3AED]",
  },
  green: {
    card: "from-[#F3FBF6] via-white to-white",
    icon: "bg-[#16A34A] text-white shadow-[0_8px_20px_-6px_rgba(22,163,74,0.5)]",
    bar: "bg-[#16A34A]",
    soft: "text-[#16A34A]",
  },
  orange: {
    card: "from-[#FFF7F0] via-white to-white",
    icon: "bg-[#EA580C] text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.45)]",
    bar: "bg-[#EA580C]",
    soft: "text-[#EA580C]",
  },
} as const;

type StatCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: keyof typeof toneStyles;
  href?: string;
};

export function AdminStatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "blue",
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[12px] border border-slate-200/70 bg-gradient-to-br p-5",
        "shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] transition duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-22px_rgba(15,23,42,0.32)]",
        styles.card,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 opacity-90", styles.bar)} />
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-[12px] transition group-hover:scale-105",
            styles.icon,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
      </div>
      <div className="mt-5 text-[13px] font-medium tracking-wide text-slate-500">
        {title}
      </div>
      <div className="mt-1.5 font-display text-[2rem] font-bold leading-none tracking-tight text-slate-900">
        {value}
      </div>
      <p className={cn("mt-3 text-xs font-medium", styles.soft)}>{hint}</p>
    </div>
  );
}
