import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand } from "@/data/brand";

export const alt = "Reazix — WhatsApp & Instagram AI Automation for Real Estate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social card: near-black, copper glow, the provided logo (unaltered), headline. */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", brand.logo.lockup));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const { width: lw, height: lh } = brand.logo.lockupSize;
  const logoHeight = 170;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#070707",
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(232,105,46,0.35), transparent 45%), radial-gradient(circle at 10% 95%, rgba(196,80,31,0.22), transparent 40%)",
          color: "#F3E9DD",
          fontFamily: "sans-serif",
        }}
      >
        {/* The logo sits on black, matching the background, so it needs no treatment. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={Math.round((logoHeight * lw) / lh)} height={logoHeight} alt="" style={{ marginLeft: -12 }} />
        <div style={{ display: "flex", marginTop: 34, fontSize: 54, fontWeight: 300, lineHeight: 1.15, maxWidth: 980 }}>
          We build AI concierges that turn WhatsApp &amp; Instagram chats into site visits
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            width: 360,
            height: 2,
            background: "linear-gradient(90deg, #FFB27A, #E8692E 50%, rgba(196,80,31,0))",
            boxShadow: "0 0 18px rgba(232,105,46,0.7)",
          }}
        />
        <div style={{ display: "flex", marginTop: 22, fontSize: 22, letterSpacing: 6, color: "#FFB27A" }}>
          DONE-FOR-YOU REAL ESTATE AUTOMATION
        </div>
      </div>
    ),
    size,
  );
}
