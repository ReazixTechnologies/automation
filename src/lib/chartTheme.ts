"use client";

import { useSyncExternalStore } from "react";

/**
 * Chart colors per theme. Categorical sets were checked with the dataviz
 * palette validator (lightness band, chroma, CVD separation, contrast) against
 * each mode's surface. Recharts sets SVG attributes, which can't read CSS
 * variables, so the hex values switch with the `.dark` class instead.
 */
const light = {
  whatsapp: "#0F9D58",
  instagram: "#8134AF",
  hot: "#D1356E",
  warm: "#C08B12",
  cold: "#2F6FB0",
  /** Single-series bars and "after" values: brand copper. */
  primary: "#C4501F",
  /** "Before" / baseline values. */
  baseline: "#A89C90",
  grid: "#E7DCCF",
  axis: "#6B6159",
  surface: "#FFFBF6",
  text: "#14100C",
};

const dark: typeof light = {
  whatsapp: "#1FA463",
  instagram: "#8E6BE6",
  hot: "#E0457B",
  warm: "#B98A10",
  cold: "#3D85D0",
  primary: "#F58A4B",
  baseline: "#5E5650",
  grid: "#26221F",
  axis: "#A39A90",
  surface: "#161412",
  text: "#F3E9DD",
};

export type ChartTheme = typeof light;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function useIsDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

export function useChartTheme(): ChartTheme {
  return useIsDark() ? dark : light;
}
