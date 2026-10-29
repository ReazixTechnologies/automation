"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Plus, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { campaigns as seed, campaignSegments, type Campaign, type CampaignStatus } from "@/data/dashboardDemo";
import { formatCount } from "@/lib/roi";
import { cn } from "@/lib/utils";

const statusStyles: Record<CampaignStatus, string> = {
  Completed: "bg-muted text-muted-foreground",
  Running: "bg-copper-500/15 text-copper-700 dark:text-copper-300",
  Scheduled: "bg-copper-400/15 text-copper-700 dark:text-copper-300",
  Draft: "bg-muted text-muted-foreground",
};

const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}%` : "—");

export function CampaignsTab() {
  const [list, setList] = useState<Campaign[]>(seed);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const selected = list.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
      <div className={cn("min-h-0 overflow-y-auto p-4 sm:p-5", selected && "hidden lg:block")}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Broadcast campaigns</h3>
            <p className="text-xs text-muted-foreground">Approved WhatsApp templates · demo data</p>
          </div>
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-copper-500 px-4 py-2 text-sm font-semibold text-ink shadow-glow-copper transition-colors hover:shadow-glow-copper-strong"
          >
            <Plus aria-hidden className="h-4 w-4" /> Create Campaign
          </button>
        </div>

        {/* Table on wide screens */}
        <div className="hidden overflow-hidden rounded-card border border-border md:block">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Broadcast campaigns with delivery and reply counts. Select a campaign name for details.</caption>
            <thead className="bg-muted/70 text-xs text-muted-foreground">
              <tr>
                {["Campaign", "Audience", "Sent", "Delivered", "Read", "Replied", "Status"].map((h, i) => (
                  <th key={h} scope="col" className={cn("px-3 py-2.5 font-semibold", i > 0 && i < 6 && "text-right")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn("cursor-pointer border-t border-border transition-colors hover:bg-foreground/[0.03]", selectedId === c.id && "bg-copper-500/[0.07]")}
                >
                  <th scope="row" className="px-3 py-3 font-semibold text-foreground">
                    <button type="button" onClick={() => setSelectedId(c.id)} aria-pressed={selectedId === c.id} className="text-left hover:underline">
                      {c.name}
                    </button>
                    <span className="block text-[11px] font-normal text-muted-foreground">{c.segment}</span>
                  </th>
                  {[c.audience, c.sent, c.delivered, c.read, c.replied].map((n, i) => (
                    <td key={i} className="px-3 py-3 text-right tabular-nums text-foreground">
                      {n ? formatCount(n) : "—"}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusStyles[c.status])}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards on small screens */}
        <ul className="grid gap-2 md:hidden">
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelectedId(c.id)}
                className="w-full rounded-card border border-border bg-card p-3 text-left"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusStyles[c.status])}>{c.status}</span>
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatCount(c.audience)} contacts · {c.sent ? `${pct(c.read, c.sent)} read · ${pct(c.replied, c.sent)} replied` : "not sent yet"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail panel */}
      <div className={cn("min-h-0 overflow-y-auto border-border bg-muted/40 lg:border-l", selected ? "block" : "hidden lg:block")}>
        {selected ? (
          <CampaignDetail campaign={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            Select a campaign to preview its template and funnel.
          </p>
        )}
      </div>

      <AnimatePresence>
        {wizardOpen && (
          <CampaignWizard
            onClose={() => setWizardOpen(false)}
            onLaunch={(c) => {
              setList((l) => [c, ...l]);
              setSelectedId(c.id);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplatePreview({ template }: { template: Campaign["template"] }) {
  return (
    <div className="wa-wallpaper rounded-card p-3">
      <ChatBubble
        variant="whatsapp"
        sender="bot"
        animate={false}
        text={
          <>
            <strong className="block">{template.header}</strong>
            {template.body}
          </>
        }
        timestamp="10:00 AM"
        quickReplies={template.buttons.map((b, i) => ({ id: String(i), label: b }))}
        replyLayout="stacked"
      />
    </div>
  );
}

function CampaignDetail({ campaign: c, onBack }: { campaign: Campaign; onBack: () => void }) {
  const steps = [
    { label: "Sent", value: c.sent },
    { label: "Read", value: c.read },
    { label: "Replied", value: c.replied },
    { label: "Visit booked", value: c.visits },
  ];
  return (
    <div className="p-4 sm:p-5">
      <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground lg:hidden">
        <ArrowLeft aria-hidden className="h-4 w-4" /> All campaigns
      </button>
      <h4 className="font-display text-base font-bold text-foreground">{c.name}</h4>
      <p className="text-xs text-muted-foreground">
        {c.segment} · {formatCount(c.audience)} contacts
      </p>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Template preview</p>
      <div className="mt-2">
        <TemplatePreview template={c.template} />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Funnel</p>
      {c.sent ? (
        <ol className="mt-2 space-y-2" aria-label={`Funnel: ${steps.map((s) => `${s.label} ${formatCount(s.value)}`).join(", ")}`}>
          {steps.map((s) => (
            <li key={s.label}>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">{s.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCount(s.value)} · {pct(s.value, c.sent)}
                </span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <motion.div
                  className="h-full rounded-full bg-[#C4501F] dark:bg-[#F58A4B]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, (s.value / c.sent) * 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 rounded-card border border-dashed border-border p-3 text-xs text-muted-foreground">
          Scheduled. Funnel numbers appear once it sends.
        </p>
      )}
    </div>
  );
}

const templates = [
  {
    id: "launch",
    name: "Launch alert",
    template: { header: "🚀 New tower launch", body: "Be the first to see the new floor plans. Early-bird prices for the first 50 homes.", buttons: ["Send price sheet", "Book a visit"] },
  },
  {
    id: "visit",
    name: "Site visit invite",
    template: { header: "🏡 Open house this weekend", body: "Tour the sample flat with free pickup from the metro station.", buttons: ["Sat slots", "Sun slots"] },
  },
];

function CampaignWizard({ onClose, onLaunch }: { onClose: () => void; onLaunch: (c: Campaign) => void }) {
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState(campaignSegments[0].id);
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [when, setWhen] = useState<"now" | "sat">("sat");
  const [done, setDone] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const seg = campaignSegments.find((s) => s.id === segment)!;
  const tpl = templates.find((t) => t.id === templateId)!;

  useEffect(() => {
    const dialog = dialogRef.current;
    (dialog?.querySelector<HTMLElement>("input:checked") ?? dialog?.querySelector<HTMLElement>("button"))?.focus();
  }, [step, done]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>("button, input, select")];
    if (e.shiftKey && document.activeElement === items[0]) {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
      e.preventDefault();
      items[0].focus();
    }
  };

  const launch = () => {
    onLaunch({
      id: `new-${Date.now()}`,
      name: tpl.name,
      audience: seg.count,
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      visits: 0,
      status: "Scheduled",
      segment: seg.label,
      template: tpl.template,
    });
    setDone(true);
  };

  const stepTitles = ["Audience", "Template", "Schedule"];

  return (
    // The backdrop is the presence child, so it (not just the dialog) is removed on close,
    // and it stops catching clicks as soon as it starts fading out.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px]"
      onKeyDown={onKeyDown}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center justify-between">
          <h4 id="wizard-title" className="font-display text-base font-bold text-foreground">
            {done ? "Campaign scheduled" : `New campaign · ${stepTitles[step]}`}
          </h4>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-foreground/5">
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="py-6 text-center">
            <CheckCircle2 aria-hidden className="mx-auto h-12 w-12 text-copper-400" />
            <p className="mt-3 font-semibold text-foreground">
              {tpl.name} scheduled for {formatCount(seg.count)} contacts
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {when === "now" ? "Sending now" : "Sends Saturday, 10:00 AM"} via the official WhatsApp API. (Demo: nothing is actually sent.)
            </p>
            <button type="button" onClick={onClose} className="mt-5 rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-ink">
              Done
            </button>
          </div>
        ) : (
          <>
            <ol className="mt-3 flex gap-1.5" aria-label="Steps">
              {stepTitles.map((t, i) => (
                <li key={t} aria-current={i === step ? "step" : undefined} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-copper-500" : "bg-muted")}>
                  <span className="sr-only">
                    Step {i + 1}: {t}
                  </span>
                </li>
              ))}
            </ol>

            <fieldset className="mt-4">
              {step === 0 && (
                <>
                  <legend className="text-sm text-muted-foreground">Who should receive it?</legend>
                  <div className="mt-2 grid gap-2">
                    {campaignSegments.map((s) => (
                      <label key={s.id} className={cn("flex cursor-pointer items-center gap-3 rounded-card border p-3", segment === s.id ? "border-copper-500 bg-copper-500/[0.06]" : "border-border")}>
                        <input type="radio" name="segment" value={s.id} checked={segment === s.id} onChange={() => setSegment(s.id)} className="accent-[#E8692E]" />
                        <span className="flex-1 text-sm font-medium text-foreground">{s.label}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">{formatCount(s.count)}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <legend className="text-sm text-muted-foreground">Pick an approved template</legend>
                  <div className="mt-2 grid gap-2">
                    {templates.map((t) => (
                      <label key={t.id} className={cn("flex cursor-pointer items-center gap-3 rounded-card border p-3", templateId === t.id ? "border-copper-500 bg-copper-500/[0.06]" : "border-border")}>
                        <input type="radio" name="template" value={t.id} checked={templateId === t.id} onChange={() => setTemplateId(t.id)} className="accent-[#E8692E]" />
                        <span className="text-sm font-medium text-foreground">{t.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <TemplatePreview template={tpl.template} />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <legend className="text-sm text-muted-foreground">When should it go out?</legend>
                  <div className="mt-2 grid gap-2">
                    {[
                      { id: "now" as const, label: "Send now" },
                      { id: "sat" as const, label: "Saturday, 10:00 AM (best open rate)" },
                    ].map((o) => (
                      <label key={o.id} className={cn("flex cursor-pointer items-center gap-3 rounded-card border p-3", when === o.id ? "border-copper-500 bg-copper-500/[0.06]" : "border-border")}>
                        <input type="radio" name="when" value={o.id} checked={when === o.id} onChange={() => setWhen(o.id)} className="accent-[#E8692E]" />
                        <span className="text-sm font-medium text-foreground">{o.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </fieldset>

            <div className="mt-5 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-foreground/5"
              >
                {step === 0 ? "Cancel" : "Back"}
              </button>
              <button
                type="button"
                onClick={() => (step < 2 ? setStep((s) => s + 1) : launch())}
                className="inline-flex items-center gap-1.5 rounded-full bg-copper-500 px-4 py-2 text-sm font-semibold text-ink hover:shadow-glow-copper-strong"
              >
                {step < 2 ? "Next" : (
                  <>
                    <Send aria-hidden className="h-4 w-4" /> Schedule campaign
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
