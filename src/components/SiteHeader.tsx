import { Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, BarChart3, Globe2, Megaphone, Plane, Radio } from "lucide-react";
import { GLOBAL_RISK, OUTBREAK } from "@/data/seed";
import { RiskBadge } from "./RiskBadge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "总览", icon: Activity },
  { to: "/epidemic-data", label: "疫情数据", icon: BarChart3 },
  { to: "/risk-matrix", label: "风险研判", icon: AlertTriangle },
  { to: "/announcements", label: "公告汇总", icon: Megaphone },
  { to: "/border-measures", label: "边境措施", icon: Plane },
  { to: "/sources", label: "信息源", icon: Radio },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Globe2 className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">国家疫情监测平台</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">EPIDEMIC INTELLIGENCE</div>
          </div>
        </Link>
        <nav className="ml-4 flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
              activeOptions={{ exact: item.to === "/" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block text-right leading-tight">
            <div className="text-xs text-muted-foreground">当前监测</div>
            <div className="text-xs font-medium text-foreground">
              {OUTBREAK.pathogen} · {OUTBREAK.region}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-2 py-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">全球风险</span>
            <RiskBadge level={GLOBAL_RISK} />
          </div>
        </div>
      </div>
      <div className={cn("h-0.5 w-full", GLOBAL_RISK === "high" ? "bg-destructive" : GLOBAL_RISK === "medium" ? "bg-warning" : "bg-success")} />
    </header>
  );
}