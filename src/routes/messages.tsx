import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Inbox,
  Mail,
  MailOpen,
  Reply,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContactMessage } from "@/data/contact";
import {
  deleteCmsMessage,
  getCmsMessages,
  markCmsMessageRead,
} from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  component: AdminMessagesPage,
});

function formatWhen(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return iso;
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

const avatarTones = [
  "bg-[#E8F0FF] text-[#0061FF]",
  "bg-[#F3E8FF] text-[#7C3AED]",
  "bg-[#E7F8EF] text-[#16A34A]",
  "bg-[#FFF1E6] text-[#EA580C]",
] as const;

function toneFor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return avatarTones[n % avatarTones.length]!;
}

function AdminMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await getCmsMessages());
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const unread = useMemo(() => items.filter((m) => !m.read).length, [items]);

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.read) {
      try {
        const next = await markCmsMessageRead(msg.id);
        setItems(next);
        setSelected(next.find((m) => m.id === msg.id) ?? { ...msg, read: true });
      } catch {
        /* keep local */
      }
    }
  };

  const remove = async (id: string) => {
    try {
      setItems(await deleteCmsMessage(id));
      if (selected?.id === id) setSelected(null);
      toast.success("Message deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Messages
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            People who wrote to you from the website contact form.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm">
            <Inbox className="h-4 w-4 text-[#0061FF]" />
            <span className="font-semibold text-slate-900">{items.length}</span>
            <span className="text-slate-500">total</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#0061FF]/20 bg-[#F4F8FF] px-3.5 py-2 text-sm">
            <Mail className="h-4 w-4 text-[#0061FF]" />
            <span className="font-semibold text-[#0061FF]">{unread}</span>
            <span className="text-[#0061FF]/80">new</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-slate-200/70 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] lg:grid lg:grid-cols-5 lg:min-h-[560px]">
        {/* Inbox list */}
        <div className="border-b border-slate-100 lg:col-span-2 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#F4F8FF] to-white px-4 py-3.5">
            <div className="text-sm font-semibold text-slate-900">Inbox</div>
            {unread > 0 ? (
              <Badge className="rounded-[12px] bg-[#0061FF] px-2.5 text-[10px] text-white hover:bg-[#0061FF]">
                {unread} new
              </Badge>
            ) : null}
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-11 w-11 rounded-[12px] bg-slate-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#E8F0FF] text-[#0061FF]">
                <MailOpen className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-900">No messages yet</p>
              <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-500">
                When someone sends a message from your website, it will appear here.
              </p>
            </div>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto lg:max-h-[calc(560px-3.25rem)]">
              {items.map((m) => {
                const active = selected?.id === m.id;
                return (
                  <li key={m.id} className="border-b border-slate-50 last:border-0">
                    <button
                      type="button"
                      onClick={() => void openMessage(m)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3.5 text-left transition",
                        active
                          ? "bg-[#E8F0FF]"
                          : "hover:bg-slate-50",
                        !m.read && !active && "bg-[#F8FAFF]",
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-xs font-bold",
                          toneFor(m.id),
                        )}
                      >
                        {initials(m.name)}
                        {!m.read ? (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-[12px] border-2 border-white bg-[#0061FF]" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "truncate text-sm text-slate-900",
                              !m.read ? "font-semibold" : "font-medium",
                            )}
                          >
                            {m.name}
                          </span>
                          <span className="ml-auto shrink-0 text-[11px] text-slate-400">
                            {formatWhen(m.createdAt)}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-slate-500">
                          {m.company || m.email}
                        </div>
                        <p
                          className={cn(
                            "mt-1 line-clamp-1 text-xs",
                            !m.read ? "font-medium text-slate-600" : "text-slate-400",
                          )}
                        >
                          {m.message}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail pane */}
        <div className="relative flex flex-col bg-gradient-to-b from-white to-slate-50/40 lg:col-span-3">
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-slate-100 text-slate-400">
                <Mail className="h-7 w-7" />
              </div>
              <p className="text-base font-semibold text-slate-900">Select a message</p>
              <p className="mt-1.5 max-w-xs text-sm text-slate-500">
                Choose a message from the left to read the full inquiry and reply by email.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-3.5">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] text-sm font-bold",
                        toneFor(selected.id),
                      )}
                    >
                      {initials(selected.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                        {selected.name}
                      </h2>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-sm text-[#0061FF] hover:underline"
                      >
                        {selected.email}
                      </a>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {selected.company ? (
                          <span className="inline-flex items-center gap-1 rounded-[12px] bg-slate-100 px-2 py-1 font-medium text-slate-600">
                            <Building2 className="h-3 w-3" />
                            {selected.company}
                          </span>
                        ) : null}
                        <span>{formatWhen(selected.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-[12px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => void remove(selected.id)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex-1 px-5 py-6 sm:px-7">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Message
                </div>
                <div className="rounded-[12px] border border-slate-200/80 bg-white px-5 py-5 text-[15px] leading-relaxed whitespace-pre-wrap text-slate-700 shadow-sm">
                  {selected.message}
                </div>
              </div>

              <div className="border-t border-slate-100 bg-white/80 px-5 py-4 sm:px-7">
                <Button
                  asChild
                  className="h-11 rounded-[12px] bg-[#0061FF] px-5 hover:bg-[#0052D6]"
                >
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: SyncReach inquiry")}`}>
                    <Reply className="mr-2 h-4 w-4" />
                    Reply by email
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
