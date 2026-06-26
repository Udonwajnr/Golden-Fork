import Link from "next/link";
import { ArrowRight, Users, ChefHat, Award, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TestimonialsCarousel } from "@/components/site/testimonials-carousel";
import { ContactSection } from "@/components/site/contact-section";
import { connectDB } from "@/lib/db/connect";
import { MenuItem } from "@/models";

async function getFeaturedItems() {
  try {
    await connectDB();
    const items = await MenuItem.find({ isAvailable: true, isFeatured: true })
      .populate("category", "name")
      .limit(3)
      .lean();
    return items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedItems();

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2000')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gf-bg/70 via-gf-bg/60 to-gf-bg" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gf-gold">
            Modern American · Seasonal Tasting Menu
          </p>
          <h1 className="font-display text-5xl leading-[1.08] text-gf-cream sm:text-6xl lg:text-7xl">
            Every dish, <span className="text-gf-gold">a gold standard.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-gf-muted sm:text-lg">
            Order online for delivery or pickup, reserve your table for tonight,
            and taste a menu that changes with the seasons — crafted by hand,
            served without compromise.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="gold" asChild>
              <Link href="/menu">
                Order Online <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/reservations">Reserve a Table</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-gf-muted-2">
          <p className="text-[10px] uppercase tracking-[0.2em]">Scroll</p>
        </div>
      </section>

      {/* STATS / SOCIAL PROOF BAR */}
      <section className="border-y border-gf-border-soft bg-gf-bg-elevated">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto size-5 text-gf-gold" />
              <p className="mt-2 font-display text-3xl text-gf-cream">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-gf-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED DISHES */}
      <section className="bg-gf-bg py-24" id="menu">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl text-gf-cream sm:text-5xl">
              This Week&apos;s Table
            </h2>
            <p className="mt-4 text-gf-muted">
              A rotating selection from the kitchen, sourced from local
              farms and seasonal markets — updated weekly.
            </p>
          </div>

          {featured.length > 0 ? (
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <Link
                  key={item._id}
                  href={`/menu?item=${item.slug}`}
                  className="group overflow-hidden rounded-lg border border-gf-border bg-gf-bg-card transition-colors hover:border-gf-gold-dim"
                >
                  <div
                    className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800"
                      }')`,
                    }}
                  />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-xl text-gf-gold">{item.name}</h3>
                      <span className="shrink-0 text-sm text-gf-cream">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="mt-1.5 text-xs uppercase tracking-wide text-gf-muted-2">
                      {item.category?.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SAMPLE_DISHES.map((d) => (
                <div
                  key={d.name}
                  className="group overflow-hidden rounded-lg border border-gf-border bg-gf-bg-card"
                >
                  <div
                    className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${d.img}')` }}
                  />
                  <div className="p-5">
                    <h3 className="font-display text-xl text-gf-gold">{d.name}</h3>
                    <p className="mt-1.5 text-xs uppercase tracking-wide text-gf-muted-2">
                      {d.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-wide text-gf-gold hover:text-gf-gold-bright"
            >
              View Full Menu <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* STORY / AMBIANCE */}
      <section id="story" className="relative">
        <div
          className="h-[420px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000')",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gf-bg/40 px-4">
          <div className="max-w-2xl text-center">
            <h2 className="font-display text-4xl text-gf-cream sm:text-5xl">
              A Room Built for the Meal
            </h2>
            <p className="mt-4 text-gf-cream/90 text-sm sm:text-base">
              Warm low light, generous spacing between tables, and a kitchen
              you can just barely hear — designed so the food, and the
              company, do the talking.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gf-bg-elevated py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div
            className="aspect-[4/5] rounded-lg bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1200')",
            }}
          />
          <div className="flex flex-col justify-center">
            <h3 className="font-display text-3xl text-gf-gold">The Philosophy</h3>
            <p className="mt-3 text-lg italic text-gf-cream/90">
              &quot;Good service is invisible until you need it — then it&apos;s everything.&quot;
            </p>
            <p className="mt-5 leading-relaxed text-gf-muted">
              The Golden Fork started as a single dining room and a short menu.
              Today the kitchen still runs on the same rule: every plate
              earns its place on the table, every order — online or in
              person — gets the same care.
            </p>
            <div className="mt-8 flex gap-10 border-t border-gf-border pt-6">
              <div>
                <p className="font-display text-3xl text-gf-gold">2019</p>
                <p className="text-xs uppercase tracking-wide text-gf-muted">Established</p>
              </div>
              <div>
                <p className="font-display text-3xl text-gf-gold">4.9</p>
                <p className="text-xs uppercase tracking-wide text-gf-muted">Guest Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRESS / AWARDS */}
      <section className="bg-gf-bg py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gf-muted-2">
            As Featured In
          </p>
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {PRESS_MENTIONS.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-2 text-center">
                <Award className="size-5 text-gf-gold" />
                <p className="font-display text-sm text-gf-cream">{p.name}</p>
                <p className="text-xs text-gf-muted-2">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      <section className="bg-gf-bg-elevated py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl text-gf-gold mb-12">
            Guest Experiences
          </h2>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gf-bg py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gf-gold">
              Good to Know
            </p>
            <h2 className="mt-3 font-display text-4xl text-gf-cream sm:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 rounded-lg border border-gf-border bg-gf-bg-card px-6">
            <Accordion type="single" collapsible>
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <ContactSection />

      {/* CTA */}
      <section className="bg-gf-bg-elevated py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-4xl text-gf-cream">Ready when you are.</h2>
          <p className="mt-3 text-gf-muted">
            Order ahead, book a table, or just browse tonight&apos;s menu.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="gold" asChild>
              <Link href="/menu">Start an Order</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/reservations">Reserve a Table</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

const SAMPLE_DISHES = [
  {
    name: "Seared Scallops",
    category: "Starters",
    img: "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800",
  },
  {
    name: "Wagyu Striploin",
    category: "Mains",
    img: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=800",
  },
  {
    name: "Burnt Honey Tart",
    category: "Desserts",
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800",
  },
];

const STATS = [
  { icon: Users, value: "12,000+", label: "Guests Served" },
  { icon: ChefHat, value: "50+", label: "Seasonal Dishes" },
  { icon: Award, value: "4.9 / 5", label: "Average Rating" },
  { icon: MapPin, value: "2019", label: "Established" },
];

const PRESS_MENTIONS = [
  { name: "City Eats Weekly", note: "\"Best New Tasting Menu\"" },
  { name: "The Culinary Times", note: "Editor's Pick, 2024" },
  { name: "Dine & Discover", note: "Top 10 Date Night Spots" },
  { name: "Regional Dining Awards", note: "Finalist, Service Excellence" },
];

const FAQS = [
  {
    question: "Do you take walk-ins, or is a reservation required?",
    answer:
      "Walk-ins are welcome based on availability, but we recommend reserving ahead — especially Friday and Saturday evenings — through the Reservations page. Parties of 8 or more should always book ahead.",
  },
  {
    question: "Can I order online for delivery or pickup?",
    answer:
      "Yes. Browse the full menu, add items to your cart, and choose delivery, pickup, or dine-in at checkout. You can track your order status from your account once it's placed.",
  },
  {
    question: "How does the loyalty program work?",
    answer:
      "You earn 10 points for every $1 spent on any order. Once you have at least 100 points, you can redeem them at checkout for $1 off per 100 points. Higher lifetime spend unlocks Silver, Gold, and Platinum tiers with extra perks.",
  },
  {
    question: "Do you accommodate dietary restrictions and allergies?",
    answer:
      "Yes — many dishes are tagged vegan, vegetarian, or gluten-free on the menu, and every item lists its allergens. Let us know about any allergies in your order notes or reservation request and our kitchen will take extra care.",
  },
  {
    question: "Can you host private events or large parties?",
    answer:
      "We have two private dining rooms that seat up to 12 guests. Mention the occasion and party size in your reservation or reach out through the Contact form below and our events team will follow up.",
  },
];