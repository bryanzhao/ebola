import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { INFO_SOURCES, type SourceStatus, type SourceTier } from "@/data/seed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "信息源管理 · 国家疫情监测平台" },
      { name: "description", content: "三层信息源采集架构、最近采集时间与状态。" },
    ],
  }),
  component: SourcesPage,
});

const TIER_LABEL: Record<SourceTier, string> = {
  1: "Tier 1 · 核心权威源",
  2: "Tier 2 · 主要国家 CDC / 卫生部门",
  3: "Tier 3 · 辅助信息源",
};
const TIER_DESC: Record<SourceTier, string> = {
  1: "每 6 小时采集（00:00 / 06:00 / 12:00 / 18:00 UTC），更新后立即触发告警",
  2: "每日至少 1 次，关键词命中升级解析",
  3: "事件驱动，由前两级异常信号触发",
};
const STATUS_STYLE: Record<SourceStatus, string> = {
  正常: "text-success bg-success/10 border-success/30",
  延迟: "text-warning-foreground bg-warning/20 border-warning/40",
  失败: "text-destructive bg-destructive/10 border-destructive/30",
};

function SourcesPage() {
  const t1 = INFO_SOURCES.filter((s) => s.tier === 1);
  const t2 = INFO_SOURCES.filter((s) => s.tier === 2);
  const t3 = INFO_SOURCES.filter((s) => s.tier === 3);
  const delayed = INFO_SOURCES.filter((s) => s.status !== "正常").length;

  return (
    <PageShell
      eyebrow="SOURCES"
      title="信息源管理"
      description="按权威性与时效性分为三层，覆盖 WHO、各国 CDC / 卫生部、航空与人道主义机构。"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Tier 1 核心源" value={t1.length} />
        <Stat label="Tier 2 国家源" value={t2.length} />
        <Stat label="Tier 3 辅助源" value={t3.length} />
        <Stat label="异常状态" value={delayed} tone={delayed > 0 ? "bad" : undefined} />
      </div>

      {[1, 2, 3].map((tier) => {
        const sources = INFO_SOURCES.filter((s) => s.tier === tier);
        return (
          <section key={tier} className="mt-6 overflow-hidden rounded-md border border-border bg-card">
            <header className="border-b border-border bg-surface px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">{TIER_LABEL[tier as SourceTier]}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{TIER_DESC[tier as SourceTier]}</p>
            </header>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-2.5 text-left font-medium">信息源</th>
                  <th className="px-5 py-2.5 text-left font-medium w-32">类别</th>
                  <th className="px-5 py-2.5 text-left font-medium w-32">采集频率</th>
                  <th className="px-5 py-2.5 text-left font-medium w-44">最近更新</th>
                  <th className="px-5 py-2.5 text-left font-medium w-24">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map((s) => (
                  <tr key={s.name}>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 hover:text-primary">
                          {s.name} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        s.name
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{s.category}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.frequency}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{s.lastUpdate}</td>
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold", STATUS_STYLE[s.status])}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}

      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">采集流水线</h2>
        <pre className="mt-3 overflow-x-auto rounded-sm bg-surface p-4 text-xs text-foreground">
{`┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ 定时触发器  │───▶│  URL 采集器  │───▶│  解析/抽取  │───▶│ 结构化存储   │
│ (cron 6h)   │    │ (HTTP/RSS)   │    │ (NLP/正则)  │    │ (时序数据库) │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘`}
        </pre>
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