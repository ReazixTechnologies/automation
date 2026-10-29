/**
 * Integrations shown as text + generic icons (no brand logo files).
 * TODO(launch): list only integrations that are live in the product.
 */

export type IntegrationIcon = "crm" | "calendar" | "sheet" | "ads" | "instagram" | "widget" | "webhook" | "payment";

export interface Integration {
  name: string;
  category: string;
  icon: IntegrationIcon;
}

export const integrations: Integration[] = [
  { name: "Salesforce", category: "CRM", icon: "crm" },
  { name: "HubSpot", category: "CRM", icon: "crm" },
  { name: "Zoho CRM", category: "CRM", icon: "crm" },
  { name: "LeadSquared", category: "CRM", icon: "crm" },
  { name: "Google Calendar", category: "Site visits", icon: "calendar" },
  { name: "Google Sheets", category: "Reports", icon: "sheet" },
  { name: "Meta Ads", category: "Lead source", icon: "ads" },
  { name: "Instagram", category: "DMs & comments", icon: "instagram" },
  { name: "Website Widget", category: "Lead source", icon: "widget" },
  { name: "Zapier / Webhooks", category: "Automation", icon: "webhook" },
  { name: "Payment links (UPI)", category: "Collections", icon: "payment" },
];
