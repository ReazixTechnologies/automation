/**
 * Demo data for the dashboard preview. Every person, lead, campaign and number
 * here is fictional and illustrative.
 */
import type { ChatVariant } from "@/types/chat";

export type DemoChannel = ChatVariant;

export interface Agent {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Tailwind background class for the avatar. */
  color: string;
}

export interface DemoMessage {
  id: string;
  from: "lead" | "ai" | "agent" | "note";
  text: string;
  time: string;
  agentId?: string;
  attachment?: { name: string; meta: string };
}

export interface TimelineEvent {
  label: string;
  time: string;
  kind: "ad" | "chat" | "brochure" | "visit" | "score" | "call" | "payment";
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  channel: DemoChannel;
  handle: string;
  lastMessage: string;
  time: string;
  unread: number;
  score: number;
  tags: string[];
  agentId: string;
  configuration: string;
  budget: string;
  source: string;
  timeline: TimelineEvent[];
  messages: DemoMessage[];
  /** The visitor's own conversation from the live demo. */
  live?: boolean;
}

export const agents: Agent[] = [
  { id: "rahul", name: "Rahul M.", initials: "RM", role: "Senior Sales", color: "bg-copper-700" },
  { id: "meera", name: "Meera J.", initials: "MJ", role: "Sales", color: "bg-ig-purple" },
  { id: "dev", name: "Dev P.", initials: "DP", role: "Sales", color: "bg-copper-700" },
  { id: "sana", name: "Sana K.", initials: "SK", role: "CRM", color: "bg-ig-blue" },
];

/** The signed-in agent in the preview. */
export const currentAgentId = "rahul";

export const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Priya S.",
    initials: "PS",
    channel: "instagram",
    handle: "@priya.homes",
    lastMessage: "Can I see the 3 BHK this Saturday?",
    time: "2m",
    unread: 2,
    score: 86,
    tags: ["Hot", "Site Visit"],
    agentId: "rahul",
    configuration: "3 BHK",
    budget: "₹1.8–2.2 Cr",
    source: "IG Ad · villa_launch",
    timeline: [
      { label: "Clicked IG ad 'villa_launch'", time: "Today, 9:12 AM", kind: "ad" },
      { label: "AI shared 3 BHK prices & brochure", time: "Today, 9:13 AM", kind: "brochure" },
      { label: "Lead score 52 → 86", time: "Today, 9:20 AM", kind: "score" },
      { label: "Asked for a Saturday visit", time: "2 min ago", kind: "visit" },
    ],
    messages: [
      { id: "m1", from: "lead", text: "Price for 3BHK?", time: "9:12 AM" },
      { id: "m2", from: "ai", text: "Hi Priya! 3 BHKs at Skyline Heights start at ₹1.85 Cr* with 1,820 sq.ft carpet. Here's the brochure 👇", time: "9:12 AM" },
      { id: "m3", from: "ai", text: "", time: "9:13 AM", attachment: { name: "Skyline_Heights_Brochure.pdf", meta: "14 pages • PDF" } },
      { id: "m4", from: "lead", text: "Is the lake view on higher floors only?", time: "9:18 AM" },
      { id: "m5", from: "ai", text: "Lake views start from the 9th floor in Tower B. 11 of those 3 BHKs are still available.", time: "9:18 AM" },
      { id: "m6", from: "note", text: "Budget confirmed ~₹2 Cr on IG profile. Offer Tower B, 14th floor+.", time: "9:21 AM", agentId: "rahul" },
      { id: "m7", from: "lead", text: "Can I see the 3 BHK this Saturday?", time: "9:26 AM" },
    ],
  },
  {
    id: "c2",
    name: "Vikram M.",
    initials: "VM",
    channel: "whatsapp",
    handle: "WhatsApp",
    lastMessage: "Sending the token amount today.",
    time: "14m",
    unread: 0,
    score: 92,
    tags: ["Hot", "HNI"],
    agentId: "rahul",
    configuration: "4 BHK Penthouse",
    budget: "₹4.5–5 Cr",
    source: "Referral · existing buyer",
    timeline: [
      { label: "Referred by an existing buyer", time: "Mon, 11:00 AM", kind: "chat" },
      { label: "Site visit completed", time: "Sat, 12:30 PM", kind: "visit" },
      { label: "Call with Rahul (14 min)", time: "Yesterday", kind: "call" },
      { label: "Payment link shared", time: "Today, 10:05 AM", kind: "payment" },
    ],
    messages: [
      { id: "m1", from: "lead", text: "Loved the penthouse terrace on Saturday.", time: "10:01 AM" },
      { id: "m2", from: "agent", agentId: "rahul", text: "Glad you liked it, Vikram! I've held P-2801 for you until Friday.", time: "10:03 AM" },
      { id: "m3", from: "note", agentId: "rahul", text: "Wants a 20:80 plan. Check with finance before confirming.", time: "10:04 AM" },
      { id: "m4", from: "agent", agentId: "rahul", text: "Here's the secure token payment link and the cost sheet.", time: "10:05 AM" },
      { id: "m5", from: "lead", text: "Sending the token amount today.", time: "10:22 AM" },
    ],
  },
  {
    id: "c3",
    name: "Fatima A.",
    initials: "FA",
    channel: "whatsapp",
    handle: "WhatsApp",
    lastMessage: "What is the maintenance per month?",
    time: "38m",
    unread: 1,
    score: 64,
    tags: ["Investor"],
    agentId: "meera",
    configuration: "2 BHK",
    budget: "₹1–1.2 Cr",
    source: "Website Widget",
    timeline: [
      { label: "Started chat from website widget", time: "Today, 8:40 AM", kind: "chat" },
      { label: "AI sent rental yield sheet", time: "Today, 8:42 AM", kind: "brochure" },
    ],
    messages: [
      { id: "m1", from: "lead", text: "Looking at 2 BHK as an investment. Rental demand?", time: "8:40 AM" },
      { id: "m2", from: "ai", text: "Great question! Here's our rental demand sheet for the area (illustrative data).", time: "8:41 AM" },
      { id: "m3", from: "ai", text: "", time: "8:42 AM", attachment: { name: "Rental_Demand_Sheet.pdf", meta: "2 pages • PDF" } },
      { id: "m4", from: "lead", text: "What is the maintenance per month?", time: "8:58 AM" },
    ],
  },
  {
    id: "c4",
    name: "Neha & Arjun",
    initials: "NA",
    channel: "instagram",
    handle: "@neha.arjun",
    lastMessage: "We'd like the evening slot please",
    time: "1h",
    unread: 0,
    score: 78,
    tags: ["Site Visit"],
    agentId: "dev",
    configuration: "3 BHK",
    budget: "₹1.9 Cr",
    source: "IG Comments · lake_view_reel",
    timeline: [
      { label: "Commented 'Price?' on a reel", time: "Today, 7:55 AM", kind: "ad" },
      { label: "Auto-DM with prices", time: "Today, 7:55 AM", kind: "chat" },
      { label: "Visit booked: Sat 4:00 PM", time: "1 hour ago", kind: "visit" },
    ],
    messages: [
      { id: "m1", from: "ai", text: "Hi Neha! Thanks for your comment on our lake-view reel 👋 Want to see it in person?", time: "7:55 AM" },
      { id: "m2", from: "lead", text: "Yes! Weekend works for us.", time: "8:10 AM" },
      { id: "m3", from: "ai", text: "Saturday has 11:00 AM or 4:00 PM. Which suits you?", time: "8:10 AM" },
      { id: "m4", from: "lead", text: "We'd like the evening slot please", time: "8:31 AM" },
    ],
  },
  {
    id: "c5",
    name: "Sameer D.",
    initials: "SD",
    channel: "whatsapp",
    handle: "WhatsApp",
    lastMessage: "Thanks, will discuss with family.",
    time: "3h",
    unread: 0,
    score: 41,
    tags: [],
    agentId: "meera",
    configuration: "2 BHK",
    budget: "Not shared",
    source: "QR at Site",
    timeline: [{ label: "Scanned QR at the site hoarding", time: "Today, 6:30 AM", kind: "ad" }],
    messages: [
      { id: "m1", from: "lead", text: "Hi, saw the hoarding. Is possession soon?", time: "6:30 AM" },
      { id: "m2", from: "ai", text: "Hi Sameer! Towers A & B are planned for December 2027. Want the floor plans?", time: "6:30 AM" },
      { id: "m3", from: "lead", text: "Thanks, will discuss with family.", time: "6:45 AM" },
    ],
  },
  {
    id: "c6",
    name: "Kavya R.",
    initials: "KR",
    channel: "instagram",
    handle: "@kavya.designs",
    lastMessage: "Do you allow interior changes?",
    time: "5h",
    unread: 0,
    score: 58,
    tags: ["Investor"],
    agentId: "dev",
    configuration: "3 BHK",
    budget: "₹2 Cr",
    source: "IG Ads · interiors_carousel",
    timeline: [{ label: "Clicked carousel ad", time: "Today, 4:10 AM", kind: "ad" }],
    messages: [
      { id: "m1", from: "lead", text: "Do you allow interior changes?", time: "4:12 AM" },
      { id: "m2", from: "ai", text: "Layout changes aren't something I can confirm, so I've asked an advisor to help. They'll reply shortly!", time: "4:12 AM" },
      { id: "m3", from: "note", agentId: "dev", text: "Follow up after 10 AM, architect query.", time: "4:15 AM" },
    ],
  },
  {
    id: "c7",
    name: "Imran H.",
    initials: "IH",
    channel: "whatsapp",
    handle: "WhatsApp",
    lastMessage: "Payment done for slab milestone ✅",
    time: "Yesterday",
    unread: 0,
    score: 95,
    tags: ["HNI"],
    agentId: "sana",
    configuration: "4 BHK Penthouse",
    budget: "Booked",
    source: "Referral",
    timeline: [
      { label: "Booked P-3001", time: "Aug 12", kind: "payment" },
      { label: "Milestone reminder sent", time: "Yesterday", kind: "chat" },
      { label: "Payment received", time: "Yesterday", kind: "payment" },
    ],
    messages: [
      { id: "m1", from: "ai", text: "Hi Imran, the 20th floor slab is cast 🏗️ Your milestone payment is due in 5 days.", time: "9:00 AM" },
      { id: "m2", from: "lead", text: "Payment done for slab milestone ✅", time: "11:40 AM" },
      { id: "m3", from: "ai", text: "Received, thank you! Your tax invoice is on its way.", time: "11:41 AM" },
    ],
  },
  {
    id: "c8",
    name: "Ritu G.",
    initials: "RG",
    channel: "instagram",
    handle: "@ritu.g",
    lastMessage: "Just browsing for now 🙂",
    time: "Yesterday",
    unread: 0,
    score: 22,
    tags: [],
    agentId: "meera",
    configuration: "Not sure",
    budget: "Not shared",
    source: "IG Comments · tower_c_teaser",
    timeline: [{ label: "Commented on Tower C teaser", time: "Yesterday", kind: "ad" }],
    messages: [
      { id: "m1", from: "ai", text: "Hi Ritu! Tower C launches soon. Shall I add you to early access?", time: "6:02 PM" },
      { id: "m2", from: "lead", text: "Just browsing for now 🙂", time: "6:20 PM" },
    ],
  },
];

/** Messages the simulated live activity drops into random conversations. */
export const incomingPool = [
  "Is the price negotiable?",
  "Can you share the floor plan again?",
  "What time is the site office open?",
  "Do you have a 4 BHK with a terrace?",
  "Is there a club membership fee?",
  "My father would like to visit too 🙂",
  "Can we pay the token by UPI?",
  "Any update on my visit slot?",
];

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* ------------------------------------------------------------------ */

export type CampaignStatus = "Completed" | "Running" | "Scheduled" | "Draft";

export interface Campaign {
  id: string;
  name: string;
  audience: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  visits: number;
  status: CampaignStatus;
  segment: string;
  template: { header: string; body: string; buttons: string[] };
}

export const campaigns: Campaign[] = [
  {
    id: "k1",
    name: "Diwali Token Offer",
    audience: 3120,
    sent: 3120,
    delivered: 3046,
    read: 2611,
    replied: 498,
    visits: 74,
    status: "Completed",
    segment: "Warm leads, last 90 days",
    template: {
      header: "🪔 Diwali at Skyline Heights",
      body: "Book your home this festive season with a reduced token amount (demo offer). Valid till Sunday.",
      buttons: ["See available units", "Book a site visit"],
    },
  },
  {
    id: "k2",
    name: "Tower C Launch",
    audience: 2340,
    sent: 2340,
    delivered: 2298,
    read: 1874,
    replied: 412,
    visits: 58,
    status: "Running",
    segment: "Opted-in, all sources",
    template: {
      header: "🚀 Tower C pre-launch is live",
      body: "Early-bird prices for the first 50 homes in Tower C. Reply YES for the price sheet.",
      buttons: ["Send price sheet", "Talk to an advisor"],
    },
  },
  {
    id: "k3",
    name: "Price Revision Alert",
    audience: 1860,
    sent: 1860,
    delivered: 1822,
    read: 1497,
    replied: 233,
    visits: 31,
    status: "Completed",
    segment: "Visited, not booked",
    template: {
      header: "Prices revise on the 1st",
      body: "Current prices are held until the end of the month. Lock yours with a token before the revision.",
      buttons: ["Hold my price", "Remind me later"],
    },
  },
  {
    id: "k4",
    name: "Site Visit Weekend",
    audience: 980,
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    visits: 0,
    status: "Scheduled",
    segment: "Hot & warm, no visit yet",
    template: {
      header: "🏡 Open house this weekend",
      body: "Tour the sample flat with free pickup from the metro station. Pick a slot below.",
      buttons: ["Sat slots", "Sun slots"],
    },
  },
];

export const campaignSegments = [
  { id: "hot", label: "Hot & warm leads", count: 1240 },
  { id: "visited", label: "Visited, not booked", count: 1860 },
  { id: "all", label: "All opted-in contacts", count: 6480 },
];

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export const kpis = [
  { label: "Leads this month", value: 1284, decimals: 0, prefix: "", suffix: "", delta: "+18% vs last month" },
  { label: "Avg first response", value: 0.8, decimals: 1, prefix: "", suffix: "s", delta: "was 4h 12m before AI" },
  { label: "Site visits booked", value: 163, decimals: 0, prefix: "", suffix: "", delta: "+31% vs last month" },
  { label: "Conversion to booking", value: 4.2, decimals: 1, prefix: "", suffix: "%", delta: "+0.9 pts" },
];

/** Deterministic, wavy leads/day for the last 30 days (no randomness: stable renders). */
export function leadsPerDay(today = new Date()) {
  const rows: { date: string; whatsapp: number; instagram: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const t = 29 - i;
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 1.25 : 1;
    rows.push({
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      whatsapp: Math.round((24 + t * 0.35 + 5 * Math.sin(t / 2.3)) * weekend),
      instagram: Math.round((14 + t * 0.45 + 4 * Math.cos(t / 1.9)) * weekend),
    });
  }
  return rows;
}

export const leadSources = [
  { source: "IG Ads", leads: 486 },
  { source: "IG Comments", leads: 302 },
  { source: "Website Widget", leads: 214 },
  { source: "QR at Site", leads: 158 },
  { source: "Referrals", leads: 124 },
];

export const scoreDistribution = [
  { name: "Hot", value: 22, range: "70–100" },
  { name: "Warm", value: 46, range: "40–69" },
  { name: "Cold", value: 32, range: "0–39" },
] as const;

/* ------------------------------------------------------------------ */
/* Automations                                                         */
/* ------------------------------------------------------------------ */

export const automationToggles = [
  { id: "welcome", label: "Welcome message", description: "Greets every new chat with the project intro and quick replies.", enabled: true },
  { id: "away", label: "Away hours AI", description: "AI concierge answers between 8 PM and 9 AM and books callbacks.", enabled: true },
  { id: "comment", label: "Comment-to-DM", description: "Replies to 'Price?' comments on posts and reels with a DM.", enabled: true },
  { id: "reminders", label: "Visit reminders", description: "Sends a reminder 2 hours before each site visit.", enabled: true },
  { id: "payments", label: "Payment milestone alerts", description: "Notifies buyers when a construction milestone is reached.", enabled: false },
];

export const flowNodes = [
  { id: "ad", label: "IG Ad Click", detail: "A buyer taps your click-to-message ad. The chat opens with UTM tags attached.", x: 90, y: 200 },
  { id: "qualify", label: "AI Qualify", detail: "The AI concierge asks budget, configuration and timeline, one question at a time.", x: 290, y: 200 },
  { id: "senior", label: "Budget ₹2 Cr+ → Senior Agent", detail: "High-budget leads are assigned to a senior agent with a WhatsApp alert.", x: 530, y: 90 },
  { id: "nurture", label: "Below → Brochure + Nurture", detail: "Others get the brochure instantly and a 3-message nurture drip over 10 days.", x: 530, y: 310 },
  { id: "visit", label: "Book Site Visit", detail: "Both paths offer live calendar slots and a map pin to the Experience Centre.", x: 780, y: 200 },
  { id: "remind", label: "Reminder 2h before", detail: "An automatic reminder with confirm / reschedule buttons cuts no-shows.", x: 1000, y: 200 },
] as const;

export const flowEdges: [string, string][] = [
  ["ad", "qualify"],
  ["qualify", "senior"],
  ["qualify", "nurture"],
  ["senior", "visit"],
  ["nurture", "visit"],
  ["visit", "remind"],
];
