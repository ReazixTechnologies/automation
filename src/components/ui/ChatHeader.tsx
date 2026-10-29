import { BadgeCheck, ChevronLeft, Info, MoreVertical, Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatVariant } from "@/types/chat";

interface ChatHeaderProps {
  variant?: ChatVariant;
  name: string;
  initials: string;
  verified?: boolean;
  /** e.g. "online", "typing…", "Active now" */
  status?: string;
  /** Highlight status (WhatsApp shows "typing…" in a brighter tone). */
  statusActive?: boolean;
  className?: string;
}

/** Decorative chat app header. Icons are non-interactive mock UI. */
export function ChatHeader({
  variant = "whatsapp",
  name,
  initials,
  verified,
  status,
  statusActive,
  className,
}: ChatHeaderProps) {
  if (variant === "instagram") {
    return (
      <div className={cn("flex shrink-0 items-center gap-2.5 border-b border-black/5 bg-white px-3 py-2.5 text-ink dark:border-white/10 dark:bg-black dark:text-white", className)}>
        <ChevronLeft aria-hidden className="h-5 w-5" />
        <span className="rounded-full bg-ig-gradient p-[2px]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-ink-700 text-[11px] font-bold text-white dark:border-black">
            {initials}
          </span>
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 truncate text-[13px] font-semibold">
            {name}
            {verified && <BadgeCheck aria-label="Verified" className="h-3.5 w-3.5 fill-[#0095F6] text-white" />}
          </p>
          {status && <p className="truncate text-[11px] text-[#737373]">{status}</p>}
        </div>
        <span aria-hidden className="flex items-center gap-3">
          <Phone className="h-4 w-4" />
          <Video className="h-4 w-4" />
          <Info className="h-4 w-4" />
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex shrink-0 items-center gap-2 bg-wa-header px-2 py-2 text-white dark:bg-wa-header-dark", className)}>
      <ChevronLeft aria-hidden className="h-5 w-5 opacity-90" />
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-copper-gradient text-[11px] font-bold text-ink">
        {initials}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="flex items-center gap-1 truncate text-[13.5px] font-semibold">
          {name}
          {verified && <BadgeCheck aria-label="Verified business" className="h-3.5 w-3.5 shrink-0 fill-wa text-wa-header dark:text-wa-header-dark" />}
        </p>
        {status && (
          <p aria-live="polite" className={cn("truncate text-[11px]", statusActive ? "text-wa-bubble dark:text-wa" : "text-white/75")}>
            {status}
          </p>
        )}
      </div>
      <span aria-hidden className="flex items-center gap-3.5 pr-1 opacity-90">
        <Video className="h-4 w-4" />
        <Phone className="h-4 w-4" />
        <MoreVertical className="h-4 w-4" />
      </span>
    </div>
  );
}
