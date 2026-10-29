import { brand } from "@/data/brand";
import { faqs } from "@/data/faq";
import { plans } from "@/data/pricing";
import { siteDescription, siteUrl } from "@/lib/site";

/** Organization, Service and FAQPage structured data. */
export function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brand.fullName,
      alternateName: brand.name,
      slogan: brand.tagline,
      url: siteUrl,
      logo: `${siteUrl}${brand.logo.original}`,
      contactPoint: { "@type": "ContactPoint", telephone: "+91-8275529298", contactType: "sales", areaServed: "IN" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "WhatsApp & Instagram AI automation for real estate",
      serviceType: "Done-for-you conversational AI and messaging automation",
      description: siteDescription,
      provider: { "@type": "Organization", name: brand.fullName, url: siteUrl },
      areaServed: ["IN", "AE"],
      offers: plans.map((p) => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "INR", description: "Monthly subscription" })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ];
  // "<" is escaped so content can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
