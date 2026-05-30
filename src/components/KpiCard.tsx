import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  unit,
  deltaWeek,
  source,
  invertDelta = false,
}: {
  label: string;
  value: number | string;
  unit?: string;
  deltaWeek?: number;
  source?: string;
  invertDelta?: boolean;
}) {
  const delta = deltaWeek ?? 0;
  const sign = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  // For epidemic indicators, "up" is generally bad
  const badDirection = invertDelta ? "down" : "up";
  const tone = sign === "flat" ? "muted" : sign === badDirection ? "bad" : "good";

  const Icon = sign === "up" ? ArrowUpRight : sign === "down" ? ArrowDownRight : Minus;
  const toneClass =
    tone === "bad"
      ? "text-destructive"
      : tone === "good"
        ? "text-success"
        : "text-muted-foreground";

  return (
    <div className="flex flex-col rounded-md border border-border bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-foreground tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={cn("inline-flex items-center gap-1 font-medium", toneClass)}>
          <Icon className="h-3.5 w-3.5" />
          {delta > 0 ? "+" : ""}
          {delta} <span className="text-muted-foreground font-normal">7日</span>
        </span>
        {source && <span className="text-muted-foreground truncate ml-2">{source}</span>}
      </div>
    </div>
  );
}