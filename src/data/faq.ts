/**
 * FAQ content: rendered by the FAQ section and emitted as FAQPage JSON-LD.
 * TODO(launch): have legal/compliance review answers on bans, privacy and Meta charges.
 */

export type FaqCategory = "Setup" | "WhatsApp" | "Instagram" | "AI Concierge" | "Pricing" | "Security";

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export const faqCategories: ("All" | FaqCategory)[] = ["All", "Setup", "WhatsApp", "Instagram", "AI Concierge", "Pricing", "Security"];

export const faqs: Faq[] = [
  {
    id: "ban-risk",
    category: "WhatsApp",
    question: "Will my WhatsApp number get banned?",
    answer:
      "We use the official WhatsApp Business Platform, not unofficial tools, so your number is used within Meta's policies. Bans usually come from spam-like behaviour; we only message opted-in contacts and use approved templates for broadcasts.",
  },
  {
    id: "go-live",
    category: "Setup",
    question: "How long does it take to go live?",
    answer:
      "Most projects are live in 7 days. Our team handles WhatsApp Business API approval, connects your Instagram account, trains the AI on your project material and tests every flow with you before launch.",
  },
  {
    id: "instagram",
    category: "Instagram",
    question: "Can you automate Instagram DMs and comments?",
    answer:
      "Yes. Replies to DMs, story mentions and comments like \"Price?\" on posts and reels can trigger an instant DM with prices or a brochure, and the conversation can move to WhatsApp with one tap.",
  },
  {
    id: "training",
    category: "AI Concierge",
    question: "How is the AI trained on my project?",
    answer:
      "You share brochures, price sheets, floor plans and FAQs; we build the knowledge base and review it with you. The AI answers only from that approved material and hands off to a person when a question isn't covered, so it never invents prices or offers.",
  },
  {
    id: "handoff",
    category: "AI Concierge",
    question: "What happens when a buyer wants to talk to a person?",
    answer:
      "The AI hands the chat to an available agent with the full conversation, captured details and lead score, and the buyer sees the agent join. You can also set rules, like routing ₹2 Cr+ budgets to senior agents.",
  },
  {
    id: "multi-agent",
    category: "WhatsApp",
    question: "Can multiple agents use one WhatsApp number?",
    answer:
      "Yes. Your whole team works from a shared inbox on one number, with assignment, private notes, and a clear record of who replied to whom.",
  },
  {
    id: "crm",
    category: "Setup",
    question: "Does it integrate with my CRM?",
    answer:
      "Leads, captured fields and conversation summaries sync to popular CRMs and Google Sheets, or to any system through webhooks and Zapier.",
  },
  {
    id: "site-visits",
    category: "AI Concierge",
    question: "How does site visit booking work?",
    answer:
      "Buyers pick a slot from your calendar inside the chat, get a map pin to the site, and receive a reminder before the visit with options to confirm or reschedule.",
  },
  {
    id: "languages",
    category: "AI Concierge",
    question: "Which languages does the AI support?",
    answer: "The concierge replies in the buyer's language, including English, Hindi, Hinglish, Marathi and Arabic, and you can review every conversation in your inbox.",
  },
  {
    id: "privacy",
    category: "Security",
    question: "How is buyer data protected?",
    answer:
      "Data is encrypted in transit and at rest, access is role-based, and you can export or delete a contact's data on request, in line with GDPR and India's DPDP Act.",
  },
  {
    id: "meta-charges",
    category: "Pricing",
    question: "Are Meta's WhatsApp charges included in the plan?",
    answer: "No. Meta messaging fees, third-party platform subscriptions and AI usage costs are billed separately unless explicitly included in your signed plan. Plans start at ₹3,999/month (Instagram Basic) and ₹4,999/month (WhatsApp Basic).",
  },
  {
    id: "getting-started",
    category: "Pricing",
    question: "How does working with Reazix start?",
    answer: "With a free strategy call: just call us on +91 82755 29298. We look at your projects, lead sources and sales process, then recommend a plan. You can also try the live AI demo on this page first.",
  },
];
