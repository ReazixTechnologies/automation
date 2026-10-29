import Image from "next/image";
import { brand } from "@/data/brand";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Rendered height in px (navbar 34, footer ~64). */
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * The Reazix lockup, artwork unaltered (see BRAND.md → Logo).
 * Dark theme: the transparent-background derivative, which is pixel-identical
 * to the original over black and sits cleanly on any dark surface.
 * Light theme: the original on a small near-black plate, never recoloured.
 */
export function Logo({ height = 34, priority = false, className }: LogoProps) {
  const { width: w, height: h } = brand.logo.lockupSize;
  const width = Math.round((height * w) / h);
  const common = { width, height, priority, quality: 90, style: { height, width } } as const;
  return (
    <span className={cn("inline-flex", className)}>
      <Image src={brand.logo.lockupDark} alt={brand.logo.alt} className="hidden max-w-none dark:block" {...common} />
      <span className="inline-flex rounded-md bg-ink-900 px-1.5 py-1 dark:hidden">
        <Image src={brand.logo.lockup} alt={brand.logo.alt} className="max-w-none" {...common} />
      </span>
    </span>
  );
}
