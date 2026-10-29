import type { ChatScriptEvent } from "@/types/chat";

export const heroContent = {
  badge: "Reazix · Digital Product Studio · Real Estate Automation",
  headline: {
    text: "We Build AI Concierges That Turn WhatsApp & Instagram Chats Into Site Visits",
    highlight: "Site Visits",
  },
  subheading:
    "Reazix designs and runs done-for-you WhatsApp and Instagram automation for real estate — instant replies, smart qualification, and booked visits, 24/7.",
  trust: ["Live in 7 days", "Official WhatsApp Business API", "Fully managed by our team"],
  stats: [
    { prefix: "< ", value: 2, suffix: "s", label: "reply time" },
    { prefix: "", value: 3, suffix: "X", label: "site visits" },
    { prefix: "", value: 24, suffix: "/7", label: "lead capture" },
  ],
  statsDisclaimer: "Illustrative figures for demonstration only.",
} as const;

export const heroChat = {
  contact: {
    name: "Skyline Heights",
    initials: "SH",
    verified: true,
    status: "online",
  },
  encryptionNotice:
    "Messages and calls are end-to-end encrypted. Tap to learn more.",
  floatingCards: {
    instagram: { title: "New DM from @priya.homes", body: "Price for 3BHK?" },
    calendar: { title: "Site visit booked", body: "Sat 11:00 AM • Tower B" },
  },
} as const;

export const heroChatScript: ChatScriptEvent[] = [
  {
    type: "message",
    delay: 600,
    message: {
      id: "welcome",
      sender: "bot",
      text: "👋 Welcome to Skyline Heights! I'm your AI Property Concierge.",
      timestamp: "9:41 AM",
    },
  },
  { type: "typing", duration: 900, delay: 300 },
  {
    type: "message",
    message: {
      id: "config",
      sender: "bot",
      text: "Which configuration are you exploring today?",
      timestamp: "9:41 AM",
      quickReplies: [
        { id: "2bhk", label: "2 BHK" },
        { id: "3bhk", label: "3 BHK" },
        { id: "4bhk", label: "4 BHK Penthouse" },
      ],
    },
  },
  { type: "select", messageId: "config", replyId: "3bhk", delay: 1600 },
  {
    type: "message",
    delay: 450,
    message: { id: "user-3bhk", sender: "user", text: "3 BHK", timestamp: "9:42 AM", status: "read" },
  },
  { type: "typing", duration: 1200, delay: 400 },
  {
    type: "message",
    message: {
      id: "price",
      sender: "bot",
      text: "Great choice! 3 BHK starts at ₹1.85 Cr, 1,820 sq.ft carpet. Want the floor plan?",
      timestamp: "9:42 AM",
    },
  },
  { type: "typing", duration: 800, delay: 700 },
  {
    type: "message",
    message: {
      id: "floorplan",
      sender: "bot",
      timestamp: "9:42 AM",
      attachments: [{ type: "pdf", name: "Floor_Plan_3BHK.pdf", meta: "2 pages • PDF • 1.4 MB" }],
    },
  },
  { type: "toast", text: "Lead synced to CRM in 0s", delay: 600 },
  { type: "pause", duration: 2500 },
];
