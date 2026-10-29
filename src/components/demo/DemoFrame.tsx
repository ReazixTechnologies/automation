"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { brand } from "@/data/brand";
import { cn } from "@/lib/utils";
import type { Channel } from "@/types/simulator";
import { SHOW_DESKTOP_EXTRAS } from "./config";
import { useAppViewport } from "./useAppViewport";

const QrCode = dynamic(() => import("./overlays/QrCode"), { ssr: false });

/** Fired when the visual viewport changes (keyboard, rotation) so the chat can stay pinned. */
export const VIEWPORT_EVENT = "demo:viewport";

/**
 * Mobile: the chat fills the screen (100dvh, pinned to the visual viewport, no
 * page scroll). Desktop: a ~400×820 phone-sized chat centred on the Reazix dark
 * background, with optional tiny logo + QR extras.
 */
export function DemoFrame({ channel, children }: { channel: Channel; children: ReactNode }) {
  const style = useAppViewport(() => window.dispatchEvent(new Event(VIEWPORT_EVENT)));
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => setUrl(window.location.origin + window.location.pathname), []);

  return (
    <div className="fixed inset-0 overflow-hidden md:flex md:items-center md:justify-center md:gap-10 md:bg-[#070707] md:bg-[radial-gradient(circle_at_50%_40%,rgba(232,105,46,0.16),transparent_55%)]">
      {SHOW_DESKTOP_EXTRAS && (
        <div className="absolute left-1/2 top-5 hidden -translate-x-1/2 md:block">
          {/* The transparent-background lockup, pixel-identical to the logo over black. */}
          <Image src={brand.logo.lockupDark} alt={brand.logo.alt} width={56} height={28} className="h-7 w-auto opacity-90" />
        </div>
      )}

      <div
        className={cn(
          "fixed inset-x-0 top-0 h-[100dvh] overflow-hidden",
          "md:relative md:h-[min(820px,calc(100dvh-7rem))] md:w-[400px] md:rounded-[28px] md:shadow-phone md:ring-1 md:ring-white/10",
          channel === "whatsapp" ? "bg-[#EFEAE2] dark:bg-[#0B141A]" : "bg-white dark:bg-black",
        )}
        style={style}
      >
        {children}
      </div>

      {SHOW_DESKTOP_EXTRAS && url && (
        <div className="hidden flex-col items-center gap-2 md:flex">
          <QrCode url={url} label={`QR code to open this ${channel === "whatsapp" ? "WhatsApp" : "Instagram"} demo on your phone`} />
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#A39A90]">Open on your phone</p>
        </div>
      )}
    </div>
  );
}
