/**
 * Skyline Heights: a FICTIONAL project. Single source of truth for the AI
 * concierge (system prompt), the rich message cards and offline mode.
 * Every name, number, price and address here is invented for the demo.
 */

export type ConfigurationId = "2bhk" | "3bhk" | "4bhk";

export interface Configuration {
  id: ConfigurationId;
  label: string;
  carpetSqft: number;
  superBuiltUpSqft: number;
  startingPrice: string;
  unitsLeft: number;
  highlights: string;
  floorPlan: { file: string; pages: number; size: string };
  /** CSS gradient used as the render placeholder (no stock images). */
  gradient: string;
}

export const project = {
  name: "Skyline Heights",
  tagline: "Lake-facing residences in three towers",
  developer:
    "Skyline Heights is developed by Northlight Habitat (fictional), a mid-sized developer known in this demo for on-time delivery and green-certified towers.",
  location: "Lakeside Avenue, Sector 21, Riverbend City (fictional)",
  reraNumber: "DEMO-RERA-0000-SH-21 (fictional, for demo only)",
  possession: "December 2027 (Towers A & B), June 2028 (Tower C)",
  towers: "3 towers, G+32 floors, 412 homes on 6.5 acres",
} as const;

export const configurations: Configuration[] = [
  {
    id: "2bhk",
    label: "2 BHK",
    carpetSqft: 1120,
    superBuiltUpSqft: 1540,
    startingPrice: "₹1.12 Cr",
    unitsLeft: 18,
    highlights: "Corner layouts, 1 covered parking",
    floorPlan: { file: "Skyline_Heights_2BHK_Floor_Plan.pdf", pages: 2, size: "1.1 MB" },
    gradient: "linear-gradient(135deg, #A7F3D0 0%, #128C7E 60%, #075E54 100%)",
  },
  {
    id: "3bhk",
    label: "3 BHK",
    carpetSqft: 1820,
    superBuiltUpSqft: 2480,
    startingPrice: "₹1.85 Cr",
    unitsLeft: 11,
    highlights: "Lake-view deck, 2 covered parkings",
    floorPlan: { file: "Skyline_Heights_3BHK_Floor_Plan.pdf", pages: 2, size: "1.4 MB" },
    gradient: "linear-gradient(135deg, #E6D3A8 0%, #C8A96A 45%, #8A6D34 100%)",
  },
  {
    id: "4bhk",
    label: "4 BHK Penthouse",
    carpetSqft: 2950,
    superBuiltUpSqft: 3900,
    startingPrice: "₹4.60 Cr",
    unitsLeft: 4,
    highlights: "Double-height lounge, private terrace, 3 parkings",
    floorPlan: { file: "Skyline_Heights_4BHK_Penthouse_Floor_Plan.pdf", pages: 3, size: "2.3 MB" },
    gradient: "linear-gradient(135deg, #BFDBFE 0%, #515BD4 55%, #1E1B4B 100%)",
  },
];

export const amenities = [
  "Infinity pool facing the lake",
  "50,000 sq.ft clubhouse",
  "Gym and yoga deck",
  "Co-working lounge",
  "Kids' play zone and creche",
  "Jogging track around a 2-acre central park",
  "Indoor badminton and squash courts",
  "EV charging in every basement",
];

export const pricingDetails = {
  parking: "Covered parking included: 1 for 2 BHK, 2 for 3 BHK, 3 for the 4 BHK Penthouse.",
  maintenance: "₹4.5 per sq.ft of super built-up area per month; the first 2 years are prepaid at possession.",
  paymentPlan: [
    "10% on booking",
    "10% within 30 days of agreement",
    "60% linked to construction milestones",
    "20% on possession",
  ],
  loans: "Pre-approved home loans are available from leading banks. Our advisor helps with paperwork.",
  priceNote: "Prices are starting prices, exclusive of registration and stamp duty. Final price depends on floor and view.",
} as const;

export const experienceCentre = {
  name: "Skyline Heights Experience Centre",
  address: "Plot 7, Lakeside Avenue, Sector 21, Riverbend City (fictional)",
  /** Fictional coordinates (open ocean), never a real place. */
  coordinates: { lat: 0.0021, lng: -0.0019 },
  hours: "10:00 AM to 7:00 PM, all days",
} as const;

export const faqs: { id: string; keywords: string[]; question: string; answer: string }[] = [
  {
    id: "price",
    keywords: ["price", "cost", "rate", "kitna", "budget", "starting", "कीमत", "किंमत", "سعر"],
    question: "What are the prices?",
    answer: "2 BHK starts at ₹1.12 Cr, 3 BHK at ₹1.85 Cr and the 4 BHK Penthouse at ₹4.60 Cr (plus registration).",
  },
  {
    id: "carpet",
    keywords: ["carpet", "area", "sq", "size", "sqft"],
    question: "What are the carpet areas?",
    answer: "Carpet areas: 2 BHK 1,120 sq.ft, 3 BHK 1,820 sq.ft, 4 BHK Penthouse 2,950 sq.ft.",
  },
  {
    id: "rera",
    keywords: ["rera", "registration", "registered", "approved", "approval", "legal"],
    question: "Is it RERA registered?",
    answer: `Yes. The registration number shown in this demo is ${project.reraNumber}. Our advisor can share the documents.`,
  },
  {
    id: "possession",
    keywords: ["possession", "handover", "ready", "completion", "when"],
    question: "When is possession?",
    answer: `Possession is planned for ${project.possession}.`,
  },
  {
    id: "amenities",
    keywords: ["amenit", "pool", "gym", "club", "facilit", "kids", "park"],
    question: "What amenities are there?",
    answer: "Highlights: lake-facing infinity pool, 50,000 sq.ft clubhouse, gym, co-working lounge, kids' zone and a 2-acre central park. 🌳",
  },
  {
    id: "parking",
    keywords: ["parking", "car park", "garage", "ev charg"],
    question: "Is parking included?",
    answer: pricingDetails.parking,
  },
  {
    id: "maintenance",
    keywords: ["maintenance", "maintainance", "society", "monthly"],
    question: "What is the maintenance?",
    answer: `Maintenance is ${pricingDetails.maintenance}`,
  },
  {
    id: "payment",
    keywords: ["payment", "installment", "instalment", "plan", "milestone", "down payment"],
    question: "What is the payment plan?",
    answer: `Payment plan: ${pricingDetails.paymentPlan.join(", ")}.`,
  },
  {
    id: "loan",
    keywords: ["loan", "bank", "emi", "finance", "mortgage"],
    question: "Do you help with home loans?",
    answer: pricingDetails.loans,
  },
  {
    id: "location",
    keywords: ["location", "where", "address", "located", "map", "kahan", "direction"],
    question: "Where is it located?",
    answer: `Skyline Heights is on ${project.location}. The Experience Centre is open ${experienceCentre.hours}.`,
  },
  {
    id: "developer",
    keywords: ["developer", "builder", "who is building", "company"],
    question: "Who is the developer?",
    answer: project.developer,
  },
  {
    id: "units",
    keywords: ["available", "units left", "inventory", "sold"],
    question: "How many units are left?",
    answer: "Units left: 2 BHK 18, 3 BHK 11, 4 BHK Penthouse only 4.",
  },
  {
    id: "visit",
    keywords: ["visit", "site", "tour", "see the", "book", "appointment"],
    question: "Can I visit the site?",
    answer: `Of course! The Experience Centre is open ${experienceCentre.hours}. Pick a slot below. 🗓️`,
  },
];

export interface VisitSlot {
  id: string;
  label: string;
  day: string;
  date: string;
  time: string;
}

const SLOT_TIMES = ["11:00 AM", "4:00 PM"];

/** Site visit slots for the next 7 days, generated from `now` (Asia/Kolkata). */
export function getVisitSlots(now = new Date()): VisitSlot[] {
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(d);

  const slots: VisitSlot[] = [];
  for (let offset = 1; offset <= 7; offset++) {
    const d = new Date(now.getTime() + offset * 86_400_000);
    const day = fmt(d, { weekday: "short" });
    const date = fmt(d, { day: "numeric", month: "short" });
    for (const time of SLOT_TIMES) {
      slots.push({ id: `${fmt(d, { year: "numeric", month: "2-digit", day: "2-digit" })}-${time}`, label: `${day}, ${date} · ${time}`, day, date, time });
    }
  }
  return slots;
}

/** Three upcoming slots spread across different days. */
export function getOfferedSlots(now = new Date()): VisitSlot[] {
  const all = getVisitSlots(now);
  return [all[0], all[3], all[4]];
}

export const welcomeMessage =
  "👋 Welcome to Skyline Heights! I'm your AI Property Concierge. Ask me anything — prices, floor plans, amenities, or book a site visit.";

export const starterSuggestions = ["3 BHK price?", "Show me amenities", "Book a site visit", "Is it RERA approved?"];

/** Shown when a visitor asks who built the demo or how to get one for their own project. */
export const studioHandoff = {
  name: "Reazix",
  team: "Studio",
  reply:
    "This concierge is a demo built by Reazix, a digital product studio. A Reazix specialist will reach out to plan one for your project, or you can book a free strategy call on this page.",
} as const;

export const handoffAgent = {
  name: "Rahul",
  team: "Sales",
  reply: "Hi! I'm Rahul from the Skyline Heights sales team 👋 I've read your chat. I'll call you shortly, or reply here with a good time.",
} as const;
