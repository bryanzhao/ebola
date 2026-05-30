import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { RiskBadge } from "@/components/RiskBadge";
import { BORDER_MEASURES, HUB_STATUS } from "@/data/seed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/border-measures")({
  head: () => ({
    meta: [
      { title: "边境与旅行措施 · 国家疫情监测平台" },
      { name: "description", content: "各国入境限制、增强筛查与中转枢纽状态追踪。" },
    ],
  }),
  component: BorderMeasuresPage,
});

const MEASURE_STYLE: Record<string, string> = {
  入境禁令: "text-destructive border-destructive/30 bg-destructive/10",
  增强筛查: "text-warning-foreground border-warning/40 bg-warning/15",
  航班暂停: "text-destructive border-destructive/30 bg-destructive/10",
  健康申报: "text-primary border-primary/30 bg-primary/10",
};

const STATUS_STYLE: Record<string, string> = {
  已实施: "text-destructive",
  关注中: "text-warning-foreground",
  已解除: "text-muted-foreground",
};

function BorderMeasuresPage() {
  const implemented = BORDER_MEASURES.filter((m) => m.status === "已实施").length;
  const screening = BORDER_MEASURES.filter((m) => m.measure === "增强筛查").length;
  const bans = BORDER_MEASURES.filter((m) => m.measure === "入境禁令").length;
  return (
    <PageShell
      eyebrow="BORDER MEASURES"
      title="边境与旅行措施追踪"
      description="跟踪各国对疫情发布的入境限制、筛查与健康申报措施，重点关注中国赴非主要中转枢纽。"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="已实施措施" value={implemented} />
        <Stat label="入境禁令" value={bans} tone="bad" />
        <Stat label="增强筛查" value={screening} />
        <Stat label="关键中转枢纽" value={HUB_STATUS.length} />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">关键中转枢纽状态</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {HUB_STATUS.map((h) => (
            <div key={h.code} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-muted-foreground">{h.code}</div>
                <RiskBadge level={h.level} />
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">{h.hub}</div>
              <div className="mt-1 text-xs text-muted-foreground">{h.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-md border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">措施明细</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">国家 / 地区</th>
                <th className="px-5 py-3 text-left font-medium">区域</th>
                <th className="px-5 py-3 text-left font-medium">措施</th>
                <th className="px-5 py-3 text-left font-medium">状态</th>
                <th className="px-5 py-3 text-left font-medium">生效日期</th>
                <th className="px-5 py-3 text-left font-medium">说明</th>
                <th className="px-5 py-3 text-left font-medium">信息源</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {BORDER_MEASURES.map((m, i) => (
                <tr key={i}>
                  <td className="px-5 py-3 font-semibold text-foreground">{m.country}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.region}</td>
                  <td className="px-5 py-3">
                    <span className={cn("inline-block rounded-sm border px-2 py-0.5 text-xs font-medium", MEASURE_STYLE[m.measure])}>
                      {m.measure}
                    </span>
                  </td>
                  <td className={cn("px-5 py-3 text-xs font-semibold uppercase tracking-wider", STATUS_STYLE[m.status])}>{m.status}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{m.effectiveDate}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.detail}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{m.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "bad" }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-2 text-3xl font-semibold tabular-nums", tone === "bad" ? "text-destructive" : "text-foreground")}>{value}</div>
    </div>
  );
}