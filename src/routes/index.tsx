import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

import { SellerGrid } from "@/components/site/SellerCard";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHome } from "@/lib/public.functions";
import { heroImages, imageForCategorySlug } from "@/lib/images";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  head: () => ({
    meta: [
      { title: "NammaSpot — Chennai's Local Makers, Bakers & Artists" },
      {
        name: "description",
        content:
          "Discover Chennai's home bakers, mehendi artists, bridal makeup studios, crochet makers and boutiques. See today's status, browse catalogues and contact sellers directly.",
      },
      { property: "og:title", content: "NammaSpot — Chennai's Local Makers, Bakers & Artists" },
      {
        property: "og:description",
        content: "Namma Ooru. Namma People. Namma Spot. A local marketplace for small businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { categories, sellers } = Route.useLoaderData();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="pointer-events-none absolute inset-0 kolam-grid" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-6 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Chennai · Tamil Nadu
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Namma Ooru.
              <br />
              Namma People.
              <br />
              <span className="text-primary">Namma Spot.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Discover the flavours, crafts and talents of your neighbourhood — and see who's open
              today.
            </p>
            <form
              className="mt-6 flex max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void navigate({ to: "/sellers", search: { q: q.trim() || undefined } });
              }}
            >
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cakes, mehendi, Adyar…"
                aria-label="Search sellers"
              />
              <Button type="submit" className="rounded-full">
                <Search className="size-4" aria-hidden /> Search
              </Button>
            </form>
          </div>
          <img
            src={heroImages.bakes}
            alt="Handmade cakes and crafts from local Chennai sellers"
            className="h-64 w-full rounded-2xl object-cover shadow-[var(--shadow-soft)] lg:h-80"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-extrabold">Browse categories</h2>
          <Link to="/categories" className="text-sm font-semibold text-primary hover:underline">
            All categories
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/sellers"
              search={{ category: c.slug }}
              className="group card-soft overflow-hidden hover:border-primary"
            >
              <img
                src={imageForCategorySlug(c.slug)}
                alt={c.name}
                loading="lazy"
                className="h-24 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <p className="p-3 text-sm font-bold">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 lg:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-extrabold">New on NammaSpot</h2>
          <Link
            to="/sellers"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            See all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-4">
          <SellerGrid sellers={sellers} empty="Sellers will appear here once approved." />
        </div>
      </section>
    </SiteShell>
  );
}
