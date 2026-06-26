"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Mail, MailOpen, Archive, Trash2, CornerUpLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDateTime, cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_VARIANT = {
  new: "gold",
  read: "secondary",
  replied: "success",
  archived: "secondary",
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async (status) => {
    setIsLoading(true);
    try {
      const qs = status && status !== "all" ? `?status=${status}` : "";
      const res = await fetch(`/api/contact${qs}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filterStatus);
  }, [filterStatus, load]);

  async function updateStatus(id, status, extra = {}) {
    const res = await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error || "Could not update message");
      return;
    }
    load(filterStatus);
    return data.contactMessage;
  }

  async function openMessage(msg) {
    setSelected(msg);
    setNote(msg.adminNote || "");
    if (msg.status === "new") {
      await updateStatus(msg._id, "read");
    }
  }

  async function saveNote() {
    await updateStatus(selected._id, selected.status, { adminNote: note });
    toast.success("Note saved");
  }

  async function handleArchive(msg) {
    await updateStatus(msg._id, "archived");
    toast.success("Message archived");
    if (selected?._id === msg._id) setSelected(null);
  }

  async function handleDelete() {
    const res = await fetch(`/api/contact/${deleteTarget._id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Message deleted");
      setDeleteTarget(null);
      if (selected?._id === deleteTarget._id) setSelected(null);
      load(filterStatus);
    } else {
      toast.error(data.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl text-gf-cream">Contact Messages</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gf-border bg-gf-bg-card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gf-gold" />
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center text-gf-muted-2">No messages found.</div>
        ) : (
          <div className="divide-y divide-gf-border">
            {messages.map((msg) => (
              <button
                key={msg._id}
                onClick={() => openMessage(msg)}
                className={cn(
                  "flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-gf-bg-elevated/60",
                  msg.status === "new" && "bg-gf-gold/5"
                )}
              >
                <div className="mt-0.5 shrink-0 text-gf-gold">
                  {msg.status === "new" ? <Mail className="size-4" /> : <MailOpen className="size-4 text-gf-muted" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("truncate font-medium", msg.status === "new" ? "text-gf-cream" : "text-gf-muted")}>
                      {msg.name}
                    </p>
                    <span className="shrink-0 text-xs text-gf-muted-2">{msg.email}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gf-muted">{msg.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge variant={STATUS_VARIANT[msg.status]} className="capitalize text-[10px]">
                    {msg.status}
                  </Badge>
                  <span className="text-xs text-gf-muted-2">{formatDateTime(msg.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.email} · {selected && formatDateTime(selected.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-gf-bg-elevated p-4 text-sm text-gf-cream whitespace-pre-wrap">
            {selected?.message}
          </div>

          <div className="space-y-1.5">
            <Label>Internal note (not visible to customer)</Label>
            <Textarea
              placeholder="e.g. Called back, resolved billing question"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter className="flex-wrap sm:justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => selected && handleArchive(selected)}
              >
                <Archive className="size-3.5" /> Archive
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-gf-danger"
                onClick={() => setDeleteTarget(selected)}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={saveNote}>
                Save Note
              </Button>
              <Button size="sm" variant="gold" asChild>
                <a href={selected ? `mailto:${selected.email}?subject=${encodeURIComponent("Re: Your message to The Golden Fork")}` : "#"}>
                  <CornerUpLeft className="size-3.5" /> Reply by Email
                </a>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the message from {deleteTarget?.name}. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-gf-danger text-white hover:bg-gf-danger/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}