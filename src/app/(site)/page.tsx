import { AnalyticsLoader } from "@/components/layout/AnalyticsLoader";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LiveChatProvider } from "@/components/providers/LiveChatProvider";
import { ChatSimulator } from "@/components/sections/ChatSimulator";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { Integrations } from "@/components/sections/Integrations";
import { Pricing } from "@/components/sections/Pricing";
import { RoiCalculator } from "@/components/sections/RoiCalculator";
import { Trust } from "@/components/sections/Trust";
import { JsonLd } from "@/components/seo/JsonLd";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ExitIntent } from "@/components/ui/ExitIntent";
import { FloatingChatLauncher } from "@/components/ui/FloatingChatLauncher";
import { GlowDivider } from "@/components/ui/GlowDivider";
import { StickyMobileCTA } from "@/components/ui/StickyMobileCTA";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Navbar />
      {/* Shares the live-demo conversation with the dashboard preview and the chat launcher. */}
      <LiveChatProvider>
        <main id="main">
          <Hero />
          <GlowDivider />
          <ErrorBoundary name="live demo" className="container my-16">
            <ChatSimulator />
          </ErrorBoundary>
          <ErrorBoundary name="dashboard preview" className="container my-16">
            <DashboardPreview />
          </ErrorBoundary>
          <RoiCalculator />
          <GlowDivider />
          <Trust />
          <Integrations />
          <GlowDivider />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
        <StickyMobileCTA />
        <FloatingChatLauncher />
        <ExitIntent />
        <CookieBanner />
        <AnalyticsLoader />
      </LiveChatProvider>
    </>
  );
}
