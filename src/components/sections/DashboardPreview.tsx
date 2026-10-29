"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionIds } from "@/data/brand";
import { useNearViewport } from "@/hooks/useScriptPlayer";

/** Same outer size as the real shell, so loading it never shifts the page. */
function ShellSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="h-[45px] border-b border-border bg-muted/70" />
      <div className="h-[640px] animate-pulse bg-muted/40 lg:h-[660px]" />
    </div>
  );
}

const DashboardShell = dynamic(() => import("@/components/dashboard/DashboardShell"), {
  ssr: false,
  loading: ShellSkeleton,
});

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  // Only fetch the dashboard bundle when the visitor is close to it.
  const near = useNearViewport(ref, "600px");

  return (
    <section id={sectionIds.dashboard} aria-labelledby="dashboard-title" className="section-y relative bg-muted/60">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-[radial-gradient(closest-side,rgb(245_138_75/0.16),transparent)]" />
      <div className="container">
        <SectionHeading
          id="dashboard-title"
          eyebrow="Your Team's Command Centre"
          title="Every WhatsApp & Instagram Conversation. One Inbox."
          highlight="One Inbox."
          description="We set up and run the shared inbox your sales team works from: the AI handles the first reply, your team picks up hot leads with full context, private notes and one-click assignment."
        />
        <div ref={ref} className="mt-10 lg:mt-14">
          {near ? <DashboardShell /> : <ShellSkeleton />}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Interactive preview with demo data. Names, leads and numbers are fictional.
        </p>
      </div>
    </section>
  );
}
