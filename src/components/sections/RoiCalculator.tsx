"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RoiInputs } from "@/components/roi/RoiInputs";
import { RoiResults } from "@/components/roi/RoiResults";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionIds } from "@/data/brand";
import { track } from "@/lib/analytics";
import { calculateRoi, DEFAULT_ASSUMPTIONS, DEFAULT_INPUTS, type RoiAssumptions, type RoiInputs as Inputs } from "@/lib/roi";

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function RoiCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [assumptions, setAssumptions] = useState<RoiAssumptions>(DEFAULT_ASSUMPTIONS);
  // Results settle shortly after the visitor stops dragging.
  const settledInputs = useDebounced(inputs, 200);
  const settledAssumptions = useDebounced(assumptions, 200);
  const result = useMemo(() => calculateRoi(settledInputs, settledAssumptions), [settledInputs, settledAssumptions]);

  // Report recalculations after the visitor changes something (not on first render).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    track("roi_calculated", { leads: settledInputs.monthlyLeads, extraBookings: Math.round(result.extraBookings * 10) / 10 });
  }, [result, settledInputs.monthlyLeads]);

  return (
    <section id={sectionIds.roi} aria-labelledby="roi-title" className="section-y">
      <div className="container">
        <SectionHeading
          id="roi-title"
          eyebrow="Calculate Your Upside"
          title="What Would Faster Replies Be Worth to You?"
          highlight="Faster Replies"
          description="Plug in your own numbers. Everything updates as you go."
        />
        <div className="mt-10 grid items-start gap-8 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <RoiInputs inputs={inputs} assumptions={assumptions} onInputs={setInputs} onAssumptions={setAssumptions} />
          </div>
          <div className="min-w-0 lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)]">
            <RoiResults result={result} />
          </div>
        </div>
      </div>
    </section>
  );
}
