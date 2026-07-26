import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { FaqItem } from "@/data/faq";
import { newId } from "@/lib/cms-store";

export type FaqFormValues = Omit<FaqItem, "id"> & { id?: string };

const emptyValues = (): FaqFormValues => ({
  question: "",
  answer: "",
  sortOrder: 1,
  published: true,
});

function fromItem(item: FaqItem): FaqFormValues {
  return {
    id: item.id,
    question: item.question,
    answer: item.answer,
    sortOrder: item.sortOrder,
    published: item.published,
  };
}

type FaqFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: FaqItem | null;
  nextSortOrder?: number;
  onSave: (item: FaqItem) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
};

export function FaqFormDialog({
  open,
  onOpenChange,
  initial,
  nextSortOrder = 1,
  onSave,
  onDelete,
}: FaqFormDialogProps) {
  const editing = Boolean(initial);
  const [values, setValues] = useState<FaqFormValues>(emptyValues);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initial) setValues(fromItem(initial));
    else setValues({ ...emptyValues(), sortOrder: nextSortOrder });
  }, [open, initial, nextSortOrder]);

  const set = <K extends keyof FaqFormValues>(key: K, value: FaqFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.question.trim() || !values.answer.trim()) {
      setError("Question and answer are required.");
      return;
    }
    try {
      setBusy(true);
      await onSave({
        id: values.id || newId("f"),
        question: values.question.trim(),
        answer: values.answer.trim(),
        sortOrder: Number(values.sortOrder) || 0,
        published: values.published,
      });
      toast.success(editing ? "FAQ updated" : "FAQ created");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save FAQ");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!initial?.id || !onDelete) return;
    if (!window.confirm("Delete this FAQ item?")) return;
    try {
      setBusy(true);
      await onDelete(initial.id);
      toast.success("FAQ deleted");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete FAQ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          <DialogDescription>
            Shown on the public FAQ accordion. Keep answers clear and concise.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(e) => void submit(e)}>
          <div className="space-y-2">
            <Label htmlFor="faq-q">Question</Label>
            <Input
              id="faq-q"
              value={values.question}
              onChange={(e) => set("question", e.target.value)}
              placeholder="How fast can SyncReach launch…"
              className="rounded-[12px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-a">Answer</Label>
            <Textarea
              id="faq-a"
              rows={5}
              value={values.answer}
              onChange={(e) => set("answer", e.target.value)}
              placeholder="Most clients are live within 14 days…"
              className="rounded-[12px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faq-order">Sort order</Label>
              <Input
                id="faq-order"
                type="number"
                value={values.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
                className="rounded-[12px]"
              />
            </div>
            <div className="flex items-end justify-between rounded-[12px] border border-slate-200 px-3 py-2">
              <div>
                <div className="text-sm font-medium text-slate-900">Published</div>
                <div className="text-xs text-slate-500">Visible on site</div>
              </div>
              <Switch
                checked={values.published}
                onCheckedChange={(v) => set("published", v)}
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="submit"
              disabled={busy}
              className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Create FAQ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-[12px]"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {editing && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="ml-auto rounded-[12px] text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={busy}
                onClick={() => void remove()}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
