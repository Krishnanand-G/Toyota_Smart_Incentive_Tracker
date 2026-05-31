import { cn } from "@/lib/utils";

type TierUnitRangeProps = {
  minUnits: number;
  maxUnits: number | null;
  className?: string;
  size?: "xs" | "sm";
};

export function TierUnitRange({
  minUnits,
  maxUnits,
  className,
  size = "xs",
}: TierUnitRangeProps) {
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-px font-mono tabular-nums leading-none text-muted",
        textSize,
        className,
      )}
    >
      <span>{minUnits}</span>
      <span aria-hidden="true">–</span>
      {maxUnits === null ? (
        <span className="inline-flex h-[1em] translate-y-px items-center font-sans text-[1.1em] leading-none">
          ∞
        </span>
      ) : (
        <span>{maxUnits}</span>
      )}
    </span>
  );
}
