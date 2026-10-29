/**
 * Social proof for the Trust section.
 *
 * TODO(launch): replace every placeholder below with real, permissioned client
 * testimonials (written consent for name, role, company and metric) before
 * launch. All names, companies and numbers here are fictional.
 */

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  metric: string;
}

export const wordmarks = [
  "Northlight Habitat",
  "Azure Bay Realty",
  "Crestline Homes",
  "Verdant Estates",
  "Harborview Group",
  "Lotus Ridge",
  "Meridian Spaces",
  "Silverleaf Brokers",
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "Our Instagram ads finally talk to our sales team. Leads land in WhatsApp already qualified, and nobody waits till Monday for a reply.",
    name: "Aditi Rao",
    initials: "AR",
    role: "Head of Marketing",
    company: "Crestline Homes (placeholder)",
    metric: "3.1× site visits",
  },
  {
    id: "t2",
    quote: "The AI handles the 11 PM price questions. My channel partners wake up to booked visits instead of missed calls.",
    name: "Karan Mehta",
    initials: "KM",
    role: "Founder, Broker Network",
    company: "Silverleaf Brokers (placeholder)",
    metric: "92% replied < 1 min",
  },
  {
    id: "t3",
    quote: "Milestone payment reminders used to take my CRM team two days. Now they go out the moment the slab is cast.",
    name: "Neha Kulkarni",
    initials: "NK",
    role: "CRM Manager",
    company: "Verdant Estates (placeholder)",
    metric: "18 days faster collections",
  },
  {
    id: "t4",
    quote: "Comment-to-DM alone paid for the plan. Every 'price?' on a reel now becomes a conversation.",
    name: "Imran Shaikh",
    initials: "IS",
    role: "Digital Lead",
    company: "Harborview Group (placeholder)",
    metric: "+640 leads / month",
  },
  {
    id: "t5",
    quote: "Six agents, one WhatsApp number, zero confusion. Private notes and assignment rules changed how we hand off leads.",
    name: "Priyanka Desai",
    initials: "PD",
    role: "Sales Head",
    company: "Lotus Ridge (placeholder)",
    metric: "2.4 h saved / agent / day",
  },
  {
    id: "t6",
    quote: "Setup took an afternoon. The AI answered from our brochure on day one and handed off anything it wasn't sure about.",
    name: "Rohit Verma",
    initials: "RV",
    role: "Director",
    company: "Meridian Spaces (placeholder)",
    metric: "Live in 1 day",
  },
];

export const caseStudy = {
  company: "Azure Bay Realty (placeholder)",
  title: "How a 120-unit launch filled its weekend site visits in 3 weeks",
  metrics: [
    { label: "First response time", before: "4h 12m", after: "< 2s", beforeValue: 100, afterValue: 2, lowerIsBetter: true },
    { label: "Site visits / month", before: "46", after: "131", beforeValue: 46, afterValue: 131 },
    { label: "Bookings / month", before: "5", after: "13", beforeValue: 5, afterValue: 13 },
  ],
};

export const complianceBadges = [
  { label: "Official WhatsApp Business API", icon: "badge" },
  { label: "End-to-End Encrypted", icon: "lock" },
  { label: "GDPR & DPDP Ready", icon: "shield" },
  { label: "RERA Document Ready", icon: "file" },
  { label: "99.9% Uptime", icon: "activity" },
] as const;
