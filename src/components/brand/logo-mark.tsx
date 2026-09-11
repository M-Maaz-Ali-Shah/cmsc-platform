import { cn } from "@/lib/utils";

/**
 * Logo concept — v1
 * A circular roundel: a fine outer ring marked with two points (representing
 * Great Britain and continental Europe) joined by a subtle arc across the
 * globe, an inner midnight-navy field, and a gold crescent + star at the
 * center. Kept deliberately restrained per brand guidance (no clutter).
 *
 * This is a coded vector concept, not an AI-generated illustration — see
 * chat for why. It's easy to swap for a commissioned mark later without
 * touching any layout code, since every usage goes through this component.
 */
export function LogoMark({
  className,
  variant = "onLight",
}: {
  className?: string;
  variant?: "onLight" | "onDark";
}) {
  const ringColor = variant === "onDark" ? "#D9B968" : "#0A1730";
  const fieldColor = variant === "onDark" ? "#0A1730" : "#0A1730";
  const fieldStroke = variant === "onDark" ? "#D9B968" : "transparent";

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="Central Moon Sighting Committee crest"
    >
      <defs>
        <linearGradient id="cmsc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E4C878" />
          <stop offset="100%" stopColor="#B8912A" />
        </linearGradient>
        <mask id="cmsc-crescent-mask">
          <rect x="0" y="0" width="64" height="64" fill="black" />
          <circle cx="30" cy="32" r="12" fill="white" />
          <circle cx="35.5" cy="27.5" r="9.6" fill="black" />
        </mask>
      </defs>

      {/* Outer globe ring with GB + EU reference points */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke={ringColor}
        strokeOpacity={variant === "onDark" ? 0.55 : 0.18}
        strokeWidth="1.1"
      />
      <path
        d="M 14 20 A 26 26 0 0 1 46 15"
        fill="none"
        stroke="url(#cmsc-gold)"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="14" cy="20" r="1.9" fill="url(#cmsc-gold)" />
      <circle cx="46" cy="15" r="1.9" fill="url(#cmsc-gold)" />

      {/* Inner field */}
      <circle
        cx="32"
        cy="32"
        r="22.5"
        fill={fieldColor}
        stroke={fieldStroke}
        strokeWidth="1"
      />

      {/* Crescent */}
      <circle cx="30" cy="32" r="12" fill="url(#cmsc-gold)" mask="url(#cmsc-crescent-mask)" />

      {/* Star */}
      <path
        d="M40.5 24.2l1.1 2.8 2.9.2-2.3 1.9.8 2.9-2.5-1.6-2.5 1.6.8-2.9-2.3-1.9 2.9-.2z"
        fill="url(#cmsc-gold)"
      />
    </svg>
  );
}
