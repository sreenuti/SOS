"use client";

interface InfoIconProps {
  /** Accessible label for the icon */
  ariaLabel: string;
  /** Tooltip content (shown on hover). Use normal case, not all caps. */
  content: React.ReactNode;
  /** Optional class for the wrapper (e.g. ml-1) */
  className?: string;
  /** Show tooltip below the icon instead of above (use when inside overflow-hidden, e.g. accordion headers) */
  placement?: "above" | "below";
}

export default function InfoIcon({ ariaLabel, content, className = "", placement = "above" }: InfoIconProps) {
  const isBelow = placement === "below";
  return (
    <span className={`group relative inline-flex ${className}`}>
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full border border-ocean-cyan/60 bg-ocean-cyan/10 text-ocean-cyan cursor-help text-xs font-semibold italic lowercase"
        aria-label={ariaLabel}
      >
        i
      </span>
      <span
        className={`pointer-events-none absolute left-1/2 z-50 w-64 -translate-x-1/2 rounded-lg border border-ocean-border bg-ocean-card/95 px-3 py-2 text-xs text-ocean-text shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 normal-case ${
          isBelow ? "top-full mt-1.5" : "bottom-full mb-1.5"
        }`}
      >
        {content}
      </span>
    </span>
  );
}
