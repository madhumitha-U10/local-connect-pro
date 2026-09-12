import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeading, SiteShell } from "@/components/site/SiteShell";
import { getCategories } from "@/lib/public.functions";
import { imageForCategorySlug } from "@/lib/images";

export const Route = createFileRoute("/categories")({
  loader: () => getCategories(),
  head: () => ({
    meta: [
      { title: "Categories — Bakers, Mehendi, Bridal & Crafts | NammaSpot" },
      {
        name: "description",
        content:
          "Browse NammaSpot categories: home bakers, mehendi artists, bridal makeup, crochet, artists, boutiques, handmade decor and gift hampers.",
      },
      { property: "og:title", content: "Categories — NammaSpot" },
      {
        property: "og:description",
        content: "Local craft and food categories across Chennai and Tamil Nadu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const categories = Route.useLoaderData();

  return (
    <SiteShell>
      <PageHeading
        eyebrow="Categories"
        title="Crafts of Chennai"
        subtitle="Every category is run by real people you can message directly."
      />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
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
              className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="p-4">
              <h2 className="text-base font-bold">{c.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
