"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarCheck, CheckCircle2, PlayCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { ChatComposer } from "@/components/ui/ChatComposer";
import { ChatHeader } from "@/components/ui/ChatHeader";
import { ChatNotice } from "@/components/ui/ChatNotice";
import { InstagramGlyph } from "@/components/ui/icons";
import { LightStroke, LightStrokeFrame } from "@/components/ui/LightStroke";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { HighlightedTitle } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { brand, sectionIds } from "@/data/brand";
import { demoUrl, openDemo } from "@/lib/demoLinks";
import { heroChat, heroChatScript, heroContent } from "@/data/hero";
import { usePauseOffscreen } from "@/hooks/usePauseOffscreen";
import { useScriptPlayer } from "@/hooks/useScriptPlayer";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  // The floating cards' CSS float animation stops once the hero scrolls away.
  usePauseOffscreen(ref);
  return (
    <section
      ref={ref}
      id={sectionIds.hero}
      aria-labelledby="hero-title"
      className="relative overflow-hidden pb-16 pt-[calc(var(--nav-height)+2.5rem)] md:pb-24 lg:pt-[calc(var(--nav-height)+4rem)]"
    >
      <GlowBackground />

      <div className="container grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <HeroCopy />
        <HeroPhone />
      </div>
    </section>
  );
}

function GlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(232_105_46/0.22),transparent)] dark:bg-[radial-gradient(closest-side,rgb(232_105_46/0.16),transparent)]" />
      <div className="absolute bottom-[-12rem] right-[20%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(245_138_75/0.25),transparent)] dark:bg-[radial-gradient(closest-side,rgb(245_138_75/0.12),transparent)]" />
      <div className="absolute -left-40 top-20 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,rgb(143_55_20/0.12),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

function HeroCopy() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="max-w-2xl text-center lg:text-left"
    >
      <motion.div variants={fadeUp}>
        <Badge className="text-left">
          {heroContent.badge}
        </Badge>
      </motion.div>

      {/* H1 isn't faded in so it paints immediately (LCP) */}
      <h1
        id="hero-title"
        className="mt-6 text-[2.1rem] font-light leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.3rem] xl:text-[3.6rem]"
      >
        <HighlightedTitle title={heroContent.headline.text} highlight={heroContent.headline.highlight} />
      </h1>
      <LightStroke className="mx-auto mt-5 w-48 lg:mx-0" delay={0.6} />

      <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
        {heroContent.subheading}
      </motion.p>

      <motion.div variants={fadeUp} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
        <Button href={brand.cta.primary.href} size="lg" data-track="cta" data-track-location="hero_trial" rightIcon={<ArrowRight aria-hidden className="h-4 w-4" />}>
          {brand.cta.primary.label}
        </Button>
        <Button
          href={demoUrl("whatsapp")}
          onClick={openDemo}
          data-track="cta"
          data-track-location="hero_live_demo"
          variant="outline"
          size="lg"
          leftIcon={<PlayCircle aria-hidden className="h-5 w-5 text-copper-700 dark:text-copper-300" />}
        >
          {brand.cta.liveDemo.label}
        </Button>
      </motion.div>

      <motion.ul
        variants={fadeUp}
        aria-label="Trial benefits"
        className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground lg:justify-start"
      >
        {heroContent.trust.map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <CheckCircle2 aria-hidden className="h-4 w-4 text-copper-700 dark:text-copper-300" />
            {item}
          </li>
        ))}
      </motion.ul>

      <motion.div variants={fadeUp} className="mt-10 border-t border-border pt-6">
        <dl className="grid grid-cols-3 gap-4 text-left sm:gap-8">
          {heroContent.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <StatCounter prefix={stat.prefix} value={stat.value} suffix={stat.suffix} label={stat.label} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-left text-xs text-muted-foreground">* {heroContent.statsDisclaimer}</p>
      </motion.div>
    </motion.div>
  );
}

function HeroPhone() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef, { amount: 0.3 });
  const reduce = useReducedMotion() ?? false;
  const {
    state: { messages, typing, selections, toast },
  } = useScriptPlayer(heroChatScript, {
    active: inView,
    loop: true,
    reducedMotion: reduce,
  });

  // Keep the newest message in view, like a real chat.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages.length, typing, reduce]);

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-[440px] px-4 sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="relative"
      >
        {/* Signature light stroke tracing the phone. */}
        <LightStrokeFrame className="-inset-3 left-1/2 h-[calc(100%+1.5rem)] w-[min(calc(100%+1.5rem),344px)] -translate-x-1/2" />
        <PhoneFrame label="Example WhatsApp conversation between a buyer and the Skyline Heights AI concierge" className="max-w-[300px] sm:max-w-[320px]">
          <ChatHeader
            name={heroChat.contact.name}
            initials={heroChat.contact.initials}
            verified={heroChat.contact.verified}
            status={typing === "bot" ? "typing…" : heroChat.contact.status}
            statusActive={typing === "bot"}
          />
          <div className="wa-wallpaper flex min-h-0 flex-1 flex-col">
            <div
              ref={listRef}
              role="log"
              aria-live="off"
              aria-label="Demo conversation"
              className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-3 pb-2 pt-3"
            >
              <ChatNotice kind="date">Today</ChatNotice>
              <ChatNotice className="mb-1.5">{heroChat.encryptionNotice}</ChatNotice>
              {messages.map((m, i) => (
                <ChatBubble
                  key={m.id}
                  sender={m.sender}
                  text={m.text}
                  timestamp={m.timestamp}
                  status={m.status}
                  attachments={m.attachments}
                  quickReplies={m.quickReplies}
                  selectedReplyId={selections[m.id]}
                  tail={i === 0 || messages[i - 1].sender !== m.sender}
                  animate={!reduce}
                  className={cn(i > 0 && messages[i - 1].sender !== m.sender && "mt-1.5")}
                />
              ))}
              <AnimatePresence>
                {typing && <TypingIndicator key="typing" sender={typing} label={`${heroChat.contact.name} is typing`} />}
              </AnimatePresence>
            </div>
            <ChatComposer />
          </div>
        </PhoneFrame>
      </motion.div>

      {/* Reserved height prevents layout shift when the toast appears */}
      <div className="mt-5 flex h-10 justify-center" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4 }}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground"
            >
              <CheckCircle2 aria-hidden className="h-4 w-4 text-copper-700 dark:text-copper-300" />
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <p className="eyebrow mt-1 text-center !text-[10px]">Demo built by Reazix · fictional project</p>

      <FloatingCard
        className="left-0 top-[14%] sm:-left-2 lg:-left-10"
        floatClass="animate-float"
        delay={0.6}
        icon={
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ig-gradient text-white">
            <InstagramGlyph className="h-[18px] w-[18px]" />
          </span>
        }
        title={heroChat.floatingCards.instagram.title}
        body={heroChat.floatingCards.instagram.body}
      />
      <FloatingCard
        className="bottom-[22%] right-0 sm:-right-2 lg:-right-6"
        floatClass="animate-float-slow"
        delay={0.9}
        icon={
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper-400/20 text-copper-700 dark:text-copper-300">
            <CalendarCheck aria-hidden className="h-[18px] w-[18px]" />
          </span>
        }
        title={heroChat.floatingCards.calendar.title}
        body={heroChat.floatingCards.calendar.body}
      />
    </div>
  );
}

interface FloatingCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
  floatClass: string;
  delay: number;
}

function FloatingCard({ icon, title, body, className, floatClass, delay }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn("absolute z-10 w-[200px] sm:w-[220px]", className)}
    >
      <div className={cn("glass flex items-center gap-3 rounded-card p-3", floatClass)}>
        {icon}
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[12.5px] font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{body}</p>
        </div>
      </div>
    </motion.div>
  );
}
