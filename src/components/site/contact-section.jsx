"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";

export function ContactSection() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.message.trim().length < 10) {
      toast.error("Please write a bit more so we can help.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Could not send your message");
        return;
      }
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="bg-gf-bg py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gf-gold">Get in Touch</p>
          <h2 className="mt-3 font-display text-4xl text-gf-cream sm:text-5xl">Contact Us</h2>
          <p className="mx-auto mt-3 max-w-xl text-gf-muted">
            Questions about a reservation, a private event, or anything else? Send us a note
            and we&apos;ll get back to you.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="size-5 shrink-0 text-gf-gold" />
              <div>
                <p className="text-sm font-medium text-gf-cream">Visit Us</p>
                <p className="text-sm text-gf-muted">124 Luxury Avenue, Culinary District</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="size-5 shrink-0 text-gf-gold" />
              <div>
                <p className="text-sm font-medium text-gf-cream">Call Us</p>
                <p className="text-sm text-gf-muted">+1 (212) 555-0199</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="size-5 shrink-0 text-gf-gold" />
              <div>
                <p className="text-sm font-medium text-gf-cream">Email Us</p>
                <p className="text-sm text-gf-muted">reservations@thegoldenfork.com</p>
              </div>
            </div>
            <div className="rounded-lg border border-gf-border bg-gf-bg-card p-5">
              <p className="text-sm font-medium text-gf-cream">Hours</p>
              <p className="mt-1 text-sm text-gf-muted">Tuesday – Sunday: 5:30 PM – 10:30 PM</p>
              <p className="text-sm text-gf-muted">Closed Mondays</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gf-border bg-gf-bg-card p-10 text-center">
                <CheckCircle2 className="size-10 text-gf-success" />
                <h3 className="mt-4 font-display text-2xl text-gf-cream">Message Sent</h3>
                <p className="mt-2 text-gf-muted">
                  Thanks, {form.name.split(" ")[0]}. We&apos;ll be in touch soon.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-lg border border-gf-border bg-gf-bg-card p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}