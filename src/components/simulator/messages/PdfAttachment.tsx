import { BadgeCheck } from "lucide-react";
import { AttachmentCard } from "@/components/ui/ChatBubble";
import type { ChatVariant } from "@/types/chat";

interface PdfAttachmentProps {
  name: string;
  meta: string;
  variant?: ChatVariant;
  /** Show a "Digitally verified" line under the file. */
  verified?: boolean;
}

/** First-page preview (CSS floor plan) above the shared file row from ChatBubble. */
export function PdfAttachment({ name, meta, variant = "whatsapp", verified = false }: PdfAttachmentProps) {
  return (
    <div className="w-56 max-w-full">
      <div role="img" aria-label={`Preview of ${name}`} className="mb-1 overflow-hidden rounded-md bg-[#F4F1EA] dark:bg-[#E9E4D8]">
        <svg viewBox="0 0 224 110" className="h-[92px] w-full text-[#8A6D34]" aria-hidden>
          <rect x="14" y="12" width="196" height="86" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M14 56h70M84 12v86M84 40h60M144 12v50M144 62h66M110 62v36" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M84 70a12 12 0 0 1 12 12" fill="none" stroke="currentColor" strokeWidth="1" />
          <text x="30" y="36" fontSize="8" fill="currentColor" fontFamily="sans-serif">LIVING</text>
          <text x="100" y="30" fontSize="8" fill="currentColor" fontFamily="sans-serif">BED 1</text>
          <text x="160" y="40" fontSize="8" fill="currentColor" fontFamily="sans-serif">BED 2</text>
          <text x="30" y="80" fontSize="8" fill="currentColor" fontFamily="sans-serif">KITCHEN</text>
          <text x="160" y="84" fontSize="8" fill="currentColor" fontFamily="sans-serif">DECK</text>
        </svg>
      </div>
      <AttachmentCard attachment={{ type: "pdf", name, meta }} variant={variant} />
      {verified && (
        <p className="flex items-center gap-1 px-1.5 pt-1 text-[10.5px] font-semibold text-wa-deep dark:text-wa">
          <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
          Digitally verified document
        </p>
      )}
    </div>
  );
}
