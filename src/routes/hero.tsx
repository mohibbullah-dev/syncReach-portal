import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Type,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { HeroSlidesEditor } from "@/components/admin/HeroSlidesEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { defaultHeroContent, type HeroContent } from "@/data/hero";
import { getCmsHero, upsertCmsHero } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hero")({
  component: AdminHeroPage,
});

function AdminHeroPage() {
  const [values, setValues] = useState<HeroContent>(defaultHeroContent);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getCmsHero()
      .then(setValues)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof HeroContent>(key: K, value: HeroContent[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const slideStats = useMemo(() => {
    const images = values.slides.filter((s) => s.type === "image").length;
    const videos = values.slides.filter((s) => s.type === "video").length;
    return { images, videos, total: values.slides.length };
  }, [values.slides]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.headlineBefore.trim() || !values.headlineHighlight.trim() || !values.headlineLine2.trim()) {
      setError("All headline fields are required.");
      return;
    }
    if (!values.description.trim()) {
      setError("Description is required.");
      return;
    }
    try {
      setBusy(true);
      const saved = await upsertCmsHero(values);
      setValues(saved);
      toast.success("Hero section saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading hero content…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Hero section</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Homepage headline, description, and right-side carousel. Layout and brand colors stay fixed on the live site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-[12px] bg-slate-100 text-slate-600 hover:bg-slate-100">
            {slideStats.total} slides
          </Badge>
          {slideStats.images > 0 ? (
            <Badge variant="secondary" className="rounded-[12px] bg-sky-50 text-sky-700 hover:bg-sky-50">
              {slideStats.images} image{slideStats.images === 1 ? "" : "s"}
            </Badge>
          ) : null}
          {slideStats.videos > 0 ? (
            <Badge variant="secondary" className="rounded-[12px] bg-violet-50 text-violet-700 hover:bg-violet-50">
              {slideStats.videos} video{slideStats.videos === 1 ? "" : "s"}
            </Badge>
          ) : null}
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="rounded-[12px] border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#E8F0FF] text-[#0061FF]">
                <Type className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Headline & description</h2>
                <p className="text-xs text-slate-500">Left side copy on the homepage hero</p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="headlineBefore">Line 1 (before highlight)</Label>
                  <Input
                    id="headlineBefore"
                    value={values.headlineBefore}
                    onChange={(e) => set("headlineBefore", e.target.value)}
                    placeholder="We bring"
                    className="rounded-[12px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headlineHighlight">Highlighted text (blue)</Label>
                  <Input
                    id="headlineHighlight"
                    value={values.headlineHighlight}
                    onChange={(e) => set("headlineHighlight", e.target.value)}
                    placeholder="the leads."
                    className="rounded-[12px] font-medium text-[#0061FF]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headlineLine2">Line 2</Label>
                <Input
                  id="headlineLine2"
                  value={values.headlineLine2}
                  onChange={(e) => set("headlineLine2", e.target.value)}
                  placeholder="You close the deal."
                  className="rounded-[12px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="description">Description</Label>
                  <span className="text-[11px] text-slate-400">{values.description.length} chars</span>
                </div>
                <Textarea
                  id="description"
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                  className="rounded-[12px] resize-y"
                />
              </div>

              <div className="rounded-[12px] border border-[#0061FF]/15 bg-gradient-to-br from-[#E8F0FF]/50 to-white p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#0061FF]/70">Live preview</p>
                <p className="mt-2 font-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {values.headlineBefore}{" "}
                  <span className="text-[#0061FF]">{values.headlineHighlight}</span>
                </p>
                <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {values.headlineLine2}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">{values.description}</p>
              </div>
            </div>
          </section>

          <HeroSlidesEditor
            values={values}
            busy={busy}
            onChange={setValues}
            onBusyChange={setBusy}
            onError={setError}
          />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[12px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Publish</p>
                <p className="text-xs text-slate-500">Show on live homepage</p>
              </div>
              <Switch
                checked={values.published}
                onCheckedChange={(checked) => set("published", checked)}
              />
            </div>

            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <StatusRow ok={Boolean(values.headlineBefore && values.headlineHighlight && values.headlineLine2)}>
                Headline complete
              </StatusRow>
              <StatusRow ok={Boolean(values.description.trim())}>Description added</StatusRow>
              <StatusRow ok={slideStats.total > 0}>
                {slideStats.total > 0 ? `${slideStats.total} slide(s) ready` : "Add at least 1 slide"}
              </StatusRow>
            </ul>

            {error ? (
              <p className="mt-4 rounded-[12px] bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            ) : null}

            <Button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Save hero
            </Button>
          </div>

          {values.slides.length > 0 ? (
            <div className="rounded-[12px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Slide overview</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {values.slides.slice(0, 6).map((slide, index) => {
                  const src = slide.type === "image" ? slide.mediaUrl : slide.posterUrl || slide.mediaUrl;
                  return (
                    <div
                      key={slide.id ?? `overview-${index}`}
                      className="relative overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50"
                    >
                      {src ? (
                        <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                          {slide.type === "video" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 rounded-[6px] bg-black/60 px-1 text-[9px] font-medium text-white">
                        {index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
              {values.slides.length > 6 ? (
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  +{values.slides.length - 6} more
                </p>
              ) : null}
            </div>
          ) : null}
        </aside>
      </form>
    </div>
  );
}

function StatusRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", ok ? "text-emerald-500" : "text-slate-300")} />
      <span className={ok ? "text-slate-700" : "text-slate-400"}>{children}</span>
    </li>
  );
}
