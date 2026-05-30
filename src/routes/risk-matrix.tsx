import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { RiskBadge } from "@/components/RiskBadge";
import { RISK_DIMENSIONS, TRIGGERS } from "@/data/seed";

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

      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">综合研判 · 输入中国风险</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          当前评估为<strong className="text-warning-foreground"> 低至中等 </strong>。Bundibugyo 型埃博拉无获批疫苗与治疗药物（对策维度高风险），疫情已扩散至乌干达
          但尚无第三国报告。中国海关总署已于 2026-05-20 发布第 65 号公告启动口岸卫生检疫，非洲直航及中转旅客数量有限。
          需密切关注的升级路径：疫情扩散至东非更多国家（肯尼亚、坦桑尼亚）或南非；中转枢纽（迪拜、多哈、亚的斯亚贝巴）实施限流；
          WHO 召开 IHR 紧急委员会评估 PHEIC。
        </p>
      </section>
    </PageShell>
  );
}