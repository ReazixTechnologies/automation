"use client";

import { useEffect, useState } from "react";

/** QR code for a URL, rendered as inline SVG. The qrcode library loads only with this component. */
export default function QrCode({ url, size = 116, label }: { url: string; size?: number; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void import("qrcode").then((QR) =>
      QR.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0C0A08", light: "#FFFFFF" } }).then((s) => alive && setSvg(s)),
    );
    return () => {
      alive = false;
    };
  }, [url]);
  return (
    <div
      role="img"
      aria-label={label}
      className="overflow-hidden rounded-lg bg-white p-1.5"
      style={{ width: size, height: size }}
      // Generated locally from our own URL by the qrcode library.
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
