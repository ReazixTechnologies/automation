"use client";

import { Camera, Mic, Paperclip, SendHorizontal, Smile } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import type { ChatVariant } from "@/types/chat";

interface ChatComposerProps {
  variant?: ChatVariant;
  /** When provided the composer becomes a real text input; otherwise it is decorative. */
  onSubmit?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Accessible label for the text field. */
  inputLabel?: string;
  maxLength?: number;
  /** Keep the field editable but block sending (e.g. while a reply streams). */
  sendDisabled?: boolean;
  /** Replace the draft and focus the field; a new `id` re-applies the same text. */
  prefill?: { text: string; id: number } | null;
  /** Called on every keystroke with the current draft. */
  onDraftChange?: (value: string) => void;
  className?: string;
}

/** Message input bar at the bottom of a phone chat. Decorative unless `onSubmit` is set. */
export const ChatComposer = forwardRef<HTMLInputElement, ChatComposerProps>(function ChatComposer(
  {
    variant = "whatsapp",
    onSubmit,
    disabled = false,
    placeholder,
    inputLabel = "Type a message",
    maxLength = 160,
    sendDisabled = false,
    prefill,
    onDraftChange,
    className,
  },
  ref,
) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (!prefill) return;
    setValue(prefill.text);
    onDraftChange?.(prefill.text);
    inputRef.current?.focus({ preventScroll: true });
    // onDraftChange is a callback prop; re-running on its identity would re-apply the prefill.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.id]);
  const interactive = Boolean(onSubmit);
  const isWa = variant === "whatsapp";
  const canSend = interactive && !disabled && !sendDisabled && value.trim().length > 0;
  const hint = placeholder ?? (isWa ? "Message" : "Message…");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSubmit?.(value.trim());
    setValue("");
    onDraftChange?.("");
  };

  const field = interactive ? (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onDraftChange?.(e.target.value);
      }}
      disabled={disabled}
      placeholder={hint}
      aria-label={inputLabel}
      maxLength={maxLength}
      enterKeyHint="send"
      autoComplete="off"
      className="min-w-0 flex-1 bg-transparent text-[12.5px] text-[#111B21] placeholder:text-[#667781] dark:placeholder:text-[#8696A0] focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed dark:text-[#E9EDEF]"
    />
  ) : (
    <span className="flex-1">{hint}</span>
  );

  const Wrapper = interactive ? "form" : "div";

  if (!isWa) {
    return (
      <Wrapper
        aria-hidden={interactive ? undefined : true}
        onSubmit={interactive ? handleSubmit : undefined}
        className={cn("shrink-0 bg-white px-3 pb-4 pt-2 dark:bg-black", className)}
      >
        <div className="flex h-9 items-center gap-2 rounded-full border border-[#DBDBDB] px-1.5 text-[12px] text-[#737373] focus-within:border-ig-purple dark:border-[#363636]">
          <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0095F6] text-white">
            <Camera className="h-3.5 w-3.5" />
          </span>
          {field}
          {canSend ? (
            <button type="submit" className="rounded-full px-2 text-[12.5px] font-semibold text-[#0095F6]">
              Send
            </button>
          ) : (
            <Mic aria-hidden className="mr-1.5 h-4 w-4" />
          )}
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      aria-hidden={interactive ? undefined : true}
      onSubmit={interactive ? handleSubmit : undefined}
      className={cn("flex shrink-0 items-center gap-1.5 px-1.5 pb-4 pt-1.5", className)}
    >
      <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-white px-3 text-[12px] text-[#667781] shadow-[0_1px_0.5px_rgb(11_18_21/0.13)] focus-within:ring-2 dark:text-[#8696A0] focus-within:ring-wa/60 dark:bg-[#202C33]">
        <Smile aria-hidden className="h-4 w-4 shrink-0" />
        {field}
        <Paperclip aria-hidden className="h-4 w-4 shrink-0 -rotate-45" />
        <Camera aria-hidden className="h-4 w-4 shrink-0" />
      </div>
      {interactive ? (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wa-teal text-white transition-opacity disabled:opacity-60 dark:bg-wa dark:text-ink"
        >
          {canSend ? <SendHorizontal aria-hidden className="h-4 w-4" /> : <Mic aria-hidden className="h-4 w-4" />}
        </button>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wa-teal text-white dark:bg-wa">
          <Mic className="h-4 w-4" />
        </span>
      )}
    </Wrapper>
  );
});
