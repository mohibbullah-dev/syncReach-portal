import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, Shield, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AdminUserAvatar } from "@/components/admin/AdminUserAvatar";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { Badge } from "@/components/ui/badge";
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
import {
  createCmsAdmin,
  deleteCmsUser,
  getCmsUsers,
} from "@/lib/cms-store";
import {
  isSuperAdmin,
  roleLabel,
  type AdminUser,
} from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !isSuperAdmin(user)) {
      void navigate({ to: "/" });
    }
  }, [user, navigate]);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await getCmsUsers());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin(user)) void load();
  }, [user]);

  if (!isSuperAdmin(user)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0061FF]" />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setBusy(true);
      setItems(await createCmsAdmin(form));
      toast.success("Admin account created");
      setOpen(false);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create admin");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this admin account?")) return;
    try {
      setItems(await deleteCmsUser(id));
      toast.success("Admin deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage Admin accounts. Only you (Super Admin) can delete admins.
          </p>
        </div>
        <Button
          onClick={() => {
            setError("");
            setOpen(true);
          }}
          className="rounded-xl bg-[#0061FF] hover:bg-[#0052D6]"
        >
          <UserPlus className="mr-1.5 h-4 w-4" /> Add admin
        </Button>
      </div>

      <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/70 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)]">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#0061FF]" />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((u) => {
              const isSelf = u.id === user?.id;
              const canDelete = u.role === "Admin" && !isSelf;
              return (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6"
                >
                  <AdminUserAvatar
                    name={u.name}
                    avatarUrl={u.avatarUrl}
                    className="h-11 w-11"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{u.name}</span>
                      {isSelf ? (
                        <Badge className="rounded-full bg-slate-100 text-[10px] text-slate-600 hover:bg-slate-100">
                          You
                        </Badge>
                      ) : null}
                      <Badge
                        className={cn(
                          "rounded-full text-[10px]",
                          u.role === "SuperAdmin"
                            ? "bg-[#E8F0FF] text-[#0061FF] hover:bg-[#E8F0FF]"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
                        )}
                      >
                        {u.role === "SuperAdmin" ? (
                          <span className="inline-flex items-center gap-1">
                            <Shield className="h-3 w-3" /> {roleLabel(u.role)}
                          </span>
                        ) : (
                          roleLabel(u.role)
                        )}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">{u.email}</div>
                  </div>
                  {canDelete ? (
                    <Button
                      variant="outline"
                      className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => void remove(u.id)}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Delete
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add admin</DialogTitle>
            <DialogDescription>
              They can manage CMS content, but cannot delete other admins.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full name</Label>
              <Input
                id="admin-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="h-11 rounded-xl"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="h-11 rounded-xl"
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="h-11 rounded-xl"
                placeholder="At least 6 characters"
              />
            </div>
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-[#0061FF] hover:bg-[#0052D6]"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <Plus className="mr-1.5 h-4 w-4" /> Create admin
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
