"use client";

import { useEffect } from "react";
import { setAnalyticsSink, track, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";
import { CONSENT_CHANGE_EVENT, readConsent, type Consent } from "@/lib/consent";

// TODO(launch): set NEXT_PUBLIC_GA_ID to a real GA4 measurement ID (see LAUNCH_CHECKLIST.md).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let gaLoaded = false;
function loadGa(id: string) {
  if (gaLoaded) return;
  gaLoaded = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

function applyConsent(consent: Consent) {
  if (!consent.analytics) {
    setAnalyticsSink(null);
    return;
  }
  if (GA_ID) {
    loadGa(GA_ID);
    setAnalyticsSink((event: AnalyticsEvent, props: AnalyticsProps) => window.gtag?.("event", event, props));
  } else if (process.env.NODE_ENV !== "production") {
    setAnalyticsSink((event, props) => console.debug("[analytics]", event, props));
  }
}

/**
 * Installs the analytics sink once consent is given (no script loads before
 * that) and tracks clicks on any element marked data-track="cta".
 */
export function AnalyticsLoader() {
  useEffect(() => {
    applyConsent(readConsent());
    const onConsent = (e: Event) => applyConsent((e as CustomEvent<Consent>).detail);
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsent);

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track='cta']");
      if (el) track("cta_click", { location: el.dataset.trackLocation ?? "unknown", label: el.textContent?.trim().slice(0, 60) });
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, onConsent);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}
