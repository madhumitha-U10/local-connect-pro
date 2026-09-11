import { Clock, ExternalLink, MapPin } from "lucide-react";

import { formatTime, STATUS_META, type DayStatus } from "@/lib/today";

export type TodayUpdate = {
  status: DayStatus;
  opening_time: string | null;
  closing_time: string | null;
  location_text: string | null;
  maps_url: string | null;
  announcement: string | null;
};

/** Today's status block shown on the public seller page (and dashboard preview). */
export function TodayUpdateCard({ update }: { update: TodayUpdate | null }) {
  if (!update) {
    return (
      <div className="card-soft p-4 text-sm text-muted-foreground">No update for today.</div>
    );
  }
  const meta = STATUS_META[update.status];
  const hasTime = update.status === "open" && (update.opening_time || update.closing_time);

  return (
    <div className="card-soft space-y-2 p-4">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${meta.className}`}
      >
        <span aria-hidden>{meta.emoji}</span> {meta.label}
      </span>
      {hasTime && (
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="size-4 text-primary" aria-hidden />
          {formatTime(update.opening_time)}
          {update.opening_time && update.closing_time ? " – " : ""}
          {formatTime(update.closing_time)}
        </p>
      )}
      {update.location_text && (
        <p className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-primary" aria-hidden />
          <span>
            <span className="text-muted-foreground">Today: </span>
            {update.location_text}
          </span>
          {update.maps_url && (
            <a
              href={update.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Map <ExternalLink className="size-3" aria-hidden />
            </a>
          )}
        </p>
      )}
      {update.announcement && (
        <p className="text-sm italic text-foreground/90">“{update.announcement}”</p>
      )}
    </div>
  );
}
