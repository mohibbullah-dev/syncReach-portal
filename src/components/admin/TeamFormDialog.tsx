import { useEffect, useState } from "react";
import {
  Facebook,
  Image as ImageIcon,
  Linkedin,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { TeamMember } from "@/data/team";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { newId } from "@/lib/cms-store";

export type TeamFormValues = Omit<TeamMember, "id"> & { id?: string };

const emptyValues = (): TeamFormValues => ({
  name: "",
  role: "",
  img: "",
  facebookUrl: "https://facebook.com",
  linkedinUrl: "https://linkedin.com",
  sortOrder: 1,
  published: true,
});

function fromMember(member: TeamMember): TeamFormValues {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    img: member.img,
    facebookUrl: member.facebookUrl,
    linkedinUrl: member.linkedinUrl,
    sortOrder: member.sortOrder,
    published: member.published,
  };
}

type TeamFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: TeamMember | null;
  nextSortOrder?: number;
  onSave: (member: TeamMember) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
};

export function TeamFormDialog({
  open,
  onOpenChange,
  initial,
  nextSortOrder = 1,
  onSave,
  onDelete,
}: TeamFormDialogProps) {
  const editing = Boolean(initial);
  const [values, setValues] = useState<TeamFormValues>(emptyValues);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initial) setValues(fromMember(initial));
    else setValues({ ...emptyValues(), sortOrder: nextSortOrder });
  }, [open, initial, nextSortOrder]);

  const set = <K extends keyof TeamFormValues>(key: K, value: TeamFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const onPickPhoto = async (file: File | null) => {
    if (!file) return;
    try {
      setBusy(true);
      const { url } = await uploadToCloudinary(file, "team");
      set("img", url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (values.name.trim().length < 2) {
      setError("Name is required.");
      return;
    }
    if (values.role.trim().length < 2) {
      setError("Role is required.");
      return;
    }
    if (!values.img.trim()) {
      setError("Upload a photo or paste an image URL.");
      return;
    }

    const member: TeamMember = {
      id: values.id ?? newId("t"),
      name: values.name.trim(),
      role: values.role.trim(),
      img: values.img.trim(),
      facebookUrl: values.facebookUrl.trim() || "https://facebook.com",
      linkedinUrl: values.linkedinUrl.trim() || "https://linkedin.com",
      sortOrder: Number(values.sortOrder) || 1,
      published: values.published,
    };

    try {
      setBusy(true);
      await onSave(member);
      toast.success(editing ? "Team member updated" : "Team member added");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-slate-200 p-0 sm:max-w-lg">
        <div className="border-b border-slate-100 bg-gradient-to-br from-[#E8F0FF] via-white to-white px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-slate-900">
              {editing ? "Edit profile" : "Add team member"}
            </DialogTitle>
            <DialogDescription>
              People shown on the public Team section of the marketing site.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-5">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#0061FF]/35 bg-[#E8F0FF]/25 p-5">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-[#0061FF]/25 bg-white shadow-sm">
              {values.img ? (
                <img src={values.img} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-300" />
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0061FF]">
              <Upload className="h-4 w-4" />
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onPickPhoto(e.target.files?.[0] ?? null)}
              />
            </label>
            <Input
              value={values.img}
              onChange={(e) => set("img", e.target.value)}
              placeholder="Or paste image URL"
              className="h-10 rounded-xl bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-name">Full name</Label>
            <Input
              id="team-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Md Sabid Khan"
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-role">Role / title</Label>
            <Input
              id="team-role"
              value={values.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Co-Founder & CEO"
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team-fb" className="inline-flex items-center gap-1.5">
                <Facebook className="h-3.5 w-3.5 text-[#0061FF]" />
                Facebook URL
              </Label>
              <Input
                id="team-fb"
                value={values.facebookUrl}
                onChange={(e) => set("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/…"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-li" className="inline-flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5 text-[#0061FF]" />
                LinkedIn URL
              </Label>
              <Input
                id="team-li"
                value={values.linkedinUrl}
                onChange={(e) => set("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team-order">Sort order</Label>
              <Input
                id="team-order"
                type="number"
                min={1}
                value={values.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value) || 1)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Published</div>
                <div className="text-xs text-slate-500">Show on public site</div>
              </div>
              <Switch checked={values.published} onCheckedChange={(v) => set("published", v)} />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {editing && onDelete && values.id ? (
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  onDelete(values.id!);
                  toast.success("Team member removed");
                  onOpenChange(false);
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-[#0061FF] hover:bg-[#0052D6]"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editing ? (
                  "Save profile"
                ) : (
                  "Add member"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
