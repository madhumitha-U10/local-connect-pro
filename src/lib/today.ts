/** Client-safe helpers shared by public pages and the seller dashboard. */

export type DayStatus = "open" | "closed" | "holiday";

/** Today's date (YYYY-MM-DD) in Asia/Kolkata, regardless of device/server timezone. */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** "10:00:00" -> "10:00 AM" */
export function formatTime(t: string | null | undefined): string {
  if (!t) return "";
  const [hStr, m = "00"] = t.split(":");
  const h = Number(hStr);
  if (!Number.isFinite(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.padStart(2, "0")} ${suffix}`;
}

export const STATUS_META: Record<
  DayStatus,
  { label: string; emoji: string; className: string }
> = {
  open: { label: "Open today", emoji: "🟢", className: "bg-green-600/10 text-green-800" },
  closed: { label: "Closed today", emoji: "🔴", className: "bg-destructive/10 text-destructive" },
  holiday: { label: "Holiday today", emoji: "🟡", className: "bg-turmeric/20 text-charcoal" },
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function instagramUrl(handle: string): string {
  const clean = handle.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  return `https://instagram.com/${clean.replace(/\/+$/, "")}`;
}

export function formatPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return `₹${Number(price).toLocaleString("en-IN")}`;
}
