"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Check, X as XIcon, Armchair } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_VARIANT = {
  pending: "secondary",
  confirmed: "gold",
  seated: "success",
  completed: "success",
  cancelled: "danger",
  "no-show": "danger",
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState([]);

  const load = useCallback(async (status) => {
    setIsLoading(true);
    try {
      const qs = status && status !== "all" ? `?status=${status}` : "";
      const [resRes, tableRes] = await Promise.all([
        fetch(`/api/reservations${qs}`),
        fetch("/api/tables"),
      ]);
      const resData = await resRes.json();
      const tableData = await tableRes.json();
      setReservations(resData.reservations || []);
      setTables(tableData.tables || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filterStatus);
  }, [filterStatus, load]);

  async function updateStatus(id, status, extra = {}) {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error || "Could not update reservation");
      return;
    }
    toast.success(`Reservation ${status}`);
    load(filterStatus);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl text-gf-cream">Reservations</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="seated">Seated</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gf-border bg-gf-bg-card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gf-gold" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>
                    <p className="font-medium text-gf-cream">{r.guestInfo?.name}</p>
                    <p className="text-xs text-gf-muted">{r.guestInfo?.phone}</p>
                  </TableCell>
                  <TableCell>{r.partySize}</TableCell>
                  <TableCell className="text-gf-muted">{formatDateTime(r.date)}</TableCell>
                  <TableCell>
                    <Select
                      value={r.table?._id || ""}
                      onValueChange={(v) => updateStatus(r._id, r.status, { table: v })}
                    >
                      <SelectTrigger size="sm" className="w-32">
                        <SelectValue placeholder="Assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((t) => (
                          <SelectItem key={t._id} value={t._id}>{t.label} ({t.capacity})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status]} className="capitalize">{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(r._id, "confirmed")}>
                            <Check className="size-3.5" /> Confirm
                          </Button>
                          <Button size="sm" variant="outline" className="text-gf-danger" onClick={() => updateStatus(r._id, "cancelled")}>
                            <XIcon className="size-3.5" /> Cancel
                          </Button>
                        </>
                      )}
                      {r.status === "confirmed" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r._id, "seated")}>
                          <Armchair className="size-3.5" /> Seat
                        </Button>
                      )}
                      {r.status === "seated" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r._id, "completed")}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {reservations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-gf-muted-2">
                    No reservations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
