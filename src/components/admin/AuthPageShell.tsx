import { Link } from "@tanstack/react-router";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import markUrl from "@/assets/syncreach-mark.png";

export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EEF2F8] px-4 py-10">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0061FF1f,transparent_52%),radial-gradient(ellipse_at_bottom_right,#0B1F4412,transparent_48%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-[440px]">
        <Link to="/" className="mb-7 flex items-center justify-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white shadow-[0_10px_28px_-14px_rgba(0,97,255,0.55)] ring-1 ring-[#0061FF]/15">
            <img src={markUrl} alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            Sync<span className="text-[#0061FF]">Reach</span>
          </span>
        </Link>

        <div className="overflow-hidden rounded-[12px] border border-white/70 bg-white/95 shadow-[0_28px_60px_-32px_rgba(15,23,42,0.45)] backdrop-blur-sm">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0061FF] via-[#3B82F6] to-[#60A5FA]" />

          <div className="p-7 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#E8F0FF] text-[#0061FF] shadow-inner">
                <LockKeyhole className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#E8F0FF] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0061FF]">
                <ShieldCheck className="h-3 w-3" />
                Admin CMS
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.7rem]">
                {title}
              </h1>
              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{subtitle}</p>
            </div>

            <div className="mt-7">{children}</div>
          </div>
        </div>

        <div className="mt-5 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </div>
  );
}
