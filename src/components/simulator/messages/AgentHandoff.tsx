import { UserPlus } from "lucide-react";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { ChatNotice } from "@/components/ui/ChatNotice";
import type { ChatVariant } from "@/types/chat";

interface AgentHandoffProps {
  agent: string;
  team: string;
  reply: string;
  timestamp?: string;
  variant?: ChatVariant;
  animate?: boolean;
}

/** System line ("Rahul from Sales joined the chat") followed by the agent's canned reply. */
export function AgentHandoff({ agent, team, reply, timestamp, variant = "whatsapp", animate = true }: AgentHandoffProps) {
  return (
    <>
      <ChatNotice kind="system" variant={variant} icon={<UserPlus aria-hidden className="h-3 w-3" />} className="my-1">
        {agent === "Reazix" ? "A Reazix specialist will reach out" : `${agent} from ${team} joined the chat`}
      </ChatNotice>
      <ChatBubble
        variant={variant}
        sender="bot"
        author={agent === "Reazix" ? "Reazix · Digital Product Studio" : `${agent} · ${team} Advisor`}
        text={reply}
        timestamp={variant === "whatsapp" ? timestamp : undefined}
        animate={animate}
      />
    </>
  );
}
