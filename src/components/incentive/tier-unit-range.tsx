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
        "inline-flex items-center gap-px font-mono tabular-nums leading-none text-muted",
        textSize,
        className,
      )}
    >
      <span className="leading-none">{minUnits}</span>
      <span aria-hidden="true" className="leading-none">
        –
      </span>
      {maxUnits === null ? (
        <span className="inline-block align-middle leading-[1]" aria-label="no maximum">
          ∞
        </span>
      ) : (
        <span className="leading-none">{maxUnits}</span>
      )}
    </span>
  );
}
