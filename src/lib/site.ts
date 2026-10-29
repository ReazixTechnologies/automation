/** Canonical site URL. TODO(launch): confirm the production domain (reazix.com is a placeholder) and set NEXT_PUBLIC_SITE_URL. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://reazix.com").replace(/\/$/, "");

export const siteDescription =
  "Reazix is a digital product studio that designs and runs done-for-you WhatsApp and Instagram AI concierges for real estate: instant replies, smart qualification and booked site visits, 24/7.";
