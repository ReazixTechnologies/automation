"use client";

import { useReducedMotion } from "framer-motion";
import { useLiveChat } from "@/components/providers/LiveChatProvider";
import { ChatConversation } from "@/components/simulator/SimulatorPhone";
import { CHAT_LIMITS } from "@/lib/ai/config";

/** The launcher drawer's body: the same live chat as #live-demo (shared state). */
export default function ChatDrawerContent() {
  const chat = useLiveChat();
  const reducedMotion = useReducedMotion() ?? false;
  return (
    <ChatConversation
      channel={chat.channel}
      items={chat.items}
      suggestions={chat.suggestions}
      isTyping={chat.isTyping}
      isBusy={chat.isBusy}
      locked={chat.userMessageCount >= CHAT_LIMITS.maxUserMessages}
      reducedMotion={reducedMotion}
      onSend={chat.send}
      onCaption={() => {}}
      prefill={chat.prefill}
    />
  );
}
