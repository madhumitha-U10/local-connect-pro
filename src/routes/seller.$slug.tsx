import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Instagram, MapPin } from "lucide-react";

import { ProductImage } from "@/components/site/ProductImage";
import { SellerAvatar } from "@/components/site/SellerAvatar";
import { SiteShell } from "@/components/site/SiteShell";
import { TodayUpdateCard } from "@/components/site/TodayUpdateCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSellerPage } from "@/lib/public.functions";
import { formatPrice, instagramUrl } from "@/lib/today";

export const Route = createFileRoute("/seller/$slug")({
  loader: async ({ params }) => {
    const page = await getSellerPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    const seller = loaderData?.seller;
    const title = seller
      ? `${seller.business_name} — ${seller.base_location} | NammaSpot`
      : "Seller — NammaSpot";
    const description = seller
      ? `${seller.description ?? seller.business_name} in ${seller.base_location}. See today's status, catalogue and contact details on NammaSpot.`
      : "Seller profile on NammaSpot.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">Seller not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This profile may have been removed or is awaiting approval.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/categories">Browse categories</Link>
        </Button>
      </div>
    </SiteShell>
  ),
  component: SellerProfile,
});

function SellerProfile() {
  const { seller, products, today } = Route.useLoaderData();

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SellerAvatar
            name={seller.business_name}
            src={seller.profile_image_url ?? undefined}
            size="lg"
          />
          <div className="min-w-0">
            {seller.categories && <Badge className="mb-2">{seller.categories.name}</Badge>}
            <h1 className="text-2xl font-extrabold sm:text-3xl">{seller.business_name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden /> {seller.base_location}
            </p>
            {seller.instagram_id && (
              <a
                href={instagramUrl(seller.instagram_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                <Instagram className="size-4" aria-hidden /> @
                {seller.instagram_id.replace(/^@/, "")}
              </a>
            )}
          </div>
        </div>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Today
          </h2>
          <TodayUpdateCard update={today} />
        </section>

        {seller.description && (
          <section className="mt-6 max-w-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              About
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {seller.description}
            </p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-extrabold">Catalogue</h2>
          {products.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No items added yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <article key={p.id} className="card-soft flex flex-col overflow-hidden">
                  {p.image_url && <ProductImage src={p.image_url} alt={p.name} />}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-sm font-bold">{p.name}</h3>
                    {p.description && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {formatPrice(p.price) && (
                        <p className="text-sm font-bold text-primary">{formatPrice(p.price)}</p>
                      )}
                      {p.reel_url && (
                        <a
                          href={p.reel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Watch reel
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
