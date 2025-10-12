import { cn } from "@/lib/utils";

export default function Loading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        `fixed inset-0 z-[30] flex items-center justify-center backdrop-blur-sm`,
        className,
      )}
    >
      <div className="loader-custom">
        <svg
          id="cloud"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="roundness">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
              <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" />
            </filter>
            <mask id="shapes">
              <g fill="white">
                <polygon points="50 37.5 80 75 20 75 50 37.5" />
                <circle cx="20" cy="60" r="15" />
                <circle cx="80" cy="60" r="15" />
                <g>
                  <circle cx="20" cy="60" r="15" />
                  <circle cx="20" cy="60" r="15" />
                  <circle cx="20" cy="60" r="15" />
                </g>
              </g>
            </mask>
            <mask id="clipping" maskUnits="userSpaceOnUse">
              <g filter="url(#roundness)" id="lines">
                <g mask="url(#shapes)" stroke="white">
                  <line x1="-50" x2="150" y1="-40" y2="-40" />
                  <line x1="-50" x2="150" y1="-31" y2="-31" />
                  <line x1="-50" x2="150" y1="-22" y2="-22" />
                  <line x1="-50" x2="150" y1="-13" y2="-13" />
                  <line x1="-50" x2="150" y1="-4" y2="-4" />
                  <line x1="-50" x2="150" y1="5" y2="5" />
                  <line x1="-50" x2="150" y1="14" y2="14" />
                  <line x1="-50" x2="150" y1="23" y2="23" />
                  <line x1="-50" x2="150" y1="32" y2="32" />
                  <line x1="-50" x2="150" y1="41" y2="41" />
                  <line x1="-50" x2="150" y1="50" y2="50" />
                  <line x1="-50" x2="150" y1="59" y2="59" />
                  <line x1="-50" x2="150" y1="68" y2="68" />
                  <line x1="-50" x2="150" y1="77" y2="77" />
                  <line x1="-50" x2="150" y1="86" y2="86" />
                  <line x1="-50" x2="150" y1="95" y2="95" />
                  <line x1="-50" x2="150" y1="104" y2="104" />
                  <line x1="-50" x2="150" y1="113" y2="113" />
                  <line x1="-50" x2="150" y1="122" y2="122" />
                  <line x1="-50" x2="150" y1="131" y2="131" />
                  <line x1="-50" x2="150" y1="140" y2="140" />
                </g>
              </g>
            </mask>
          </defs>
          <rect
            height="100"
            mask="url(#clipping)"
            rx="0"
            ry="0"
            width="100"
            x="0"
            y="0"
          />
        </svg>
      </div>
    </div>
  );
}
