import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LightStroke } from "./LightStroke";

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: string;
  /** One key word or phrase in `title` rendered in the copper gradient (BRAND.md). */
  highlight?: string;
  description?: ReactNode;
  align?: "left" | "center";
  /** Heading level; defaults to h2 for section titles. */
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}

/** Splits `title` around `highlight` so that word gets the signature gradient. */
export function HighlightedTitle({ title, highlight }: { title: string; highlight?: string }) {
  const at = highlight ? title.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-gradient-copper font-semibold">{highlight}</span>
      {title.slice(at + highlight.length)}
    </>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  as: Tag = "h2",
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Tag id={id} className="text-3xl font-light leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        <HighlightedTitle title={title} highlight={highlight} />
      </Tag>
      <LightStroke className={cn("mt-4", align === "center" && "mx-auto")} />
      {description && <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  );
}
