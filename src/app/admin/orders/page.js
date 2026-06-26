"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Printer, Check, X as XIcon } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_FLOW = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "out-for-delivery",
  "completed",
];

const STATUS_VARIANT = {
  placed: "secondary",
  accepted: "gold",
  preparing: "warning",
  ready: "success",
  "out-for-delivery": "gold",
  completed: "success",
  rejected: "danger",
  cancelled: "danger",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [printOrder, setPrintOrder] = useState(null);

  const loadOrders = useCallback(async (status) => {
    setIsLoading(true);
    try {
      const qs = status && status !== "all" ? `?status=${status}` : "";
      const res = await fetch(`/api/orders${qs}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(filterStatus);
  }, [filterStatus, loadOrders]);

  async function updateStatus(orderId, status, extra = {}) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error || "Could not update order");
      return;
    }
    toast.success(`Order updated to "${status}"`);
    loadOrders(filterStatus);
  }

  function nextStatus(current) {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl text-gf-cream">Orders</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {[...STATUS_FLOW, "rejected", "cancelled"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
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
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium text-gf-cream">#{order.orderNumber}</TableCell>
                  <TableCell>{order.customer?.name || order.guestInfo?.name || "Guest"}</TableCell>
                  <TableCell className="capitalize">{order.type}</TableCell>
                  <TableCell className="text-gf-gold">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[order.status] || "secondary"} className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gf-muted">{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {order.status === "placed" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(order._id, "accepted")}
                          >
                            <Check className="size-3.5" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-gf-danger"
                            onClick={() => setRejectTarget(order)}
                          >
                            <XIcon className="size-3.5" /> Reject
                          </Button>
                        </>
                      )}
                      {nextStatus(order.status) && order.status !== "placed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(order._id, nextStatus(order.status))}
                        >
                          Mark {nextStatus(order.status)}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setPrintOrder(order)}>
                        <Printer className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-gf-muted-2">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order #{rejectTarget?.orderNumber}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (shown to the customer)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={async () => {
                await updateStatus(rejectTarget._id, "rejected", { rejectionReason: rejectReason });
                setRejectTarget(null);
                setRejectReason("");
              }}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!printOrder} onOpenChange={(o) => !o && setPrintOrder(null)}>
        <DialogContent className="print:border-0 print:shadow-none">
          <DialogHeader>
            <DialogTitle>Receipt — #{printOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {printOrder && (
            <div className="font-mono text-sm">
              <p className="text-gf-muted">{formatDateTime(printOrder.createdAt)}</p>
              <div className="mt-3 divide-y divide-gf-border">
                {printOrder.items.map((item) => (
                  <div key={item._id} className="flex justify-between py-1.5">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 border-t border-gf-border pt-3">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(printOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(printOrder.tax)}</span></div>
                <div className="flex justify-between font-bold text-gf-gold"><span>Total</span><span>{formatCurrency(printOrder.total)}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="gold" onClick={handlePrint}>
              <Printer className="size-4" /> Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
