import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ensureProfile, fetchMySeller, type SellerRow } from "@/lib/seller-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Seller dashboard | NammaSpot" },
      {
        name: "description",
        content: "Manage your NammaSpot business page, catalogue and today's status.",
      },
      { property: "og:title", content: "Seller dashboard | NammaSpot" },
      { property: "og:description", content: "Your NammaSpot seller workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerRow | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/login" });
      return;
    }
    void (async () => {
      await ensureProfile(user);
      setSeller(await fetchMySeller(user.id));
      setReady(true);
    })();
  }, [user, loading, navigate]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold">Seller dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              void supabase.auth.signOut().then(() => navigate({ to: "/" }));
            }}
          >
            Sign out
          </Button>
        </div>

        {!ready ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : seller ? (
          <div className="card-soft mt-6 space-y-3 p-5">
            <Badge>{seller.status}</Badge>
            <h2 className="text-lg font-bold">{seller.business_name}</h2>
            <p className="text-sm text-muted-foreground">{seller.base_location}</p>
            {seller.status === "approved" && (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/seller/$slug" params={{ slug: seller.slug }}>
                  View my public page
                </Link>
              </Button>
            )}
            {seller.status === "pending" && (
              <p className="text-sm text-muted-foreground">
                Your business is waiting for approval. You'll appear in search once approved.
              </p>
            )}
          </div>
        ) : (
          <div className="card-soft mt-6 p-5 text-sm text-muted-foreground">
            You haven't added your business details yet.
          </div>
        )}
      </div>
    </SiteShell>
  );
}
