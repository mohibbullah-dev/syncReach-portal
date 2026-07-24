import { Link } from "@tanstack/react-router";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F7FB] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#0061FF22,transparent_50%),radial-gradient(ellipse_at_bottom_left,#7C3AED18,transparent_45%)]" />

      <div className="relative w-full max-w-[420px]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src={markUrl} alt="" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            Sync<span className="text-[#0061FF]">Reach</span>
          </span>
        </Link>

        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-7 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0061FF]">
              Admin CMS
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="mt-7">{children}</div>
        </div>

        <div className="mt-5 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </div>
  );
}
