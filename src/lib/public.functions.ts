/**
 * Public, read-only data for customers. Runs on the server with the
 * publishable key, so RLS (approved sellers only) applies as `anon`.
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
import { todayIST } from "@/lib/today";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const SELLER_CARD_COLS =
  "id, business_name, base_location, description, profile_image_url, slug, categories(name, slug)";

export type SellerCardData = {
  id: string;
  business_name: string;
  base_location: string;
  description: string | null;
  profile_image_url: string | null;
  slug: string;
  categories: { name: string; slug: string } | null;
};

export type Category = { id: string; name: string; slug: string };

export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const { data } = await publicClient()
      .from("categories")
      .select("id, name, slug")
      .order("sort_order");
    return data ?? [];
  },
);

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [cats, sellers] = await Promise.all([
    sb.from("categories").select("id, name, slug").order("sort_order"),
    sb
      .from("sellers")
      .select(SELLER_CARD_COLS)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  return {
    categories: (cats.data ?? []) as Category[],
    sellers: (sellers.data ?? []) as SellerCardData[],
  };
});

export const searchSellers = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        q: z.string().max(80).optional(),
        category: z.string().max(60).optional(),
        city: z.string().max(60).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<SellerCardData[]> => {
    const sb = publicClient();
    let query = sb
      .from("sellers")
      .select(
        data.category
          ? SELLER_CARD_COLS.replace("categories(", "categories!inner(")
          : SELLER_CARD_COLS,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);

    if (data.category) query = query.eq("categories.slug", data.category);
    if (data.city) query = query.ilike("base_location", `%${data.city.trim()}%`);
    if (data.q?.trim()) {
      const term = data.q.trim().replace(/[%,()]/g, " ");
      query = query.or(
        `business_name.ilike.%${term}%,base_location.ilike.%${term}%,description.ilike.%${term}%`,
      );
    }
    const { data: rows } = await query;
    return (rows ?? []) as SellerCardData[];
  });

export const getSellerPage = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(80) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: seller } = await sb
      .from("sellers")
      .select(
        "id, business_name, owner_name, base_location, description, instagram_id, profile_image_url, slug, categories(name, slug)",
      )
      .eq("slug", data.slug)
      .eq("status", "approved")
      .maybeSingle();
    if (!seller) return null;

    const [products, update] = await Promise.all([
      sb
        .from("products")
        .select("id, name, description, price, image_url, reel_url")
        .eq("seller_id", seller.id)
        .order("created_at"),
      sb
        .from("seller_updates")
        .select("status, opening_time, closing_time, location_text, maps_url, announcement")
        .eq("seller_id", seller.id)
        .eq("update_date", todayIST())
        .maybeSingle(),
    ]);
    return { seller, products: products.data ?? [], today: update.data ?? null };
  });

export type SellerPage = NonNullable<Awaited<ReturnType<typeof getSellerPage>>>;
