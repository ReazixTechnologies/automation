"use client";

import { useReducedMotion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useChat } from "@/hooks/useChat";
import { track } from "@/lib/analytics";
import type { Channel } from "@/types/simulator";

type LiveChat = ReturnType<typeof useChat> & {
  channel: Channel;
  setChannel: (channel: Channel) => void;
};

const LiveChatContext = createContext<LiveChat | null>(null);

/**
 * Owns the live-demo conversation so other sections can read it: the chat
 * simulator renders it, and the dashboard preview shows it as a lead.
 */
export function LiveChatProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion() ?? false;
  const chat = useChat({ reducedMotion });
  const [channel, setChannelState] = useState<Channel>("whatsapp");
  const setChannel = useCallback((next: Channel) => {
    track("channel_toggled", { channel: next });
    setChannelState(next);
  }, []);
  const value = useMemo(() => ({ ...chat, channel, setChannel }), [chat, channel, setChannel]);
  return <LiveChatContext.Provider value={value}>{children}</LiveChatContext.Provider>;
}

export function useLiveChat() {
  const value = useContext(LiveChatContext);
  if (!value) throw new Error("useLiveChat must be used inside <LiveChatProvider>");
  return value;
}
