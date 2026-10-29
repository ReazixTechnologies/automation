import { cn } from "@/lib/utils";

/** "Powered by Reazix" footer line for chat widgets. */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-[10px] font-medium uppercase tracking-eyebrow text-muted-foreground", className)}>
      Powered by <span className="text-copper-700 dark:text-copper-300">Reazix</span>
    </p>
  );
}
