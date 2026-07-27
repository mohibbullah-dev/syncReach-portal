import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Image as ImageIcon, Loader2, Sparkles, Upload, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { defaultHeroContent, type HeroContent, type HeroMediaType } from "@/data/hero";
import { getCmsHero, upsertCmsHero } from "@/lib/cms-store";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
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

  const onPickMedia = async (file: File | null) => {
    if (!file) return;
    try {
      setBusy(true);
      const folder = values.mediaType === "video" ? "hero/videos" : "hero/images";
      const { url } = await uploadToCloudinary(file, folder);
      set("mediaUrl", url);
      if (file.type.startsWith("image/") && values.mediaType === "video" && !values.posterUrl) {
        set("posterUrl", url);
      }
      toast.success("Media uploaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onPickPoster = async (file: File | null) => {
    if (!file) return;
    try {
      setBusy(true);
      const { url } = await uploadToCloudinary(file, "hero/posters");
      set("posterUrl", url);
      toast.success("Poster uploaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

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

  const previewPoster =
    values.posterUrl ||
    (values.mediaType === "image" ? values.mediaUrl : "");

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading hero content…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Hero section</h1>
        <p className="mt-1 text-sm text-slate-500">
          Edit the homepage hero headline, description, and right-side media. Layout and colors stay fixed on the site.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-[12px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
            <h2 className="text-sm font-semibold text-slate-900">Headline</h2>
            <p className="mt-1 text-xs text-slate-500">
              The highlighted phrase stays blue on the live site.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                  className="rounded-[12px] text-[#0061FF]"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="headlineLine2">Line 2</Label>
              <Input
                id="headlineLine2"
                value={values.headlineLine2}
                onChange={(e) => set("headlineLine2", e.target.value)}
                placeholder="You close the deal."
                className="rounded-[12px]"
              />
            </div>
            <div className="mt-4 rounded-[12px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Preview</p>
              <p className="mt-2 font-display text-xl font-extrabold tracking-tight text-slate-900">
                {values.headlineBefore}{" "}
                <span className="text-[#0061FF]">{values.headlineHighlight}</span>
              </p>
              <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-slate-900">
                {values.headlineLine2}
              </p>
            </div>
          </section>

          <section className="rounded-[12px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
            <h2 className="text-sm font-semibold text-slate-900">Description</h2>
            <div className="mt-4 space-y-2">
              <Label htmlFor="description">Paragraph under headline</Label>
              <Textarea
                id="description"
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                className="rounded-[12px] resize-y"
              />
            </div>
          </section>

          <section className="rounded-[12px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
            <h2 className="text-sm font-semibold text-slate-900">Right-side media</h2>
            <div className="mt-4 flex gap-2">
              {(["video", "image"] as HeroMediaType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("mediaType", type)}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] border px-4 py-2.5 text-sm font-medium transition",
                    values.mediaType === type
                      ? "border-[#0061FF] bg-[#E8F0FF] text-[#0061FF]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {type === "video" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  {type === "video" ? "Video" : "Image"}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="mediaUrl">
                {values.mediaType === "video" ? "Video URL" : "Image URL"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="mediaUrl"
                  value={values.mediaUrl}
                  onChange={(e) => set("mediaUrl", e.target.value)}
                  placeholder={values.mediaType === "video" ? "https://…/hero.mp4" : "https://…/hero.jpg"}
                  className="rounded-[12px]"
                />
                <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                  <input
                    type="file"
                    accept={values.mediaType === "video" ? "video/*" : "image/*"}
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => void onPickMedia(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            {values.mediaType === "video" ? (
              <div className="mt-4 space-y-2">
                <Label htmlFor="posterUrl">Video poster / thumbnail</Label>
                <div className="flex gap-2">
                  <Input
                    id="posterUrl"
                    value={values.posterUrl}
                    onChange={(e) => set("posterUrl", e.target.value)}
                    placeholder="https://…/poster.jpg"
                    className="rounded-[12px]"
                  />
                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={busy}
                      onChange={(e) => void onPickPoster(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[12px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Publish</p>
                <p className="text-xs text-slate-500">Show CMS hero on live site</p>
              </div>
              <Switch
                checked={values.published}
                onCheckedChange={(checked) => set("published", checked)}
              />
            </div>
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            <Button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Save hero
            </Button>
          </div>

          {previewPoster || values.mediaUrl ? (
            <div className="overflow-hidden rounded-[12px] border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
              <p className="border-b border-slate-100 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Media preview
              </p>
              {values.mediaType === "image" && values.mediaUrl ? (
                <img src={values.mediaUrl} alt="" className="aspect-[16/10] w-full object-cover" />
              ) : previewPoster ? (
                <img src={previewPoster} alt="" className="aspect-[16/10] w-full object-cover" />
              ) : values.mediaUrl ? (
                <video src={values.mediaUrl} className="aspect-[16/10] w-full object-cover" muted playsInline />
              ) : null}
            </div>
          ) : null}
        </aside>
      </form>
    </div>
  );
}
