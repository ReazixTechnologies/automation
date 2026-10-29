import type { Viewport } from "next";
import { DemoChat } from "@/components/demo/DemoChat";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // Matches the WhatsApp header in each color scheme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#075E54" },
    { media: "(prefers-color-scheme: dark)", color: "#202C33" },
  ],
};

export default function WhatsAppDemoPage() {
  return <DemoChat channel="whatsapp" />;
}
