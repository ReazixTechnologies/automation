/** Single place to tune the live AI demo. */
export const AI_CONFIG = {
  model: "claude-haiku-5-5",
  maxTokens: 400,
  /**
   * Haiku 5.5 rejects non-default sampling parameters, so temperature is not
   * sent. Reply length and tone are steered by the system prompt; thinking
   * depth (and latency) by effort.
   */
  effort: "low",
  /** Model ↔ tool round-trips per visitor message. */
  maxToolIterations: 4,
} as const;

export const CHAT_LIMITS = {
  maxMessageChars: 500,
  /** Visitor messages per conversation before the demo asks for a restart. */
  maxUserMessages: 20,
  /** History sent to the model: the most recent N messages (user + assistant). */
  historyMessages: 12,
  /** Assistant history entries are client-supplied; cap their size too. */
  maxAssistantChars: 1500,
} as const;

export const RATE_LIMITS = {
  perMinute: 15,
  perDay: 60,
} as const;
