"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { InstagramGlyph, WhatsAppGlyph } from "@/components/ui/icons";
import { brand } from "@/data/brand";

/** /demo: logo, one line, two big buttons. Keeps ?q= / ?project= when continuing. */
export function DemoChooser() {
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(window.location.search), []);

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center gap-10 bg-[#070707] bg-[radial-gradient(circle_at_50%_35%,rgba(232,105,46,0.18),transparent_55%)] px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-[#F3E9DD]">
      <Image src={brand.logo.lockupDark} alt={brand.logo.alt} width={160} height={80} priority className="h-20 w-auto" />
      <h1 className="text-center text-[20px] font-light">Choose where you&apos;d like to chat</h1>
      <div className="grid w-full max-w-sm gap-4">
        <a
          href={`/demo/whatsapp${search}`}
          className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-[#25D366] text-[18px] font-semibold text-[#0B141A] shadow-[0_0_24px_rgba(37,211,102,0.25)] active:scale-[0.98]"
        >
          <WhatsAppGlyph className="h-7 w-7" /> WhatsApp
        </a>
        <a
          href={`/demo/instagram${search}`}
          className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-ig-gradient text-[18px] font-semibold text-white shadow-[0_0_24px_rgba(221,42,123,0.25)] active:scale-[0.98]"
        >
          <InstagramGlyph className="h-7 w-7" /> Instagram
        </a>
      </div>
    </main>
  );
}
