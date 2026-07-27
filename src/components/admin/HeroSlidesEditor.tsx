import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Loader2,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  Repeat,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  defaultHeroCarousel,
  emptyHeroSlide,
  type HeroCarouselSettings,
  type HeroContent,
  type HeroMediaType,
  type HeroSlide,
} from "@/data/hero";
import { newId } from "@/lib/cms-store";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { cn } from "@/lib/utils";

type HeroSlidesEditorProps = {
  values: HeroContent;
  busy: boolean;
  onChange: (next: HeroContent) => void;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string) => void;
};

export function HeroSlidesEditor({
  values,
  busy,
  onChange,
  onBusyChange,
  onError,
}: HeroSlidesEditorProps) {
  const slides = [...values.slides].sort((a, b) => a.sortOrder - b.sortOrder);
  const carousel = values.carousel ?? defaultHeroCarousel;
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUrls, setShowUrls] = useState(false);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(Math.max(0, slides.length - 1));
    }
  }, [activeIndex, slides.length]);

  const setSlides = (nextSlides: HeroSlide[]) => {
    onChange({
      ...values,
      slides: nextSlides.map((slide, index) => ({ ...slide, sortOrder: index })),
    });
  };

  const setCarousel = (patch: Partial<HeroCarouselSettings>) => {
    onChange({
      ...values,
      carousel: { ...carousel, ...patch },
    });
  };

  const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
    const next = slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide));
    setSlides(next);
  };

  const addSlide = (type: HeroMediaType) => {
    const next = [...slides, { ...emptyHeroSlide(slides.length), id: newId("hs"), type }];
    setSlides(next);
    setActiveIndex(next.length - 1);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
    setActiveIndex((current) => (index <= current ? Math.max(0, current - 1) : current));
    toast.success("Slide removed");
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    setActiveIndex(target);
  };

  const uploadForSlide = async (
    index: number,
    file: File | null,
    field: "mediaUrl" | "posterUrl",
  ) => {
    if (!file) return;
    try {
      onBusyChange(true);
      const slide = slides[index];
      const folder =
        field === "posterUrl"
          ? "hero/posters"
          : slide.type === "video"
            ? "hero/videos"
            : "hero/images";
      const { url } = await uploadToCloudinary(file, folder);
      const patch: Partial<HeroSlide> = { [field]: url };
      if (
        field === "mediaUrl" &&
        slide.type === "video" &&
        !slide.posterUrl &&
        file.type.startsWith("image/")
      ) {
        patch.posterUrl = url;
      }
      updateSlide(index, patch);
      toast.success("Uploaded");
    } catch (e) {
      onError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      onBusyChange(false);
    }
  };

  const activeSlide = slides[activeIndex];
  const intervalSec = Math.round(carousel.autoplayIntervalMs / 1000);

  return (
    <section className="overflow-hidden rounded-[12px] border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-[#E8F0FF]/60 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0061FF] text-white">
            <Layers className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Hero slides</h2>
              <Badge variant="secondary" className="rounded-[12px] bg-[#E8F0FF] text-[10px] text-[#0061FF] hover:bg-[#E8F0FF]">
                {slides.length} {slides.length === 1 ? "slide" : "slides"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Mix images and videos in any order. Visitors see a carousel on the homepage.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[12px] border-slate-200"
            onClick={() => addSlide("image")}
          >
            <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Add image
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
            onClick={() => addSlide("video")}
          >
            <Video className="mr-1.5 h-3.5 w-3.5" /> Add video
          </Button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {slides.length === 0 ? (
          <EmptySlides onAddImage={() => addSlide("image")} onAddVideo={() => addSlide("video")} />
        ) : (
          <>
            {/* Filmstrip */}
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Slide order
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id ?? `thumb-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "group relative shrink-0 overflow-hidden rounded-[12px] border-2 transition",
                      activeIndex === index
                        ? "border-[#0061FF] ring-2 ring-[#0061FF]/20"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <SlideThumb slide={slide} />
                    <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-[8px] bg-white/90 text-[10px] font-bold text-slate-700 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="absolute bottom-1.5 right-1.5 rounded-[8px] bg-slate-900/70 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                      {slide.type}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addSlide("image")}
                  className="flex h-[72px] w-[112px] shrink-0 flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-[#0061FF]/40 hover:bg-[#E8F0FF]/30 hover:text-[#0061FF]"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-[10px] font-medium">Add</span>
                </button>
              </div>
            </div>

            {/* Active slide editor */}
            {activeSlide ? (
              <article className="overflow-hidden rounded-[12px] border border-slate-200/80 bg-slate-50/30">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-slate-300" />
                    <span className="text-sm font-semibold text-slate-900">
                      Editing slide {activeIndex + 1}
                    </span>
                    <Badge
                      className={cn(
                        "rounded-[12px] text-[10px] capitalize",
                        activeSlide.type === "video"
                          ? "bg-violet-50 text-violet-700 hover:bg-violet-50"
                          : "bg-sky-50 text-sky-700 hover:bg-sky-50",
                      )}
                    >
                      {activeSlide.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[12px] px-2.5 text-xs"
                      disabled={activeIndex === 0}
                      onClick={() => moveSlide(activeIndex, -1)}
                    >
                      <ArrowUp className="mr-1 h-3.5 w-3.5" /> Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[12px] px-2.5 text-xs"
                      disabled={activeIndex === slides.length - 1}
                      onClick={() => moveSlide(activeIndex, 1)}
                    >
                      <ArrowDown className="mr-1 h-3.5 w-3.5" /> Down
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-[12px] border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[12px]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove this slide?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Slide {activeIndex + 1} will be removed from the carousel. Save hero to apply on the live site.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-[12px]">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-[12px] bg-red-600 hover:bg-red-700"
                            onClick={() => removeSlide(activeIndex)}
                          >
                            Remove slide
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,280px)_1fr]">
                  {/* Preview / upload zone */}
                  <div className="space-y-3">
                    <SlidePreview
                      slide={activeSlide}
                      busy={busy}
                      onUpload={(file) => void uploadForSlide(activeIndex, file, "mediaUrl")}
                    />
                    {activeSlide.type === "video" && activeSlide.mediaUrl ? (
                      <div className="rounded-[12px] border border-slate-200 bg-white p-3">
                        <Label className="text-xs text-slate-600">Poster thumbnail</Label>
                        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-dashed border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[#0061FF]/40 hover:bg-[#E8F0FF]/20">
                          <Upload className="h-3.5 w-3.5" />
                          {activeSlide.posterUrl ? "Replace poster" : "Upload poster"}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            disabled={busy}
                            onChange={(e) =>
                              void uploadForSlide(activeIndex, e.target.files?.[0] ?? null, "posterUrl")
                            }
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>

                  {/* Controls */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Media type</Label>
                      <div className="inline-flex rounded-[12px] border border-slate-200 bg-white p-1">
                        {(["image", "video"] as HeroMediaType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => updateSlide(activeIndex, { type })}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-sm font-medium transition",
                              activeSlide.type === type
                                ? "bg-[#0061FF] text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50",
                            )}
                          >
                            {type === "video" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                            {type === "video" ? "Video" : "Image"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[12px] border border-slate-200 bg-white p-4">
                      <button
                        type="button"
                        onClick={() => setShowUrls((v) => !v)}
                        className="flex w-full items-center justify-between text-left text-sm font-medium text-slate-800"
                      >
                        Advanced: paste URL
                        <span className="text-xs font-normal text-slate-400">{showUrls ? "Hide" : "Show"}</span>
                      </button>
                      {showUrls ? (
                        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              {activeSlide.type === "video" ? "Video URL" : "Image URL"}
                            </Label>
                            <Input
                              value={activeSlide.mediaUrl}
                              onChange={(e) => updateSlide(activeIndex, { mediaUrl: e.target.value })}
                              placeholder="https://…"
                              className="rounded-[12px] font-mono text-xs"
                            />
                          </div>
                          {activeSlide.type === "video" ? (
                            <div className="space-y-1.5">
                              <Label className="text-xs">Poster URL</Label>
                              <Input
                                value={activeSlide.posterUrl}
                                onChange={(e) => updateSlide(activeIndex, { posterUrl: e.target.value })}
                                placeholder="https://…"
                                className="rounded-[12px] font-mono text-xs"
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ) : null}
          </>
        )}

        {/* Carousel settings */}
        <div className="mt-6 rounded-[12px] border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-[#0061FF]" />
            <h3 className="text-sm font-semibold text-slate-900">Carousel behavior</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            These settings apply to all slides on the live homepage.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <SettingsGroup title="Playback" icon={Clock}>
              <ToggleRow
                icon={Play}
                label="Autoplay"
                description="Advance slides automatically"
                checked={carousel.autoplay}
                onCheckedChange={(checked) => setCarousel({ autoplay: checked })}
              />
              <ToggleRow
                icon={Repeat}
                label="Loop"
                description="Return to first slide after the last"
                checked={carousel.loop}
                onCheckedChange={(checked) => setCarousel({ loop: checked })}
              />
              <ToggleRow
                icon={Pause}
                label="Pause on hover"
                description="Stop autoplay while hovering"
                checked={carousel.pauseOnHover}
                onCheckedChange={(checked) => setCarousel({ pauseOnHover: checked })}
              />
              <div
                className={cn(
                  "rounded-[12px] border border-slate-200 bg-white px-4 py-3 transition",
                  !carousel.autoplay && "opacity-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-medium text-slate-900">Autoplay speed</Label>
                  <span className="rounded-[12px] bg-[#E8F0FF] px-2 py-0.5 text-xs font-semibold text-[#0061FF]">
                    {intervalSec}s
                  </span>
                </div>
                <Slider
                  className="mt-3"
                  min={2}
                  max={30}
                  step={1}
                  disabled={!carousel.autoplay}
                  value={[intervalSec]}
                  onValueChange={([value]) =>
                    setCarousel({ autoplayIntervalMs: (value ?? 5) * 1000 })
                  }
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>2s fast</span>
                  <span>30s slow</span>
                </div>
              </div>
            </SettingsGroup>

            <SettingsGroup title="Navigation" icon={MousePointerClick}>
              <ToggleRow
                label="Show dots"
                description="Pagination dots below slides"
                checked={carousel.showDots}
                onCheckedChange={(checked) => setCarousel({ showDots: checked })}
              />
              <ToggleRow
                label="Show arrows"
                description="Previous / next buttons"
                checked={carousel.showArrows}
                onCheckedChange={(checked) => setCarousel({ showArrows: checked })}
              />
              <div className="rounded-[12px] border border-dashed border-slate-200 bg-white/80 px-4 py-3 text-xs leading-relaxed text-slate-500">
                Tip: With 1 slide, arrows and dots are hidden automatically on the live site.
              </div>
            </SettingsGroup>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptySlides({
  onAddImage,
  onAddVideo,
}: {
  onAddImage: () => void;
  onAddVideo: () => void;
}) {
  return (
    <div className="rounded-[12px] border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#E8F0FF] text-[#0061FF]">
        <Layers className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">Build your hero carousel</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Add image or video slides. Reorder them, mix types, and control autoplay from here.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" className="rounded-[12px]" onClick={onAddImage}>
          <ImageIcon className="mr-1.5 h-4 w-4" /> Add image slide
        </Button>
        <Button type="button" className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]" onClick={onAddVideo}>
          <Video className="mr-1.5 h-4 w-4" /> Add video slide
        </Button>
      </div>
    </div>
  );
}

function SlideThumb({ slide }: { slide: HeroSlide }) {
  const src =
    slide.type === "image"
      ? slide.mediaUrl
      : slide.posterUrl || slide.mediaUrl;

  if (!src) {
    return (
      <div className="flex h-[72px] w-[112px] items-center justify-center bg-slate-100 text-slate-300">
        {slide.type === "video" ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
      </div>
    );
  }

  return <img src={src} alt="" className="h-[72px] w-[112px] object-cover" />;
}

function SlidePreview({
  slide,
  busy,
  onUpload,
}: {
  slide: HeroSlide;
  busy: boolean;
  onUpload: (file: File) => void;
}) {
  const previewSrc =
    slide.type === "image" ? slide.mediaUrl : slide.posterUrl || slide.mediaUrl;

  if (previewSrc) {
    return (
      <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
        {slide.type === "image" ? (
          <img src={slide.mediaUrl} alt="" className="aspect-[16/10] w-full object-cover" />
        ) : (
          <div className="relative">
            <img src={previewSrc} alt="" className="aspect-[16/10] w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#0061FF] shadow">
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </span>
            </span>
          </div>
        )}
        <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-slate-100 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Replace media
          <input
            type="file"
            accept={slide.type === "video" ? "video/*,image/*" : "image/*"}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex aspect-[16/10] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-slate-200 bg-white px-4 text-center transition",
        busy ? "pointer-events-none opacity-60" : "hover:border-[#0061FF]/50 hover:bg-[#E8F0FF]/20",
      )}
    >
      {busy ? (
        <Loader2 className="h-8 w-8 animate-spin text-[#0061FF]" />
      ) : slide.type === "video" ? (
        <Video className="h-8 w-8 text-slate-300" />
      ) : (
        <ImageIcon className="h-8 w-8 text-slate-300" />
      )}
      <p className="mt-2 text-sm font-medium text-slate-700">
        {busy ? "Uploading…" : `Upload ${slide.type}`}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">Click or drag a file here</p>
      <input
        type="file"
        accept={slide.type === "video" ? "video/*,image/*" : "image/*"}
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </label>
  );
}

function SettingsGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        {Icon ? <Icon className="h-3.5 w-3.5 text-slate-400" /> : null}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[12px] border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon ? (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-slate-500">
            <Icon className="h-3.5 w-3.5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
