import type { Viewport } from "next";
import { DemoChat } from "@/components/demo/DemoChat";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // Matches the Instagram header in each color scheme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function InstagramDemoPage() {
  return <DemoChat channel="instagram" />;
}
