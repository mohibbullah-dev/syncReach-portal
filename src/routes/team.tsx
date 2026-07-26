import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Linkedin, Plus } from "lucide-react";

import { TeamFormDialog } from "@/components/admin/TeamFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/data/team";
import {
  deleteCmsTeamMember,
  getCmsTeam,
  upsertCmsTeamMember,
} from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/team")({
  component: AdminTeamPage,
});

function AdminTeamPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  useEffect(() => {
    void getCmsTeam()
      .then(setItems)
      .catch((e) => console.error(e));
  }, []);

  const list = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  );

  const nextSortOrder =
    items.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Team</h1>
          <p className="mt-1 text-sm text-slate-500">
            People shown on the public Team section. Add, edit, or hide members anytime.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add member
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-slate-500">
            No team members yet. Click <strong>Add member</strong> to create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => (
            <article
              key={m.id}
              className="rounded-[12px] border border-slate-200/80 bg-white p-6 text-center shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]"
            >
              <div className="relative mx-auto w-fit">
                <img
                  src={m.img}
                  alt={m.name}
                  className="mx-auto h-28 w-28 rounded-[12px] border-2 border-[#0061FF]/25 object-cover"
                />
                <Badge
                  className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-[12px] text-[10px]",
                    m.published
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {m.published ? "Live" : "Hidden"}
                </Badge>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{m.name}</h3>
              <p className="text-sm text-slate-500">{m.role}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <a
                  href={m.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-slate-200 text-slate-500 transition hover:border-[#0061FF]/40 hover:text-[#0061FF]"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href={m.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-slate-200 text-slate-500 transition hover:border-[#0061FF]/40 hover:text-[#0061FF]"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
              <Button
                variant="outline"
                className="mt-5 w-full rounded-[12px]"
                onClick={() => openEdit(m)}
              >
                Edit profile
              </Button>
            </article>
          ))}
        </div>
      )}

      <TeamFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        nextSortOrder={nextSortOrder}
        onSave={async (member) => setItems(await upsertCmsTeamMember(member))}
        onDelete={async (id) => setItems(await deleteCmsTeamMember(id))}
      />
    </div>
  );
}
