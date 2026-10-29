import type { Viewport } from "next";
import { DemoChooser } from "@/components/demo/DemoChooser";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070707",
};

export default function DemoIndexPage() {
  return <DemoChooser />;
}
