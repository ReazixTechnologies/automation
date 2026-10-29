"use client";

import { ChevronDown, Info } from "lucide-react";
import { useId, useState } from "react";
import {
  ASSUMPTION_RANGES,
  clamp,
  formatCount,
  formatINR,
  INPUT_RANGES,
  MODEL_CONSTANTS,
  RESPONSE_TIMES,
  type RoiAssumptions,
  type RoiInputs as Inputs,
} from "@/lib/roi";
import { cn } from "@/lib/utils";

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Display format for the number field and screen readers. */
  format: (n: number) => string;
  unit?: string;
  hint?: string;
}

/** Digits only ("1,50,000" -> 150000); null when nothing numeric was typed. */
const parseNumber = (text: string) => {
  const cleaned = text.replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return cleaned && Number.isFinite(n) ? n : null;
};

/** Range slider + number field kept in sync; the field clamps on commit. */
function SliderField({ label, value, min, max, step, onChange, format, unit, hint }: SliderFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const n = parseNumber(draft);
    // Unparseable input reverts to the current value.
    if (n !== null) onChange(clamp(Math.round(n / step) * step, min, max));
    setDraft(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`${id}-range`} className="min-w-0 text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="flex shrink-0 items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            aria-label={`${label}${unit ? ` (${unit})` : ""}`}
            value={draft ?? format(value)}
            onFocus={() => setDraft(String(value))}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
            className="w-28 rounded-lg border border-border bg-card px-2.5 py-1 text-right text-sm font-semibold tabular-nums text-foreground"
          />
          {unit && <span className="w-6 text-xs text-muted-foreground">{unit}</span>}
        </span>
      </div>
      <input
        id={`${id}-range`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${format(value)}${unit ? ` ${unit}` : ""}`}
        className="mt-2 w-full accent-[#C4501F] dark:accent-[#F58A4B]"
      />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{format(min)}</span>
        {hint && <span className="text-copper-700 dark:text-copper-300">{hint}</span>}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

interface RoiInputsProps {
  inputs: Inputs;
  assumptions: RoiAssumptions;
  onInputs: (next: Inputs) => void;
  onAssumptions: (next: RoiAssumptions) => void;
}

const pct = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}`;

export function RoiInputs({ inputs, assumptions, onInputs, onAssumptions }: RoiInputsProps) {
  const [open, setOpen] = useState(false);
  const responseId = useId();
  const set = <K extends keyof Inputs>(key: K) => (v: number) => onInputs({ ...inputs, [key]: v });
  const setA = <K extends keyof RoiAssumptions>(key: K) => (v: number) => onAssumptions({ ...assumptions, [key]: v / 100 });
  const r = INPUT_RANGES;

  return (
    <div className="space-y-6">
      <SliderField label="Monthly leads" value={inputs.monthlyLeads} {...r.monthlyLeads} onChange={set("monthlyLeads")} format={formatCount} />

      <div>
        <label htmlFor={responseId} className="text-sm font-medium text-foreground">
          Current average response time
        </label>
        <select
          id={responseId}
          value={inputs.responseMinutes}
          onChange={(e) => onInputs({ ...inputs, responseMinutes: Number(e.target.value) })}
          className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          {RESPONSE_TIMES.map((t) => (
            <option key={t.minutes} value={t.minutes}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <SliderField label="Lead → site visit rate" value={inputs.visitRate} {...r.visitRate} onChange={set("visitRate")} format={pct} unit="%" />
        <SliderField label="Site visit → booking rate" value={inputs.bookingRate} {...r.bookingRate} onChange={set("bookingRate")} format={pct} unit="%" />
      </div>

      <SliderField
        label="Average property value"
        value={inputs.propertyValue}
        {...r.propertyValue}
        onChange={set("propertyValue")}
        format={(n) => formatINR(n)}
        hint={formatINR(inputs.propertyValue)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SliderField label="Commission / margin" value={inputs.commissionRate} {...r.commissionRate} onChange={set("commissionRate")} format={pct} unit="%" />
        <SliderField label="Sales team size" value={inputs.teamSize} {...r.teamSize} onChange={set("teamSize")} format={formatCount} />
      </div>

      <SliderField
        label="Hours per agent per day on repetitive replies"
        value={inputs.repetitiveHours}
        {...r.repetitiveHours}
        onChange={set("repetitiveHours")}
        format={pct}
        unit="h"
      />

      <div className="rounded-card border border-border bg-card">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="roi-assumptions"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground"
        >
          <span className="flex items-center gap-2">
            <Info aria-hidden className="h-4 w-4 text-copper-700 dark:text-copper-400" />
            Adjust assumptions (estimates)
          </span>
          <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
        <div id="roi-assumptions" hidden={!open} className="space-y-6 border-t border-border px-4 pb-4 pt-4">
          <SliderField
            label="Uplift in site-visit rate from instant replies"
            value={Math.round(assumptions.visitUplift * 100)}
            min={ASSUMPTION_RANGES.visitUplift.min * 100}
            max={ASSUMPTION_RANGES.visitUplift.max * 100}
            step={5}
            onChange={setA("visitUplift")}
            format={(n) => `+${n}`}
            unit="%"
          />
          <SliderField
            label="Share of after-hours leads recovered"
            value={Math.round(assumptions.afterHoursRecovery * 100)}
            min={0}
            max={100}
            step={5}
            onChange={setA("afterHoursRecovery")}
            format={String}
            unit="%"
          />
          <SliderField
            label="Share of repetitive replies automated"
            value={Math.round(assumptions.automationShare * 100)}
            min={0}
            max={100}
            step={5}
            onChange={setA("automationShare")}
            format={String}
            unit="%"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Also assumed: {Math.round(MODEL_CONSTANTS.afterHoursShare * 100)}% of inquiries arrive after hours, {MODEL_CONSTANTS.workingDaysPerMonth} working days a
            month, and the uplift is scaled down for teams that already reply quickly.
          </p>
        </div>
      </div>
    </div>
  );
}
