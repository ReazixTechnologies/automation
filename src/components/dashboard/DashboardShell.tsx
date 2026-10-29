"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { BarChart3, Bell, Inbox, Lock, Megaphone, MousePointerClick, Search, Settings, Users, Workflow, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useLiveChat } from "@/components/providers/LiveChatProvider";
import { agents } from "@/data/dashboardDemo";
import { cn } from "@/lib/utils";
import { LIVE_CONVERSATION_ID, liveDemoConversation } from "./liveConversation";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { AutomationsTab } from "./tabs/AutomationsTab";
import { CampaignsTab } from "./tabs/CampaignsTab";
import { InboxTab, type ChannelFilter } from "./tabs/InboxTab";
import { useDemoInbox } from "./useDemoInbox";

type TabId = "inbox" | "campaigns" | "analytics" | "automations";

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: "inbox", label: "Inbox", Icon: Inbox },
  { id: "campaigns", label: "Campaigns", Icon: Megaphone },
  { id: "analytics", label: "Analytics", Icon: BarChart3 },
  { id: "automations", label: "Automations", Icon: Workflow },
];

const LOCKED: { label: string; Icon: LucideIcon }[] = [
  { label: "Contacts", Icon: Users },
  { label: "Settings", Icon: Settings },
];

const FILTERS: { id: ChannelFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
];

function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

/** The interactive team-dashboard preview inside a browser window frame. */
export default function DashboardShell() {
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion() ?? false;
  const inView = useInView(rootRef, { amount: 0.3 });
  const pageVisible = usePageVisible();

  const [tab, setTab] = useState<TabId>("inbox");
  const [filter, setFilter] = useState<ChannelFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const inbox = useDemoInbox({ active: inView && pageVisible && !reduce, selectedId });

  // The visitor's own live-demo chat becomes the pinned top lead.
  const live = useLiveChat();
  const liveConversation = useMemo(() => liveDemoConversation(live.items, live.lead, live.channel), [live.items, live.lead, live.channel]);
  const conversations = useMemo(
    () => (liveConversation ? [liveConversation, ...inbox.conversations] : inbox.conversations),
    [liveConversation, inbox.conversations],
  );
  const hasLive = Boolean(liveConversation);
  const openId = selectedId ?? (hasLive ? LIVE_CONVERSATION_ID : conversations[0]?.id ?? null);
  const unreadTotal = conversations.reduce((n, c) => n + c.unread, 0);

  const { markRead } = inbox;
  useEffect(() => {
    if (openId) markRead(openId);
  }, [openId, markRead]);

  const toast = notice ?? inbox.toast?.text ?? null;
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const onTabKeyDown = (e: KeyboardEvent, index: number) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next: number | null = null;
    if (e.key in keys) next = (index + keys[e.key] + TABS.length) % TABS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    tabRefs.current[next]?.focus();
    setTab(TABS[next].id);
  };

  return (
    <div ref={rootRef} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/70 px-3 py-2.5 sm:px-4">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Lock aria-hidden className="h-3 w-3 shrink-0" />
          <span className="truncate">app.reazix.com/{tab}</span>
        </span>
        <span className="hidden items-center gap-1.5 rounded-full bg-copper-400/15 px-2.5 py-1 text-[11px] font-semibold text-copper-700 sm:inline-flex dark:text-copper-300">
          <MousePointerClick aria-hidden className="h-3.5 w-3.5" />
          Interactive preview — click around
        </span>
      </div>

      <div className="relative flex h-[640px] flex-col lg:h-[660px] lg:flex-row">
        {/* Sidebar on desktop; bottom tab bar on mobile */}
        <div className="order-last flex shrink-0 border-t border-border bg-card lg:order-first lg:w-[72px] lg:flex-col lg:items-center lg:border-r lg:border-t-0 lg:py-3">
          <div role="tablist" aria-label="Dashboard sections" aria-orientation="vertical" className="flex flex-1 lg:flex-none lg:flex-col lg:gap-1">
            {TABS.map(({ id, label, Icon }, i) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`dash-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`dash-panel-${id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10.5px] font-semibold transition-colors lg:w-14 lg:flex-none lg:rounded-xl lg:py-2.5",
                    selected ? "text-copper-700 dark:text-copper-300" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId={reduce ? undefined : "dash-tab"}
                      aria-hidden
                      className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-copper-500 lg:inset-0 lg:h-auto lg:rounded-xl lg:bg-copper-500/15"
                    />
                  )}
                  <span className="relative">
                    <Icon aria-hidden className="h-5 w-5" />
                    {id === "inbox" && unreadTotal > 0 && (
                      <span aria-hidden className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-[#E5484D]" />
                    )}
                  </span>
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="hidden lg:mt-auto lg:flex lg:flex-col lg:gap-1">
            {LOCKED.map(({ label, Icon }) => (
              <span key={label} className="group relative">
                <button
                  type="button"
                  aria-disabled="true"
                  aria-describedby={`locked-${label}`}
                  className="flex w-14 cursor-not-allowed flex-col items-center gap-0.5 rounded-xl py-2.5 text-[10.5px] font-semibold text-muted-foreground/60"
                >
                  <Icon aria-hidden className="h-5 w-5" />
                  {label}
                </button>
                <span
                  id={`locked-${label}`}
                  role="tooltip"
                  className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 dark:bg-white dark:text-ink"
                >
                  Available in full app
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:px-4">
            <label className="relative order-1 min-w-0 flex-1 sm:max-w-xs">
              <span className="sr-only">Search conversations</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setTab("inbox");
                }}
                placeholder="Search leads, tags…"
                className="w-full rounded-full border border-border bg-muted/60 py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </label>
            <div role="group" aria-label="Channel filter" className="order-3 flex w-full gap-1 sm:order-2 sm:w-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => {
                    setFilter(f.id);
                    setTab("inbox");
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    filter === f.id ? "border-copper-500 bg-copper-500/15 text-copper-700 dark:text-copper-300" : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
              <span className="hidden -space-x-2 sm:flex" aria-label={`Team online: ${agents.map((a) => a.name).join(", ")}`} role="img">
                {agents.map((a) => (
                  <span key={a.id} aria-hidden className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-card", a.color)}>
                    {a.initials}
                  </span>
                ))}
              </span>
              <button
                type="button"
                onClick={() => setTab("inbox")}
                aria-label={`Notifications: ${unreadTotal} unread messages`}
                className="relative rounded-full p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                <Bell aria-hidden className="h-5 w-5" />
                {unreadTotal > 0 && (
                  <motion.span
                    key={unreadTotal}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    aria-hidden
                    className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-bold text-white"
                  >
                    {unreadTotal}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Panel */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              id={`dash-panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`dash-tab-${tab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.18 }}
              className="min-h-0 flex-1"
            >
              {tab === "inbox" && (
                <InboxTab
                  conversations={conversations}
                  selectedId={openId}
                  onSelect={setSelectedId}
                  onReply={inbox.reply}
                  onAssign={inbox.assign}
                  onCall={(c) => setNotice(`Calling ${c.name}… escalated to a senior agent (demo)`)}
                  filter={filter}
                  search={search}
                />
              )}
              {tab === "campaigns" && <CampaignsTab />}
              {tab === "analytics" && <AnalyticsTab />}
              {tab === "automations" && <AutomationsTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast}
              role="status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="pointer-events-none absolute bottom-20 right-4 z-30 max-w-[calc(100%-2rem)] rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-card lg:bottom-4 dark:bg-white dark:text-ink"
            >
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
