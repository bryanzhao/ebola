import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, ArrowUpRight, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { RiskBadge } from "@/components/RiskBadge";
import { RISK_DIMENSIONS, TRIGGERS, JUDGMENT } from "@/data/seed";

export const Route = createFileRoute("/risk-matrix")({
  head: () => ({
    meta: [
      { title: "风险研判矩阵 · 国家疫情监测平台" },
      { name: "description", content: "基于四维度的输入性疫情风险研判与升级触发条件。" },
    ],
  }),
  component: RiskMatrixPage,
});

function RiskMatrixPage() {
  return (
    <PageShell
      eyebrow="RISK MATRIX"
      title="输入性风险研判矩阵"
      description="综合疫情严重度、地理扩散度、边境管控力度与对策可用性四个维度，按 IHR 2005 框架对当前疫情进行评估。"
    >
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium w-44">维度</th>
              <th className="px-5 py-3 text-left font-medium w-24">当前等级</th>
              <th className="px-5 py-3 text-left font-medium">关键监测指标</th>
              <th className="px-5 py-3 text-left font-medium">高风险信号</th>
              <th className="px-5 py-3 text-left font-medium">当前状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RISK_DIMENSIONS.map((d) => (
              <tr key={d.key} className="align-top">
                <td className="px-5 py-4 font-semibold text-foreground">{d.name}</td>
                <td className="px-5 py-4"><RiskBadge level={d.level} /></td>
                <td className="px-5 py-4 text-muted-foreground">{d.indicators}</td>
                <td className="px-5 py-4 text-muted-foreground">{d.highSignal}</td>
                <td className="px-5 py-4 text-foreground">{d.currentState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">风险升级触发条件</h2>
          <p className="mt-1 text-xs text-muted-foreground">满足任一条件即应触发应急研判流程</p>
        </header>
        <ul className="divide-y divide-border">
          {TRIGGERS.map((t) => (
            <li key={t.id} className="flex items-start gap-3 px-5 py-3">
              {t.triggered ? (
                <CircleAlert className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
              )}
              <div className="flex-1">
                <div className="text-sm text-foreground">
                  <span className="font-mono text-xs text-muted-foreground mr-2">#{t.id}</span>
                  {t.text}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.note}</div>
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-widest ${
                  t.triggered ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {t.triggered ? "已触发" : "未触发"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">综合研判 · 输入中国风险</h2>
            <p className="mt-1 text-xs text-muted-foreground">基于疫情、公告、边境措施与信息源综合评估 · 更新于 {JUDGMENT.updatedAt}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">综合等级</span>
            <RiskBadge level={JUDGMENT.level} />
            <span className="text-sm font-semibold text-foreground">{JUDGMENT.label}</span>
          </div>
        </header>

        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm leading-relaxed text-foreground font-medium">{JUDGMENT.headline}</p>
          <div className="mt-3 space-y-2">
            {JUDGMENT.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpRight className="h-4 w-4 text-destructive" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">风险升级路径</h3>
            </div>
            <ul className="space-y-2">
              {JUDGMENT.escalationPaths.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive shrink-0">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-success" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">缓释因素</h3>
            </div>
            <ul className="space-y-2">
              {JUDGMENT.mitigatingFactors.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-success shrink-0">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}