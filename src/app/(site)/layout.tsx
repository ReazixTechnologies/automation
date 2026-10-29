import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { themeInitScript } from "@/components/layout/ThemeToggle";
import { brand } from "@/data/brand";
import { siteDescription, siteUrl } from "@/lib/site";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Display font: Light 300 for large headlines, SemiBold 600 for emphasis words (BRAND.md).
// "optional": on slow connections the size-matched fallback stays instead of
// swapping late, so the hero headline (the LCP element) paints once, early.
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["300", "600"], display: "optional" });

const title = "Reazix — WhatsApp & Instagram AI Automation for Real Estate";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: siteDescription,
  keywords: [
    "WhatsApp automation for real estate",
    "Instagram DM automation",
    "real estate chatbot",
    "AI property concierge",
    "WhatsApp Business API",
    "site visit booking",
    "real estate CRM",
    "lead qualification",
    "Reazix",
    "digital product studio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brand.name,
    title,
    description: siteDescription,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description: siteDescription },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/brand/apple-touch-icon.png", sizes: "180x180" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#070707" },
    { media: "(prefers-color-scheme: dark)", color: "#070707" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${sora.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-copper-500 px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
