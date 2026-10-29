"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw, WifiOff, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLiveChat } from "@/components/providers/LiveChatProvider";
import { BehindTheScenes } from "@/components/simulator/BehindTheScenes";
import { ChannelToggle } from "@/components/simulator/ChannelToggle";
import { LeadCard } from "@/components/simulator/LeadCard";
import { ShareDemo } from "@/components/simulator/ShareDemo";
import { SimulatorPhone } from "@/components/simulator/SimulatorPhone";
import { Button } from "@/components/ui/Button";
import { PoweredBy } from "@/components/ui/PoweredBy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brand, sectionIds } from "@/data/brand";
import { CHAT_LIMITS } from "@/lib/ai/config";

export function ChatSimulator() {
  const reducedMotion = useReducedMotion() ?? false;

  const [caption, setCaption] = useState<string | null>(null);
  // Conversation state lives in LiveChatProvider so the dashboard preview can show it.
  const chat = useLiveChat();
  const { channel, setChannel } = chat;
  const locked = chat.userMessageCount >= CHAT_LIMITS.maxUserMessages;

  useEffect(() => {
    if (!caption) return;
    const t = window.setTimeout(() => setCaption(null), 3500);
    return () => clearTimeout(t);
  }, [caption]);

  return (
    <section id={sectionIds.liveDemo} aria-labelledby="live-demo-title" className="section-y relative overflow-hidden bg-muted/60">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-40 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(232_105_46/0.10),transparent)]" />

      <div className="container">
        <SectionHeading
          id="live-demo-title"
          eyebrow="Live AI Demo"
          title="Chat With an AI Concierge We Built — Right Now"
          highlight="AI Concierge"
          description="Ask anything a real buyer would. This demo for a fictional project is the exact experience Reazix builds for your buyers."
        />

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,300px)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,290px)_minmax(0,1fr)_minmax(0,320px)]">
          <BehindTheScenes entries={chat.feed} className="hidden lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)] lg:block" />

          <div className="flex min-w-0 flex-col items-center">
            <div className="mb-4 flex w-full max-w-[400px] flex-wrap items-center justify-between gap-2">
              <ChannelToggle value={channel} onChange={setChannel} />
              <div className="flex items-center gap-1">
                {chat.mode === "offline" && (
                  <span
                    title="No AI key configured or the AI is unavailable, so answers come from the FAQ knowledge base."
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-copper-400/40 bg-copper-400/10 px-2 py-1 text-[10.5px] font-semibold text-copper-700 dark:text-copper-300"
                  >
                    <WifiOff aria-hidden className="h-3 w-3" />
                    Offline<span className="hidden sm:inline"> demo mode</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={chat.restart}
                  aria-label="Restart conversation"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <RotateCcw aria-hidden className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>

            <SimulatorPhone
              channel={channel}
              items={chat.items}
              suggestions={chat.suggestions}
              isTyping={chat.isTyping}
              isBusy={chat.isBusy}
              locked={locked}
              reducedMotion={reducedMotion}
              onSend={chat.send}
              onCaption={setCaption}
              prefill={chat.prefill}
            />

            <div aria-live="polite" className="mt-4 flex min-h-[2.5rem] w-full max-w-[400px] flex-col items-center justify-start gap-1 text-center">
              <AnimatePresence mode="wait" initial={false}>
                {caption ? (
                  <motion.p
                    key={caption}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
                  >
                    <Zap aria-hidden className="h-4 w-4 fill-copper-400 text-copper-400" />
                    {caption}
                  </motion.p>
                ) : (
                  <motion.p key="note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground">
                    Demo built by Reazix for a fictional project. Don&apos;t share real personal information.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <PoweredBy className="mt-1" />
          </div>

          <LeadCard
            lead={chat.lead}
            channel={channel === "whatsapp" ? "WhatsApp" : "Instagram DM"}
            className="min-w-0 lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)]"
          />
        </div>

        <ShareDemo className="mx-auto mt-10 max-w-3xl" />

        <div className="mt-12 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
          <p className="font-display text-lg font-light text-foreground">Want this for your project?</p>
          <Button href={brand.cta.primary.href} size="lg" rightIcon={<ArrowRight aria-hidden className="h-4 w-4" />}>
            {brand.cta.primary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
