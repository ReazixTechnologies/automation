"use client";

import { forwardRef, useState } from "react";
import { ChatComposer } from "@/components/ui/ChatComposer";
import { CHAT_LIMITS } from "@/lib/ai/config";
import { cn } from "@/lib/utils";
import type { ChatVariant } from "@/types/chat";

interface ChatInputProps {
  variant: ChatVariant;
  onSend: (text: string) => void;
  /** A reply is streaming: typing is allowed, sending is not. */
  busy: boolean;
  /** Hard stop, e.g. the conversation limit was reached. */
  disabled?: boolean;
  prefill?: { text: string; id: number } | null;
}

/** The simulator's composer: the shared ChatComposer plus the demo's length limit. */
export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(function ChatInput({ variant, onSend, busy, disabled, prefill }, ref) {
  const [length, setLength] = useState(0);
  const nearLimit = length > CHAT_LIMITS.maxMessageChars - 80;

  return (
    <div className="relative">
      <ChatComposer
        ref={ref}
        variant={variant}
        onSubmit={onSend}
        sendDisabled={busy}
        disabled={disabled}
        prefill={prefill}
        maxLength={CHAT_LIMITS.maxMessageChars}
        onDraftChange={(v) => setLength(v.length)}
        placeholder={disabled ? "Restart to chat again" : variant === "whatsapp" ? "Message" : "Message…"}
        inputLabel="Message the AI property concierge"
      />
      {nearLimit && (
        <span
          aria-live="polite"
          className={cn(
            "pointer-events-none absolute -top-4 right-4 rounded bg-black/60 px-1.5 text-[10px] tabular-nums text-white",
            length >= CHAT_LIMITS.maxMessageChars && "bg-[#B42318]",
          )}
        >
          {length}/{CHAT_LIMITS.maxMessageChars}
        </span>
      )}
    </div>
  );
});
