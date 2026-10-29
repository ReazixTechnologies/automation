"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { conversations as seed, currentAgentId, incomingPool, type Conversation } from "@/data/dashboardDemo";

const clock = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export interface InboxToast {
  id: number;
  text: string;
}

interface UseDemoInboxOptions {
  /** Simulated incoming messages run only while true. */
  active: boolean;
  /** The open conversation doesn't collect unread badges. */
  selectedId: string | null;
  intervalMs?: number;
}

/** Demo inbox state plus simulated live activity (a new message every ~8s). */
export function useDemoInbox({ active, selectedId, intervalMs = 8000 }: UseDemoInboxOptions) {
  const [conversations, setConversations] = useState<Conversation[]>(seed);
  const [toast, setToast] = useState<InboxToast | null>(null);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const listRef = useRef(conversations);
  listRef.current = conversations;
  const tick = useRef(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      const n = ++tick.current;
      // Rotate through leads and messages deterministically; skip the open chat.
      const candidates = listRef.current.filter((c) => c.id !== selectedRef.current);
      const target = candidates[(n * 3) % candidates.length];
      if (!target) return;
      const text = incomingPool[n % incomingPool.length];
      const message = { id: `live-${n}`, from: "lead" as const, text, time: clock() };
      setConversations((list) => {
        const current = list.find((c) => c.id === target.id);
        if (!current) return list;
        const updated = { ...current, lastMessage: text, time: "now", unread: current.unread + 1, messages: [...current.messages, message] };
        return [updated, ...list.filter((c) => c.id !== target.id)];
      });
      setToast({ id: n, text: `New ${target.channel === "whatsapp" ? "WhatsApp" : "Instagram"} message from ${target.name}` });
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const markRead = useCallback((id: string) => {
    setConversations((list) => list.map((c) => (c.id === id && c.unread ? { ...c, unread: 0 } : c)));
  }, []);

  const reply = useCallback((id: string, text: string) => {
    setConversations((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              lastMessage: `You: ${text}`,
              time: "now",
              messages: [...c.messages, { id: `reply-${Date.now()}`, from: "agent", agentId: currentAgentId, text, time: clock() }],
            }
          : c,
      ),
    );
  }, []);

  const assign = useCallback((id: string, agentId: string) => {
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, agentId } : c)));
  }, []);

  return { conversations, toast, setToast, markRead, reply, assign };
}
