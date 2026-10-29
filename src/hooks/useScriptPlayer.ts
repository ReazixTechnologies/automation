"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import type { ChatMessage, ChatScriptEvent, ChatSender, ChatVariant, ScriptComment } from "@/types/chat";

export interface ScriptState {
  messages: ChatMessage[];
  typing: ChatSender | null;
  /** messageId -> chosen option (quick reply, slot, catalog unit, payment method) */
  selections: Record<string, string>;
  toast: string | null;
  scene: string | null;
  variant: ChatVariant | null;
  pressed: string | null;
  score: number | null;
  clock: { time: string; label: string } | null;
  /** True right after a clock jump, until the next message lands. */
  clockJumping: boolean;
  comments: ScriptComment[];
}

export function initialScriptState(init: Partial<ScriptState> = {}): ScriptState {
  return {
    messages: [],
    typing: null,
    selections: {},
    toast: null,
    scene: null,
    variant: null,
    pressed: null,
    score: null,
    clock: null,
    clockJumping: false,
    comments: [],
    ...init,
  };
}

/** Outgoing messages read as "delivered" until the other side acts, then "read". */
const markRead = (messages: ChatMessage[]) =>
  messages.some((m) => m.sender === "user" && m.status !== "read")
    ? messages.map((m) => (m.sender === "user" ? { ...m, status: "read" as const } : m))
    : messages;

function apply(state: ScriptState, event: ChatScriptEvent): ScriptState {
  switch (event.type) {
    case "message": {
      const { message } = event;
      const prior = message.sender === "bot" ? markRead(state.messages) : state.messages;
      const added = message.sender === "user" ? { ...message, status: "delivered" as const } : message;
      return { ...state, typing: null, clockJumping: false, pressed: null, messages: [...prior, added] };
    }
    case "typing":
      return { ...state, messages: event.sender === "user" ? state.messages : markRead(state.messages) };
    case "select":
      return { ...state, selections: { ...state.selections, [event.messageId]: event.replyId } };
    case "toast":
      return { ...state, toast: event.text };
    case "scene":
      return { ...state, scene: event.scene, variant: event.variant ?? state.variant, pressed: null };
    case "press":
      return { ...state, pressed: event.target };
    case "score":
      return { ...state, score: event.value };
    case "clock":
      return { ...state, clock: { time: event.time, label: event.label }, clockJumping: true };
    case "comment":
      return { ...state, comments: [...state.comments, event.comment] };
    default:
      return state;
  }
}

/** The fully played script, used for reduced motion. */
export function finalScriptState(events: ChatScriptEvent[], init?: Partial<ScriptState>): ScriptState {
  const end = events.reduce(apply, initialScriptState(init));
  return { ...end, typing: null, pressed: null, clockJumping: false, messages: markRead(end.messages) };
}

const DEFAULT_DELAY = 350;

interface UseScriptPlayerOptions {
  /** Play while true; pauses (keeping its place) while false. */
  active?: boolean;
  loop?: boolean;
  loopDelay?: number;
  /** Show the final state immediately and never animate. */
  reducedMotion?: boolean;
  /** Starting scene, skin, etc. */
  initial?: Partial<ScriptState>;
}

/**
 * Steps through a scripted conversation. Pass a stable `events` array
 * (module-level data) so playback isn't reset on re-render.
 */
export function useScriptPlayer(
  events: ChatScriptEvent[],
  { active = true, loop = false, loopDelay = 3500, reducedMotion = false, initial }: UseScriptPlayerOptions = {},
) {
  const initialRef = useRef(initial);
  const [state, setState] = useState(() => initialScriptState(initial));
  const [index, setIndex] = useState(0);
  const done = index >= events.length;

  useEffect(() => {
    if (!reducedMotion) return;
    setState(finalScriptState(events, initialRef.current));
    setIndex(events.length);
  }, [reducedMotion, events]);

  useEffect(() => {
    if (reducedMotion || !active) return;
    let timer: number;

    if (index >= events.length) {
      if (!loop) return;
      timer = window.setTimeout(() => {
        setState(initialScriptState(initialRef.current));
        setIndex(0);
      }, loopDelay);
      return () => clearTimeout(timer);
    }

    const event = events[index];
    if (event.type === "typing") {
      // Typing shows immediately and holds for its duration.
      timer = window.setTimeout(
        () => {
          setState((s) => ({ ...apply(s, event), typing: event.sender ?? "bot" }));
          timer = window.setTimeout(() => {
            setState((s) => ({ ...s, typing: null }));
            setIndex((i) => i + 1);
          }, event.duration);
        },
        event.delay ?? 0,
      );
    } else if (event.type === "pause") {
      timer = window.setTimeout(() => setIndex((i) => i + 1), event.duration);
    } else {
      timer = window.setTimeout(() => {
        setState((s) => apply(s, event));
        setIndex((i) => i + 1);
      }, event.delay ?? DEFAULT_DELAY);
    }
    return () => clearTimeout(timer);
  }, [index, active, loop, loopDelay, reducedMotion, events]);

  const replay = useCallback(() => {
    setState(initialScriptState(initialRef.current));
    setIndex(0);
  }, []);

  return { state, done, replay, progress: events.length ? index / events.length : 1 };
}

/* ------------------------------------------------------------------ */
/* One-at-a-time playback                                              */
/* ------------------------------------------------------------------ */

const MIN_VISIBLE = 0.4;
const ratios = new Map<string, number>();
const listeners = new Set<() => void>();
let activeId: string | null = null;

function electActive() {
  let best: string | null = null;
  let bestRatio = 0;
  for (const [id, r] of ratios) {
    if (r >= MIN_VISIBLE && r > bestRatio) {
      best = id;
      bestRatio = r;
    }
  }
  if (best !== activeId) {
    activeId = best;
    listeners.forEach((l) => l());
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/**
 * Registers a scripted phone's visibility. Returns true for exactly one
 * phone on the page: the most visible (≥40%) one that still wants to play.
 */
export function usePlaybackSlot(id: string, ratio: number, wantsToPlay: boolean) {
  useEffect(() => {
    if (wantsToPlay) ratios.set(id, ratio);
    else ratios.delete(id);
    electActive();
  }, [id, ratio, wantsToPlay]);

  useEffect(
    () => () => {
      ratios.delete(id);
      electActive();
    },
    [id],
  );

  return useSyncExternalStore(
    subscribe,
    () => activeId === id,
    () => false,
  );
}

const THRESHOLDS = [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1];

/** Visibility ratio of an element, updated at a few thresholds. */
export function useVisibleRatio(ref: RefObject<Element | null>) {
  const [ratio, setRatio] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setRatio(entry.intersectionRatio), { threshold: THRESHOLDS });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return ratio;
}

/** True once the element comes within `margin` of the viewport (lazy rendering). */
export function useNearViewport(ref: RefObject<Element | null>, margin = "400px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}
