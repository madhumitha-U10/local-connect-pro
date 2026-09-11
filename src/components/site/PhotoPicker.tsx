import { ImagePlus, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { uploadForBucket, type MediaBucket } from "@/lib/image-storage";

/**
 * Image picker for seller profile pictures and catalogue photos. The file is
 * validated, compressed and uploaded to private storage; `onPicked` receives
 * the stable app URL. Avatars crop (`cover`), catalogue photos never do.
 */
export function PhotoPicker({
  src,
  alt,
  label,
  className = "size-24 rounded-lg",
  bucket,
  fit = "contain",
  onPicked,
}: {
  src?: string | null | undefined;
  alt: string;
  label: string;
  className?: string;
  bucket: MediaBucket;
  fit?: "cover" | "contain";
  onPicked: (url: string) => void;
}) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={inputId}
        className={`relative grid cursor-pointer place-items-center overflow-hidden border border-border bg-secondary text-muted-foreground transition-opacity hover:opacity-80 focus-within:ring-2 focus-within:ring-ring ${className}`}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className={`size-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
          />
        ) : (
          <ImagePlus className="size-5" aria-hidden />
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-background/70">
            <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
          </span>
        )}
      </label>
      <div className="text-xs text-muted-foreground">
        <label htmlFor={inputId} className="cursor-pointer font-semibold text-primary">
          {src ? `Change ${label}` : `Add ${label}`}
        </label>
        <p>JPG, PNG or WebP · under 5 MB</p>
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onPicked(await uploadForBucket(bucket, file));
            toast.success("Image uploaded");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
