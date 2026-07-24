import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getCloudinaryStatus } from "@/lib/cloudinary-upload";

export const Route = createFileRoute("/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [cloudinary, setCloudinary] = useState<{
    configured: boolean;
    cloudName: string | null;
    folder: string;
  } | null>(null);

  useEffect(() => {
    void getCloudinaryStatus()
      .then(setCloudinary)
      .catch(() => setCloudinary({ configured: false, cloudName: null, folder: "syncreach" }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Site-wide CMS preferences. Media uploads go through the MERN backend → Cloudinary.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
          <h2 className="font-semibold text-slate-900">Brand</h2>
          <div className="space-y-2">
            <Label htmlFor="site-name">Site name</Label>
            <Input id="site-name" defaultValue="SyncReach" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              defaultValue="Sync today, reach tomorrow."
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support">Support email</Label>
            <Input id="support" defaultValue="Sabidkhan@gmail.com" className="rounded-xl" />
          </div>
          <Button className="rounded-xl bg-[#0061FF] hover:bg-[#0052D6]">Save brand</Button>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
          <h2 className="font-semibold text-slate-900">Publishing</h2>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Show reviews on homepage</div>
              <div className="text-xs text-slate-500">3D marquee section</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Show gallery on homepage</div>
              <div className="text-xs text-slate-500">Dual marquee preview</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Featured-only mode</div>
              <div className="text-xs text-slate-500">Only featured reviews on home</div>
            </div>
            <Switch />
          </div>
          <Button className="rounded-xl bg-[#0061FF] hover:bg-[#0052D6]">Save publishing</Button>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Media providers</h2>
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            {cloudinary?.configured ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            )}
            <div>
              <div className="text-sm font-medium text-slate-900">
                Cloudinary {cloudinary?.configured ? "connected" : "not configured"}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {cloudinary?.configured
                  ? `Cloud: ${cloudinary.cloudName} · Folder: ${cloudinary.folder}. Keys live in backend/.env only.`
                  : "Start the API and set CLOUDINARY_* in backend/.env"}
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cloudinary">Cloudinary cloud name</Label>
              <Input
                id="cloudinary"
                readOnly
                value={cloudinary?.cloudName ?? ""}
                placeholder="from backend env"
                className="rounded-xl bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">Default YouTube channel</Label>
              <Input id="youtube" placeholder="https://youtube.com/@…" className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea
              id="notes"
              placeholder="Admin notes for the CMS rollout…"
              className="min-h-24 rounded-xl"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
