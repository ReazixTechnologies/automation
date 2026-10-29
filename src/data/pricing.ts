/**
 * Monthly automation plans, from "Reazix_Technologies_Automation_Pricing.pdf".
 * All prices are monthly subscription fees in INR.
 */

export type PlanCategory = "whatsapp" | "instagram" | "combo";
export type PlanTier = "Basic" | "Standard" | "Premium";

export const planCategories: { id: PlanCategory; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "combo", label: "WhatsApp + Instagram" },
];

export interface Plan {
  id: string;
  category: PlanCategory;
  tier: PlanTier;
  name: string;
  /** Monthly price in ₹. */
  price: number;
  features: string[];
  /** Combos: the separate plans' total and the monthly saving. */
  savings?: { individual: number; save: number };
}

export const plans: Plan[] = [
  {
    id: "wa-basic",
    category: "whatsapp",
    tier: "Basic",
    name: "WhatsApp Basic",
    price: 4999,
    features: ["Welcome and away messages", "Automated FAQ replies", "Customer enquiry handling", "Quick replies and basic workflows", "Standard support"],
  },
  {
    id: "wa-standard",
    category: "whatsapp",
    tier: "Standard",
    name: "WhatsApp Standard",
    price: 6999,
    features: [
      "Everything in Basic",
      "AI-powered chatbot",
      "Lead capture with Google Sheets",
      "Automated follow-up workflows",
      "Appointment and order enquiries",
      "Monthly performance report",
    ],
  },
  {
    id: "wa-premium",
    category: "whatsapp",
    tier: "Premium",
    name: "WhatsApp Premium",
    price: 9999,
    features: [
      "Everything in Standard",
      "Advanced multi-step chatbot workflows",
      "Lead qualification and routing",
      "Supported CRM integration",
      "Advanced reporting and priority support",
    ],
  },
  {
    id: "ig-basic",
    category: "instagram",
    tier: "Basic",
    name: "Instagram Basic",
    price: 3999,
    features: ["Automated DM replies", "Welcome messages and FAQs", "Basic enquiry workflows", "Quick responses", "Standard support"],
  },
  {
    id: "ig-standard",
    category: "instagram",
    tier: "Standard",
    name: "Instagram Standard",
    price: 5999,
    features: [
      "Everything in Basic",
      "Comment-to-DM automation where supported",
      "Story-reply automation where supported",
      "AI-powered DM responses",
      "Lead capture and follow-up workflows",
      "Monthly performance report",
    ],
  },
  {
    id: "ig-premium",
    category: "instagram",
    tier: "Premium",
    name: "Instagram Premium",
    price: 8999,
    features: [
      "Everything in Standard",
      "Advanced conversation workflows",
      "Lead qualification and segmentation",
      "Supported CRM integration",
      "Advanced reporting and priority support",
    ],
  },
  {
    id: "combo-basic",
    category: "combo",
    tier: "Basic",
    name: "Basic Combo",
    price: 7999,
    features: ["WhatsApp Basic + Instagram Basic", "Automated replies on both channels", "FAQ and enquiry workflows", "Basic customer lead tracking"],
    savings: { individual: 8998, save: 999 },
  },
  {
    id: "combo-standard",
    category: "combo",
    tier: "Standard",
    name: "Standard Combo",
    price: 11999,
    features: [
      "WhatsApp Standard + Instagram Standard",
      "AI chatbot and DM automation",
      "Lead capture and follow-up",
      "Comment-to-DM workflows where supported",
      "Google Sheets integration and reporting",
    ],
    savings: { individual: 12998, save: 999 },
  },
  {
    id: "combo-premium",
    category: "combo",
    tier: "Premium",
    name: "Premium Combo",
    price: 16999,
    features: [
      "WhatsApp Premium + Instagram Premium",
      "Advanced AI and multi-step workflows",
      "Lead qualification and supported CRM integration",
      "Advanced follow-ups and combined reporting",
      "Priority support",
    ],
    savings: { individual: 18998, save: 1999 },
  },
];

/** Monthly subscription terms, as stated in the pricing document. */
export const pricingTerms = [
  "All prices are monthly subscription fees.",
  "Standard onboarding is included only for straightforward setup; complex setup may be quoted separately.",
  "Meta messaging fees, third-party automation platform subscriptions, AI usage and other usage-based costs are additional unless explicitly included in the signed plan.",
  "Features depend on official API access, account eligibility and platform permissions.",
  "Message limits, AI usage limits, integrations, support scope and cancellation terms are agreed before activation.",
  "Bulk messaging must follow platform policies and applicable customer-consent requirements.",
];

export function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
