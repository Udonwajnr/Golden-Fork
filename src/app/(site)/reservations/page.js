"use client";

import { useState } from "react";
import { Loader2, CalendarClock, Users, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";

export default function ReservationsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    date: "",
    time: "",
    partySize: 2,
    occasion: "none",
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.time) {
      toast.error("Please choose a date and time.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestInfo: { name: form.name, email: form.email, phone: form.phone },
          partySize: Number(form.partySize),
          date: new Date(`${form.date}T${form.time}`).toISOString(),
          occasion: form.occasion,
          specialRequests: form.specialRequests,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Could not submit reservation");
        return;
      }
      setSubmitted(true);
      toast.success("Reservation request sent!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <PartyPopper className="mx-auto size-12 text-gf-gold" />
        <h1 className="mt-4 font-display text-3xl text-gf-cream">Request Sent</h1>
        <p className="mt-3 text-gf-muted">
          We&apos;ll confirm your table for {form.partySize} on{" "}
          {new Date(`${form.date}T${form.time}`).toLocaleString()} shortly by email.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Make Another Reservation
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <CalendarClock className="mx-auto size-10 text-gf-gold" />
        <h1 className="mt-4 font-display text-4xl text-gf-cream">Reserve a Table</h1>
        <p className="mt-2 text-gf-muted">Tue – Sun, 5:30 PM – 10:30 PM. Closed Mondays.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partySize" className="flex items-center gap-1.5">
              <Users className="size-3.5" /> Guests
            </Label>
            <Input
              id="partySize"
              type="number"
              min={1}
              max={30}
              value={form.partySize}
              onChange={(e) => setForm({ ...form, partySize: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="occasion">Occasion</Label>
          <Select value={form.occasion} onValueChange={(v) => setForm({ ...form, occasion: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Just dinner</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="date">Date Night</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requests">Special requests (optional)</Label>
          <Textarea
            id="requests"
            placeholder="Window seat, high chair, dietary restrictions..."
            value={form.specialRequests}
            onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
          />
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Request Reservation
        </Button>
      </form>
    </div>
  );
}
