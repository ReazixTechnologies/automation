import { z } from "zod";

/** Shared by the lead form (client) and /api/lead (server). */
export const leadVolumes = ["Under 100", "100–500", "500–2,000", "2,000+"] as const;

export const countryCodes = ["+91", "+971", "+1", "+44", "+65"] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "That name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(120)
    .refine((e) => !/@(gmail|yahoo|hotmail|outlook)\./i.test(e), "Please use your work email"),
  countryCode: z.enum(countryCodes),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9 ]{6,14}$/, "Enter a valid phone number (digits only)"),
  company: z.string().trim().min(2, "Please enter your company").max(100),
  monthlyLeads: z.enum(leadVolumes, { message: "Choose your monthly lead volume" }),
  /** Honeypot: hidden from real visitors; the server silently drops submissions that fill it. */
  website: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Short lead captured inside the /demo chat (name, business, phone). */
export const demoLeadSchema = z.object({
  source: z.literal("demo-chat"),
  /** "concierge" = wants an AI concierge for their business; "callback" = asked for a specialist call. */
  intent: z.enum(["concierge", "callback"]),
  name: z.string().trim().min(2, "Please share your name").max(80),
  business: z.string().trim().min(2, "Please share your business name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,18}$/, "That doesn't look like a phone number"),
  channel: z.enum(["whatsapp", "instagram"]),
  project: z.string().max(60).optional(),
  website: z.string().max(200).optional(),
});

export type DemoLeadInput = z.infer<typeof demoLeadSchema>;
