import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/seed";

const LABELS: Record<RiskLevel, string> = { low: "低", medium: "中", high: "高" };
const STYLES: Record<RiskLevel, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/20 text-warning-foreground border-warning/40",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

export function RiskBadge({ level, label, className }: { level: RiskLevel; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        STYLES[level],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? LABELS[level]}
    </span>
  );
}