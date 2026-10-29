import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Skyline Heights · Chat demo by Reazix",
  description: "Chat with an AI property concierge on WhatsApp or Instagram. A demo built by Reazix for a fictional project.",
  manifest: "/demo.webmanifest",
  robots: { index: false, follow: true },
  appleWebApp: { capable: true, title: "Concierge", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/brand/apple-touch-icon.png", sizes: "180x180" },
  },
};

/** Follow the phone's light/dark setting live, like the real apps (no site theme toggle here). */
const schemeScript = `(function(){try{var m=window.matchMedia('(prefers-color-scheme: dark)');var a=function(){document.documentElement.classList.toggle('dark',m.matches)};a();m.addEventListener('change',a);}catch(e){}})();`;

// System fonts: what the real apps use, and no font download on 4G.
const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * Root layout for /demo routes only: renders the chat and nothing else
 * (no navbar, footer, cookie banner, launcher, analytics or exit intent).
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full overflow-hidden overscroll-none"
      style={{ ["--font-inter" as string]: systemFont, ["--font-sora" as string]: systemFont }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: schemeScript }} />
      </head>
      <body className="demo-body h-full select-none overflow-hidden overscroll-none bg-[#0B0B0B] [-webkit-tap-highlight-color:transparent]">
        {children}
      </body>
    </html>
  );
}
