"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    quote:
      "Ordering ahead for pickup was seamless, and the food was just as good as eating in. The loyalty points already paid for my next dessert.",
    name: "Dara M.",
    role: "Regular Guest",
  },
  {
    quote:
      "The dine-in experience matched the online ordering perfectly — same care, same plating, even down to the little touches. Hard to find that kind of consistency.",
    name: "Theo R.",
    role: "First-time Visitor",
  },
  {
    quote:
      "We booked a private room for twelve through the site in under two minutes. The team had already prepped for our allergy notes by the time we arrived.",
    name: "Priyanka S.",
    role: "Private Dining Guest",
  },
  {
    quote:
      "I've referred three friends now just for the loyalty perks, but honestly I'd keep coming back for the Wagyu Striploin alone.",
    name: "Marcus L.",
    role: "Loyalty Member, Gold Tier",
  },
];

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % TESTIMONIALS.length),
    [],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length),
    [],
  );

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const current = TESTIMONIALS[index];

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="rounded-lg border border-gf-border bg-gf-bg-card p-8 sm:p-10">
        <div className="flex justify-center gap-1 text-gf-gold mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-4 fill-gf-gold" />
          ))}
        </div>
        <p className="min-h-24 font-display text-xl italic text-gf-cream leading-relaxed text-center sm:text-2xl">
          &quot;{current.quote}&quot;
        </p>
        <p className="mt-6 text-center text-sm font-medium text-gf-gold">
          {current.name}
        </p>
        <p className="text-center text-xs text-gf-muted">{current.role}</p>
      </div>

      <button
        onClick={prev}
        aria-label="Previous testimonial"
        className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 flex size-9 items-center justify-center rounded-full border border-gf-border bg-gf-bg-elevated text-gf-muted hover:border-gf-gold-dim hover:text-gf-gold sm:-translate-x-12"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={next}
        aria-label="Next testimonial"
        className="absolute right-0 top-1/2 translate-x-4 -translate-y-1/2 flex size-9 items-center justify-center rounded-full border border-gf-border bg-gf-bg-elevated text-gf-muted hover:border-gf-gold-dim hover:text-gf-gold sm:translate-x-12"
      >
        <ChevronRight className="size-4" />
      </button>

      <div className="mt-6 flex justify-center gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-gf-gold" : "w-1.5 bg-gf-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
