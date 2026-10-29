import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "copper" | "subtle" | "neutral" | "instagram";

const variants: Record<BadgeVariant, string> = {
  copper: "border-copper-500/40 bg-copper-500/10 text-copper-700 dark:text-copper-300",
  subtle: "border-border bg-card text-copper-700 dark:text-copper-300",
  neutral: "border-border bg-muted text-muted-foreground",
  instagram: "border-ig-pink/30 bg-ig-pink/10 text-[#B01E62] dark:text-[#F57BB0]",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

export function Badge({ variant = "copper", icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10.5px] font-medium uppercase tracking-eyebrow sm:text-[11px]",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
