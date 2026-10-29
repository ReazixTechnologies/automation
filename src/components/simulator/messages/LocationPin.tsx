import { ExternalLink, MapPin } from "lucide-react";

interface LocationPinProps {
  title: string;
  address: string;
  /** Demo-only: there is no real map link. */
  onOpen?: () => void;
}

/** Styled map preview card. Pure CSS/SVG, no map tiles. */
export function LocationPin({ title, address, onOpen }: LocationPinProps) {
  return (
    <div className="w-56 max-w-full">
      <div role="img" aria-label={`Map preview: ${title}`} className="relative h-28 overflow-hidden rounded-md bg-[#E8EFE4] dark:bg-[#1F2B26]">
        <svg aria-hidden viewBox="0 0 224 112" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          <rect x="0" y="0" width="224" height="112" className="fill-[#E8EFE4] dark:fill-[#1F2B26]" />
          <path d="M150 0c-10 30 10 50 40 60s34 52 34 52H224V0z" className="fill-[#BFDDF2] dark:fill-[#1D3A4F]" />
          <rect x="20" y="14" width="40" height="26" rx="3" className="fill-[#D6E6CF] dark:fill-[#25362E]" />
          <rect x="70" y="70" width="46" height="30" rx="3" className="fill-[#D6E6CF] dark:fill-[#25362E]" />
          <path d="M0 58h224M96 0v112M0 92c60-10 110 4 224-14" className="stroke-white dark:stroke-[#3A4A44]" strokeWidth="6" fill="none" />
          <path d="M0 58h224M96 0v112" className="stroke-[#F6D58E] dark:stroke-[#6B5A2E]" strokeWidth="2" fill="none" />
        </svg>
        <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <MapPin aria-hidden className="h-8 w-8 fill-[#E5484D] text-white drop-shadow" strokeWidth={1.5} />
          <span className="-mt-1 h-1.5 w-3 rounded-full bg-black/25 blur-[1px]" />
        </span>
      </div>
      <div className="px-1.5 pt-1.5">
        <p className="text-[12.5px] font-semibold leading-tight">{title}</p>
        <p className="text-[10.5px] text-[#667781] dark:text-[#8696A0]">{address}</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-1.5 flex w-full items-center justify-center gap-1.5 border-t border-black/10 py-1.5 text-[12px] font-semibold text-[#027EB5] dark:border-white/10 dark:text-[#53BDEB]"
      >
        <ExternalLink aria-hidden className="h-3.5 w-3.5" />
        Open in Maps
      </button>
    </div>
  );
}
