import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ChatVariant } from "@/types/chat";

interface ChatNoticeProps {
  children: ReactNode;
  /**
   * encryption: lock + yellow WhatsApp banner
   * date: small centered pill
   * system: centered event line, e.g. "Rahul from Sales joined the chat"
   */
  kind?: "encryption" | "date" | "system";
  variant?: ChatVariant;
  icon?: ReactNode;
  className?: string;
}

export function ChatNotice({ children, kind = "encryption", variant = "whatsapp", icon, className }: ChatNoticeProps) {
  const style =
    kind === "encryption"
      ? "max-w-[92%] bg-[#FFEECD] text-[#54656F] shadow-[0_1px_0.5px_rgb(11_18_21/0.13)] dark:bg-[#182229] dark:text-[#FFD279]"
      : variant === "instagram"
        ? "bg-transparent text-[#737373] dark:text-[#A8A8A8]"
        : "bg-white text-[#54656F] shadow-[0_1px_0.5px_rgb(11_18_21/0.13)] dark:bg-[#182229] dark:text-[#8696A0]";

  return (
    <div className={cn("flex justify-center", className)}>
      <p
        className={cn(
          "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-center text-[10.5px] leading-snug",
          kind === "system" && "font-medium",
          style,
        )}
      >
        {kind === "encryption" && <Lock aria-hidden className="h-2.5 w-2.5 shrink-0" />}
        {icon}
        <span>{children}</span>
      </p>
    </div>
  );
}
