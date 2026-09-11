import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { SellerAvatar } from "@/components/site/SellerAvatar";
import type { SellerCardData } from "@/lib/public.functions";

export function SellerCard({ seller }: { seller: SellerCardData }) {
  return (
    <Link
      to="/seller/$slug"
      params={{ slug: seller.slug }}
      className="card-soft flex gap-4 p-4 transition-colors hover:border-primary"
    >
      <SellerAvatar name={seller.business_name} src={seller.profile_image_url ?? undefined} />
      <div className="min-w-0 flex-1">
        {seller.categories && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {seller.categories.name}
          </p>
        )}
        <h3 className="truncate text-base font-bold">{seller.business_name}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" aria-hidden /> {seller.base_location}
        </p>
        {seller.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {seller.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export function SellerGrid({
  sellers,
  empty = "No sellers found. Try a different search or category.",
}: {
  sellers: SellerCardData[];
  empty?: string;
}) {
  if (sellers.length === 0) {
    return (
      <div className="card-soft p-8 text-center text-sm text-muted-foreground">{empty}</div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sellers.map((s) => (
        <SellerCard key={s.id} seller={s} />
      ))}
    </div>
  );
}
