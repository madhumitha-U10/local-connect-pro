import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { SellerGrid } from "@/components/site/SellerCard";
import { PageHeading, SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategories, searchSellers } from "@/lib/public.functions";

const searchSchema = z.object({
  q: z.string().max(80).optional(),
  category: z.string().max(60).optional(),
});

export const Route = createFileRoute("/sellers")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [categories, sellers] = await Promise.all([
      getCategories(),
      searchSellers({ data: deps }),
    ]);
    return { categories, sellers };
  },
  head: () => ({
    meta: [
      { title: "Find local sellers in Chennai | NammaSpot" },
      {
        name: "description",
        content:
          "Search NammaSpot for home bakers, mehendi artists, bridal makeup, crochet makers, boutiques and more. Filter by category and area.",
      },
      { property: "og:title", content: "Find local sellers | NammaSpot" },
      {
        property: "og:description",
        content: "Search and filter local small businesses near you on NammaSpot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellersPage,
});

function SellersPage() {
  const { categories, sellers } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [q, setQ] = useState(search.q ?? "");

  return (
    <SiteShell>
      <PageHeading
        eyebrow="Discover"
        title="Local sellers"
        subtitle="Search by name, area or what you need."
      />
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ search: { ...search, q: q.trim() || undefined } });
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

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant={search.category ? "outline" : "default"}
            size="sm"
            className="rounded-full"
            onClick={() => void navigate({ search: { ...search, category: undefined } })}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={search.category === c.slug ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => void navigate({ search: { ...search, category: c.slug } })}
            >
              {c.name}
            </Button>
          ))}
        </div>

        <div className="mt-6">
          <SellerGrid sellers={sellers} />
        </div>
      </div>
    </SiteShell>
  );
}
