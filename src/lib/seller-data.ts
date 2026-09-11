/**
 * Browser-side data access for signed-in sellers. Every call goes through the
 * user's own session, so RLS guarantees a seller only touches their own rows.
 */

import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { slugify, todayIST, type DayStatus } from "@/lib/today";

export type SellerRow = Tables<"sellers"> & { categories: { name: string; slug: string } | null };
export type ProductRow = Tables<"products">;
export type UpdateRow = Tables<"seller_updates">;
export type ProfileRow = Tables<"profiles">;

function fail(error: { message: string } | null): asserts error is null {
  if (error) throw new Error(error.message);
}

/** Creates the profile row on first sign-in (name/phone come from sign-up metadata). */
export async function ensureProfile(user: User): Promise<ProfileRow> {
  const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (data) return data;
  const meta = (user.user_metadata ?? {}) as { name?: string; phone?: string };
  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      name: meta.name ?? null,
      phone: meta.phone ?? null,
      email: user.email ?? null,
    })
    .select("*")
    .single();
  fail(error);
  return created;
}

export async function updateProfile(userId: string, input: { name: string; phone: string }) {
  const { error } = await supabase.from("profiles").update(input).eq("user_id", userId);
  fail(error);
}

export async function fetchMySeller(userId: string): Promise<SellerRow | null> {
  const { data, error } = await supabase
    .from("sellers")
    .select("*, categories(name, slug)")
    .eq("user_id", userId)
    .maybeSingle();
  fail(error);
  return (data as SellerRow | null) ?? null;
}

export type SellerInput = {
  business_name: string;
  owner_name: string;
  category_id: string;
  base_location: string;
  description: string;
  instagram_id: string;
  profile_image_url: string | null;
};

export async function saveSeller(user: User, existing: SellerRow | null, input: SellerInput) {
  if (existing) {
    const { error } = await supabase.from("sellers").update(input).eq("id", existing.id);
    fail(error);
    return existing.slug;
  }
  await ensureProfile(user);
  const base = slugify(`${input.business_name} ${input.base_location}`) || "seller";
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase
      .from("sellers")
      .insert({ ...input, user_id: user.id, slug, status: "draft" });
    if (!error) return slug;
    if (error.code !== "23505") throw new Error(error.message);
  }
  throw new Error("Could not create a unique page address. Please try again.");
}

export async function submitSeller(id: string) {
  const { error } = await supabase.from("sellers").update({ status: "pending" }).eq("id", id);
  fail(error);
}

export async function listProducts(sellerId: string): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at");
  fail(error);
  return data ?? [];
}

export type ProductInput = {
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  reel_url: string | null;
};

export async function saveProduct(sellerId: string, id: string | null, input: ProductInput) {
  const { error } = id
    ? await supabase.from("products").update(input).eq("id", id)
    : await supabase.from("products").insert({ ...input, seller_id: sellerId });
  fail(error);
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  fail(error);
}

export async function getTodayUpdate(sellerId: string): Promise<UpdateRow | null> {
  const { data, error } = await supabase
    .from("seller_updates")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("update_date", todayIST())
    .maybeSingle();
  fail(error);
  return data;
}

export type UpdateInput = {
  status: DayStatus;
  opening_time: string | null;
  closing_time: string | null;
  location_text: string | null;
  maps_url: string | null;
  announcement: string | null;
};

export async function saveTodayUpdate(sellerId: string, input: UpdateInput) {
  const { error } = await supabase
    .from("seller_updates")
    .upsert({ ...input, seller_id: sellerId, update_date: todayIST() }, {
      onConflict: "seller_id,update_date",
    });
  fail(error);
}

export async function clearTodayUpdate(sellerId: string) {
  const { error } = await supabase
    .from("seller_updates")
    .delete()
    .eq("seller_id", sellerId)
    .eq("update_date", todayIST());
  fail(error);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  return data === true;
}
