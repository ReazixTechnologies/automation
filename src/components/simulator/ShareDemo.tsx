"use client";

import { Check, Copy, QrCode as QrIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { InstagramGlyph, WhatsAppGlyph } from "@/components/ui/icons";
import { demoUrl, type DemoChannel } from "@/lib/demoLinks";
import { cn } from "@/lib/utils";

const QrCode = dynamic(() => import("@/components/demo/overlays/QrCode"), { ssr: false });

const channels: { id: DemoChannel; label: string; Icon: typeof WhatsAppGlyph }[] = [
  { id: "whatsapp", label: "WhatsApp demo", Icon: WhatsAppGlyph },
  { id: "instagram", label: "Instagram demo", Icon: InstagramGlyph },
];

/** "Share demo": copy a link or show a QR for the standalone /demo chats. */
export function ShareDemo({ className }: { className?: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<DemoChannel | null>(null);
  const [qr, setQr] = useState<DemoChannel | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  const copy = async (id: DemoChannel) => {
    try {
      await navigator.clipboard.writeText(origin + demoUrl(id));
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setQr(id); // clipboard blocked: show the QR instead
    }
  };

  return (
    <div className={cn("rounded-card border border-border bg-card p-4 sm:p-5", className)}>
      <p className="eyebrow">Share demo</p>
      <p className="mt-1 text-sm text-muted-foreground">Send the full-screen chat to a colleague or open it on your phone.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {channels.map(({ id, label, Icon }) => (
          <li key={id} className="rounded-card border border-border p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon aria-hidden className={cn("h-4 w-4", id === "whatsapp" ? "text-[#25D366]" : "text-[#DD2A7B]")} />
              {label}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{origin ? origin + demoUrl(id) : demoUrl(id)}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => copy(id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-copper-500/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-copper-500/10"
              >
                {copied === id ? <Check aria-hidden className="h-3.5 w-3.5" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
                {copied === id ? "Copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => setQr((q) => (q === id ? null : id))}
                aria-expanded={qr === id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-foreground/5"
              >
                <QrIcon aria-hidden className="h-3.5 w-3.5" /> QR code
              </button>
            </div>
            {qr === id && origin && (
              <div className="mt-3">
                <QrCode url={origin + demoUrl(id)} size={128} label={`QR code for the ${label}`} />
              </div>
            )}
            <span aria-live="polite" className="sr-only">
              {copied === id ? "Link copied" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
