import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  configurations,
  experienceCentre,
  getOfferedSlots,
  handoffAgent,
  studioHandoff,
  type ConfigurationId,
} from "@/data/projectKnowledge";
import type { ChatStreamEvent, UnitCardData } from "@/types/simulator";

const configIds = configurations.map((c) => c.id) as [ConfigurationId, ...ConfigurationId[]];

/**
 * Tool definitions. Inputs stream eagerly, so the API doesn't validate them;
 * every input is checked against the matching Zod schema before it runs.
 */
export const TOOLS: Anthropic.Tool[] = [
  {
    name: "show_units",
    description:
      "Show unit cards (price, carpet area, units left) for one or more configurations. Use when the visitor asks about configurations, prices or sizes.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        configurations: {
          type: "array",
          items: { type: "string", enum: configIds },
          description: "Configurations to show; all three if the visitor hasn't narrowed down.",
        },
      },
      required: ["configurations"],
    },
  },
  {
    name: "send_floor_plan",
    description: "Send the floor plan PDF for one configuration.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { configuration: { type: "string", enum: configIds } },
      required: ["configuration"],
    },
  },
  {
    name: "offer_site_visit_slots",
    description: "Show 3 upcoming site visit slots the visitor can tap. Their choice arrives as their next message.",
    eager_input_streaming: true,
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "share_location",
    description: "Share the Experience Centre location card with an Open in Maps button.",
    eager_input_streaming: true,
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "capture_lead",
    description:
      "Silently record details the visitor revealed, plus your intent score. Not shown to the visitor. Only include fields the visitor actually stated.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        configuration: { type: "string", description: "e.g. 3 BHK" },
        budget: { type: "string", description: "As stated, e.g. ₹2–3 Cr" },
        timeline: { type: "string", description: "e.g. within 6 months" },
        purpose: { type: "string", enum: ["Self-use", "Investment"] },
        visit_slot: { type: "string", description: "The slot label the visitor picked" },
        intent_score: { type: "integer", minimum: 0, maximum: 100 },
      },
      required: ["intent_score"],
    },
  },
  {
    name: "handoff_to_human",
    description: "Bring a human sales advisor into the chat.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Short reason, e.g. 'asked about discounts'" },
        team: {
          type: "string",
          enum: ["sales", "reazix"],
          description: "sales = the project's sales team (default); reazix = the visitor wants an AI concierge like this for their own business",
        },
      },
      required: ["reason"],
    },
  },
  {
    name: "suggest_replies",
    description: "Show 2–3 tap-able quick replies under your message, each under 25 characters.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        options: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
      },
      required: ["options"],
    },
  },
];

const short = (max: number) => z.string().trim().min(1).max(max);

const schemas = {
  show_units: z.object({ configurations: z.array(z.enum(configIds)).min(1).max(3) }),
  send_floor_plan: z.object({ configuration: z.enum(configIds) }),
  offer_site_visit_slots: z.object({}).passthrough(),
  share_location: z.object({}).passthrough(),
  capture_lead: z.object({
    name: short(60).optional(),
    configuration: short(40).optional(),
    budget: short(40).optional(),
    timeline: short(40).optional(),
    purpose: z.enum(["Self-use", "Investment"]).optional(),
    visit_slot: short(60).optional(),
    intent_score: z.number().int().min(0).max(100),
  }),
  handoff_to_human: z.object({ reason: short(120), team: z.enum(["sales", "reazix"]).optional() }),
  suggest_replies: z.object({ options: z.array(short(40)).min(1).max(3) }),
} as const;

export type ToolName = keyof typeof schemas;

export interface ToolOutcome {
  /** Event for the browser (rich card / lead update), if any. */
  event?: ChatStreamEvent;
  /** What the model is told happened. */
  result: string;
  isError?: boolean;
}

export function toUnitCard(id: ConfigurationId): UnitCardData {
  const c = configurations.find((x) => x.id === id)!;
  return {
    id: c.id,
    label: c.label,
    startingPrice: c.startingPrice,
    carpetSqft: c.carpetSqft,
    superBuiltUpSqft: c.superBuiltUpSqft,
    unitsLeft: c.unitsLeft,
    highlights: c.highlights,
    gradient: c.gradient,
  };
}

export function floorPlanEvent(id: ConfigurationId): Extract<ChatStreamEvent, { type: "pdf" }> {
  const c = configurations.find((x) => x.id === id)!;
  return { type: "pdf", configuration: c.label, name: c.floorPlan.file, pages: c.floorPlan.pages, size: c.floorPlan.size };
}

export function locationEvent(): Extract<ChatStreamEvent, { type: "location" }> {
  return { type: "location", name: experienceCentre.name, address: experienceCentre.address, hours: experienceCentre.hours };
}

export function handoffEvent(reason: string, team: "sales" | "reazix" = "sales"): Extract<ChatStreamEvent, { type: "handoff" }> {
  const who = team === "reazix" ? studioHandoff : handoffAgent;
  return { type: "handoff", reason, agent: who.name, team: who.team, reply: who.reply };
}

/** Validate and run one tool call. Never throws. */
export function runTool(name: string, input: unknown): ToolOutcome {
  if (!(name in schemas)) return { result: `Unknown tool: ${name}`, isError: true };
  const parsed = schemas[name as ToolName].safeParse(input);
  if (!parsed.success) {
    return { result: `INVALID_INPUT: ${parsed.error.issues.map((i) => i.message).join("; ")}`, isError: true };
  }

  switch (name as ToolName) {
    case "show_units": {
      const { configurations: ids } = parsed.data as z.infer<typeof schemas.show_units>;
      const units = [...new Set(ids)].map(toUnitCard);
      return {
        event: { type: "units", units },
        result: `Shown to visitor: unit cards for ${units.map((u) => `${u.label} (from ${u.startingPrice})`).join(", ")}.`,
      };
    }
    case "send_floor_plan": {
      const { configuration } = parsed.data as z.infer<typeof schemas.send_floor_plan>;
      const event = floorPlanEvent(configuration);
      return { event, result: `Sent ${event.name} (${event.pages} pages).` };
    }
    case "offer_site_visit_slots": {
      const slots = getOfferedSlots();
      return { event: { type: "slots", slots }, result: `Shown slots: ${slots.map((s) => s.label).join(" | ")}. Ask the visitor to tap one.` };
    }
    case "share_location":
      return { event: locationEvent(), result: "Location card shared." };
    case "capture_lead": {
      const { intent_score, visit_slot, ...rest } = parsed.data as z.infer<typeof schemas.capture_lead>;
      return {
        event: { type: "lead", fields: { ...rest, visitSlot: visit_slot }, score: intent_score },
        result: "Saved to CRM. Do not mention this to the visitor.",
      };
    }
    case "handoff_to_human": {
      const { reason, team = "sales" } = parsed.data as z.infer<typeof schemas.handoff_to_human>;
      const who = team === "reazix" ? studioHandoff : handoffAgent;
      return {
        event: handoffEvent(reason, team),
        result: `${who.name} (${who.team}) has joined and greeted the visitor. Do not write anything further this turn.`,
      };
    }
    case "suggest_replies": {
      const { options } = parsed.data as z.infer<typeof schemas.suggest_replies>;
      return { event: { type: "suggestions", options }, result: "Quick replies shown." };
    }
  }
}
