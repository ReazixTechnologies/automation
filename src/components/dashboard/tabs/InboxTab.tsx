"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  FileText,
  Info,
  Lock,
  Megaphone,
  MessageCircle,
  Phone,
  PhoneCall,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { ChatComposer } from "@/components/ui/ChatComposer";
import { InstagramGlyph, WhatsAppGlyph } from "@/components/ui/icons";
import { agents, type Conversation, type DemoMessage, type TimelineEvent } from "@/data/dashboardDemo";
import { cn } from "@/lib/utils";

export type ChannelFilter = "all" | "whatsapp" | "instagram";

interface InboxTabProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReply: (id: string, text: string) => void;
  onAssign: (id: string, agentId: string) => void;
  onCall: (conversation: Conversation) => void;
  filter: ChannelFilter;
  search: string;
}

const agentById = (id: string) => agents.find((a) => a.id === id) ?? agents[0];

function scoreTone(score: number) {
  if (score >= 70) return { dot: "bg-[#D1356E] dark:bg-[#E0457B]", label: "Hot" };
  if (score >= 40) return { dot: "bg-[#C08B12] dark:bg-[#B98A10]", label: "Warm" };
  return { dot: "bg-[#2F6FB0] dark:bg-[#3D85D0]", label: "Cold" };
}

const tagStyles: Record<string, string> = {
  Hot: "bg-[#D1356E]/10 text-[#A3204F] dark:text-[#F08AB0]",
  HNI: "bg-copper-400/15 text-copper-700 dark:text-copper-300",
  "Site Visit": "bg-copper-500/15 text-copper-700 dark:text-copper-300",
  Investor: "bg-ig-purple/10 text-ig-purple dark:text-[#C4A1F5]",
};

/** Three panes on desktop; one pane at a time (list -> chat -> contact) below lg. */
export function InboxTab({ conversations, selectedId, onSelect, onReply, onAssign, onCall, filter, search }: InboxTabProps) {
  const [mobileView, setMobileView] = useState<"list" | "chat" | "contact">("list");
  const q = search.trim().toLowerCase();
  const visible = conversations.filter(
    (c) => (filter === "all" || c.channel === filter) && (!q || `${c.name} ${c.lastMessage} ${c.tags.join(" ")}`.toLowerCase().includes(q)),
  );
  const selected = conversations.find((c) => c.id === selectedId) ?? visible[0] ?? null;

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,270px)_minmax(0,1fr)_minmax(0,250px)] xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,270px)]">
      {/* Conversation list */}
      <div className={cn("min-h-0 overflow-y-auto border-border lg:border-r", mobileView !== "list" && "hidden lg:block")}>
        <p className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-2.5 text-xs font-semibold text-muted-foreground backdrop-blur">
          <span>Conversations ({visible.length})</span>
          <span className="inline-flex items-center gap-1">
            <Sparkles aria-hidden className="h-3.5 w-3.5 text-copper-400" /> AI on
          </span>
        </p>
        <ul aria-label="Conversations">
          {visible.map((c) => (
            <li key={c.id}>
              <ConversationRow
                conversation={c}
                active={selected?.id === c.id}
                onClick={() => {
                  onSelect(c.id);
                  setMobileView("chat");
                }}
              />
            </li>
          ))}
          {visible.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted-foreground">No conversations match.</li>}
        </ul>
      </div>

      {/* Open chat */}
      <div className={cn("min-h-0 flex-col", mobileView === "chat" ? "flex" : "hidden lg:flex")}>
        {selected ? (
          <ChatPane
            conversation={selected}
            onBack={() => setMobileView("list")}
            onShowContact={() => setMobileView("contact")}
            onReply={(text) => onReply(selected.id, text)}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Contact details */}
      <div className={cn("min-h-0 overflow-y-auto border-border lg:border-l", mobileView === "contact" ? "block" : "hidden lg:block")}>
        {selected && (
          <ContactPane
            conversation={selected}
            onBack={() => setMobileView("chat")}
            onAssign={(agentId) => onAssign(selected.id, agentId)}
            onCall={() => onCall(selected)}
          />
        )}
      </div>
    </div>
  );
}

/** Channel identity, not branding: WhatsApp stays green, Instagram keeps its gradient. */
function ChannelBadge({ channel, className }: { channel: Conversation["channel"]; className?: string }) {
  return channel === "whatsapp" ? (
    <span className={cn("flex items-center justify-center rounded-full bg-wa text-white", className)} title="WhatsApp">
      <WhatsAppGlyph aria-hidden className="h-[70%] w-[70%]" />
      <span className="sr-only">WhatsApp</span>
    </span>
  ) : (
    <span className={cn("flex items-center justify-center rounded-full bg-ig-gradient text-white", className)} title="Instagram">
      <InstagramGlyph aria-hidden className="h-[65%] w-[65%]" />
      <span className="sr-only">Instagram</span>
    </span>
  );
}

function Avatar({ conversation, size = "md" }: { conversation: Conversation; size?: "md" | "lg" }) {
  return (
    <span className={cn("relative shrink-0", size === "lg" ? "h-14 w-14" : "h-10 w-10")}>
      <span
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full font-semibold text-white",
          conversation.live ? "bg-copper-gradient text-[11px]" : "bg-ink-700 text-xs",
          size === "lg" && "text-base",
        )}
      >
        {conversation.initials}
      </span>
      <ChannelBadge channel={conversation.channel} className="absolute -bottom-0.5 -right-0.5 h-4 w-4 ring-2 ring-card" />
    </span>
  );
}

function ConversationRow({ conversation: c, active, onClick }: { conversation: Conversation; active: boolean; onClick: () => void }) {
  const tone = scoreTone(c.score);
  const agent = agentById(c.agentId);
  return (
    <motion.button
      layout="position"
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors",
        active ? "bg-copper-500/[0.08]" : "hover:bg-foreground/[0.03]",
        c.live && "m-2 w-[calc(100%-1rem)] rounded-card border border-copper-500/60 shadow-[0_0_0_3px_rgb(232_105_46/0.15),0_8px_24px_-8px_rgb(232_105_46/0.5)]",
      )}
    >
      <Avatar conversation={c} />
      <span className="min-w-0 flex-1">
        {c.live && (
          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-copper-500 px-2 py-0.5 text-[10px] font-bold text-ink">
            <Sparkles aria-hidden className="h-3 w-3" />
            This is your conversation from the demo above
          </span>
        )}
        <span className="flex items-center gap-2">
          <span className={cn("truncate text-sm text-foreground", c.unread ? "font-bold" : "font-semibold")}>{c.name}</span>
          <span className={cn("h-2 w-2 shrink-0 rounded-full", tone.dot)} title={`Lead score ${c.score} (${tone.label})`} />
          <span className="sr-only">
            Lead score {c.score}, {tone.label}
          </span>
          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className={cn("truncate text-[13px]", c.unread ? "font-medium text-foreground" : "text-muted-foreground")}>{c.lastMessage}</span>
          {c.unread > 0 && (
            <motion.span
              key={c.unread}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-copper-500 px-1.5 text-[10.5px] font-bold text-ink"
            >
              {c.unread}
              <span className="sr-only"> unread</span>
            </motion.span>
          )}
        </span>
        <span className="mt-1.5 flex items-center gap-1">
          {c.tags.map((t) => (
            <span key={t} className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", tagStyles[t] ?? "bg-muted text-muted-foreground")}>
              {t}
            </span>
          ))}
          <span className={cn("ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[8.5px] font-bold text-white", agent.color)} title={`Assigned to ${agent.name}`}>
            {agent.initials}
          </span>
          <span className="sr-only">Assigned to {agent.name}</span>
        </span>
      </span>
    </motion.button>
  );
}

function ChatPane({
  conversation: c,
  onBack,
  onShowContact,
  onReply,
}: {
  conversation: Conversation;
  onBack: () => void;
  onShowContact: () => void;
  onReply: (text: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const handledByAi = c.messages[c.messages.length - 1]?.from === "ai";

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [c.id, c.messages.length]);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-3 py-2.5 sm:px-4">
        <button type="button" onClick={onBack} aria-label="Back to conversations" className="rounded-full p-1.5 hover:bg-foreground/5 lg:hidden">
          <ArrowLeft aria-hidden className="h-4 w-4" />
        </button>
        <Avatar conversation={c} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
          <p className="truncate text-xs text-muted-foreground">{c.handle}</p>
        </div>
        <span
          className={cn(
            "hidden items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold sm:inline-flex",
            handledByAi ? "bg-copper-400/15 text-copper-700 dark:text-copper-300" : "bg-copper-500/15 text-copper-700 dark:text-copper-300",
          )}
        >
          {handledByAi ? <Sparkles aria-hidden className="h-3 w-3" /> : <BadgeCheck aria-hidden className="h-3 w-3" />}
          {handledByAi ? "AI handling" : `Human: ${agentById(c.agentId).name}`}
        </span>
        <button type="button" onClick={onShowContact} aria-label="Contact details" className="rounded-full p-1.5 hover:bg-foreground/5 lg:hidden">
          <Info aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <div ref={listRef} role="log" tabIndex={0} aria-label={`Messages with ${c.name}`} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto bg-muted/60 px-3 py-4 sm:px-5">
        {c.messages.map((m, i) => (
          <MessageRow key={m.id} message={m} channel={c.channel} prev={c.messages[i - 1]} />
        ))}
      </div>

      <ChatComposer variant={c.channel} onSubmit={onReply} placeholder={`Reply as ${agentById("rahul").name} (demo)…`} inputLabel={`Reply to ${c.name}`} maxLength={300} />
    </>
  );
}

function MessageRow({ message: m, channel, prev }: { message: DemoMessage; channel: Conversation["channel"]; prev?: DemoMessage }) {
  if (m.from === "note") {
    const agent = agentById(m.agentId ?? "rahul");
    return (
      <div className="my-1 ml-auto w-[85%] max-w-[360px] rounded-lg border border-[#E9C46A]/60 bg-[#FFF4CC] px-3 py-2 text-[12.5px] text-[#5C4A12] dark:border-[#E9C46A]/30 dark:bg-[#3A3016] dark:text-[#F5E3A8]">
        <p className="mb-0.5 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wide">
          <Lock aria-hidden className="h-3 w-3" /> Private note · {agent.name}
        </p>
        <p>{m.text}</p>
        <p className="mt-0.5 text-[10px] text-[#5C4A12] dark:text-[#F5E3A8]">Only your team sees this · {m.time}</p>
      </div>
    );
  }

  // In the business inbox the lead is on the left; AI and agents reply on the right.
  const outgoing = m.from !== "lead";
  const prevOutgoing = prev ? prev.from !== "lead" && prev.from !== "note" : null;
  const author = m.from === "ai" ? "✨ AI" : m.from === "agent" ? agentById(m.agentId ?? "rahul").name : undefined;
  return (
    <ChatBubble
      variant={channel}
      sender={outgoing ? "user" : "bot"}
      text={m.text || undefined}
      author={prevOutgoing === outgoing && prev?.from === m.from ? undefined : author}
      timestamp={m.time}
      status={outgoing ? "read" : undefined}
      attachments={m.attachment ? [{ type: "pdf", name: m.attachment.name, meta: m.attachment.meta }] : undefined}
      tail={prevOutgoing !== outgoing}
      animate={false}
      className={prev && prevOutgoing !== outgoing ? "mt-1.5" : undefined}
    />
  );
}

const timelineIcons: Record<TimelineEvent["kind"], typeof Phone> = {
  ad: Megaphone,
  chat: MessageCircle,
  brochure: FileText,
  visit: CalendarCheck,
  score: TrendingUp,
  call: PhoneCall,
  payment: Wallet,
};

function ScoreRing({ score }: { score: number }) {
  const tone = scoreTone(score);
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const stroke = score >= 70 ? "stroke-[#D1356E] dark:stroke-[#E0457B]" : score >= 40 ? "stroke-[#C08B12] dark:stroke-[#B98A10]" : "stroke-[#2F6FB0] dark:stroke-[#3D85D0]";
  return (
    <div className="relative h-[72px] w-[72px] shrink-0" role="img" aria-label={`Lead score ${score} out of 100, ${tone.label}`}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-muted" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className={stroke} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
      </svg>
      <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-base font-extrabold text-foreground">{score}</span>
        <span className="text-[9px] font-semibold text-muted-foreground">{tone.label}</span>
      </span>
    </div>
  );
}

function ContactPane({
  conversation: c,
  onBack,
  onAssign,
  onCall,
}: {
  conversation: Conversation;
  onBack: () => void;
  onAssign: (agentId: string) => void;
  onCall: () => void;
}) {
  const selectId = `assign-${c.id}`;
  return (
    <div className="p-4">
      <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground lg:hidden">
        <ArrowLeft aria-hidden className="h-4 w-4" /> Back to chat
      </button>
      <div className="flex items-center gap-3">
        <Avatar conversation={c} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-foreground">{c.name}</p>
          <p className="truncate text-xs text-muted-foreground">{c.handle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-card border border-border p-3">
        <ScoreRing score={c.score} />
        <p className="text-xs leading-snug text-muted-foreground">AI intent score from the conversation, budget and timeline signals.</p>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        {[
          ["Channel", c.channel === "whatsapp" ? "WhatsApp" : "Instagram DM"],
          ["Interest", c.configuration],
          ["Budget", c.budget],
          ["Source", c.source],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={onCall}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-copper-500 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:shadow-glow-copper-strong"
        >
          <Phone aria-hidden className="h-4 w-4" /> Call · 1-click escalate
        </button>
        <label htmlFor={selectId} className="mt-1 text-xs font-medium text-muted-foreground">
          Assign to
        </label>
        <select
          id={selectId}
          value={c.agentId}
          onChange={(e) => onAssign(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.role}
            </option>
          ))}
        </select>
      </div>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline</h4>
      <ol className="mt-2 space-y-3 border-l border-border pl-4">
        {c.timeline.map((e, i) => {
          const Icon = timelineIcons[e.kind];
          return (
            <li key={`${e.label}-${i}`} className="relative">
              <span className="absolute -left-[25px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-border bg-card">
                <Icon aria-hidden className="h-2.5 w-2.5 text-copper-700 dark:text-copper-300" />
              </span>
              <p className="text-[13px] leading-snug text-foreground">{e.label}</p>
              {e.time && <p className="text-[11px] text-muted-foreground">{e.time}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
      Select a conversation to open it.
    </div>
  );
}
