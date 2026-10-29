import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: ReactNode;
  /** Status-bar clock. */
  time?: string;
  /** Status-bar text/icon tone; match it to the header color under it. */
  statusBarTone?: "light" | "dark";
  /** Background behind the status bar (usually the chat header color). */
  statusBarClassName?: string;
  /** Accessible description of what the phone shows. */
  label?: string;
  className?: string;
  screenClassName?: string;
}

/**
 * Realistic phone mockup with notch and status bar and a thin copper edge glow. Scales with its container
 * (width-driven, fixed aspect ratio) so it never causes horizontal scroll.
 */
export function PhoneFrame({
  children,
  time = "9:41",
  statusBarTone = "light",
  statusBarClassName = "bg-wa-header dark:bg-wa-header-dark",
  label = "Phone preview",
  className,
  screenClassName,
}: PhoneFrameProps) {
  const tone = statusBarTone === "light" ? "text-white" : "text-ink dark:text-white";

  return (
    <figure
      aria-label={label}
      className={cn(
        "relative mx-auto aspect-[9/19] w-full max-w-[320px] rounded-[34px] bg-ink p-[10px] shadow-phone",
        className,
      )}
    >
      {/* Side buttons */}
      <span aria-hidden className="absolute -left-[3px] top-[22%] h-10 w-[3px] rounded-l bg-ink-700" />
      <span aria-hidden className="absolute -left-[3px] top-[32%] h-14 w-[3px] rounded-l bg-ink-700" />
      <span aria-hidden className="absolute -right-[3px] top-[28%] h-20 w-[3px] rounded-r bg-ink-700" />

      {/* force-light: the screen always shows the real light WhatsApp / Instagram skins. */}
      <div className={cn("force-light relative flex h-full flex-col overflow-hidden rounded-phone bg-white", screenClassName)}>
        {/* Status bar */}
        <div
          aria-hidden
          className={cn("relative z-10 flex h-8 shrink-0 items-center justify-between px-6 text-[11px] font-semibold", tone, statusBarClassName)}
        >
          <span className="tabular-nums">{time}</span>
          <span className="flex items-center gap-1">
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </span>
        </div>
        {/* Notch */}
        <span aria-hidden className="absolute left-1/2 top-1.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />

        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>

        {/* Home indicator */}
        <span aria-hidden className="pointer-events-none absolute bottom-1.5 left-1/2 z-20 h-1 w-24 -translate-x-1/2 rounded-full bg-ink/70 dark:bg-white/60" />
      </div>
    </figure>
  );
}

function SignalIcon() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
      <rect x="0" y="7" width="3" height="3" rx="0.5" />
      <rect x="4.3" y="5" width="3" height="5" rx="0.5" />
      <rect x="8.6" y="2.5" width="3" height="7.5" rx="0.5" />
      <rect x="12.9" y="0" width="3" height="10" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
      <path d="M7 10 4.8 7.6a3.2 3.2 0 0 1 4.4 0L7 10Zm-3.6-3.9L2 4.6a7 7 0 0 1 10 0l-1.4 1.5a5 5 0 0 0-7.2 0ZM.7 3.4-.7 1.9a10.7 10.7 0 0 1 15.4 0l-1.4 1.5a8.7 8.7 0 0 0-12.6 0Z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
      <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" opacity="0.5" />
      <rect x="2" y="2" width="15" height="7" rx="1.6" fill="currentColor" />
      <path d="M22 3.8v3.4c.7-.3 1.2-1 1.2-1.7S22.7 4.1 22 3.8Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
