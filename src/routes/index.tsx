import { createFileRoute, Link } from "@tanstack/react-router";
import { ANNOUNCEMENTS, KPIS, OUTBREAK, RISK_DIMENSIONS, TRIGGERS } from "@/data/seed";
import { KpiCard } from "@/components/KpiCard";
import { PageShell } from "@/components/PageShell";
import { RiskBadge } from "@/components/RiskBadge";
import { CheckCircle2, ChevronRight, CircleAlert, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "总览 · 国家疫情监测平台" },
      { name: "description", content: "当前疫情概况、综合风险研判与最近事件流。" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const recentEvents = ANNOUNCEMENTS.slice(0, 6);
  return (
    <PageShell
      eyebrow="总览 DASHBOARD"
      title="当前疫情态势"
      description={`监测对象：${OUTBREAK.pathogen}（${OUTBREAK.region}）· 数据截至 ${OUTBREAK.snapshotDate}`}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            unit={k.unit}
            deltaWeek={k.deltaWeek}
            source={k.source}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Risk dimensions */}
        <section className="lg:col-span-2 rounded-md border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">四维风险研判</h2>
            <Link to="/risk-matrix" className="inline-flex items-center text-xs text-primary hover:underline">
              查看完整矩阵 <ChevronRight className="h-3 w-3" />
            </Link>
          </header>
          <div className="divide-y divide-border">
            {RISK_DIMENSIONS.map((d) => (
              <div key={d.key} className="grid grid-cols-[1fr_auto] gap-3 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{d.name}</h3>
                    <RiskBadge level={d.level} />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.currentState}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Outbreak brief */}
        <aside className="rounded-md border border-border bg-card">
          <header className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">疫情简报</h2>
          </header>
          <div className="space-y-3 px-5 py-4 text-sm">
            <p className="text-foreground leading-relaxed">{OUTBREAK.summary}</p>
            <dl className="grid grid-cols-2 gap-2 pt-3 text-xs border-t border-border">
              <div>
                <dt className="text-muted-foreground">起始</dt>
                <dd className="font-medium text-foreground">{OUTBREAK.startDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">快照时间</dt>
                <dd className="font-medium text-foreground">{OUTBREAK.snapshotDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">病原</dt>
                <dd className="font-medium text-foreground">{OUTBREAK.pathogen}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">受累区域</dt>
                <dd className="font-medium text-foreground">{OUTBREAK.region}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Triggers */}
      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">风险升级触发条件</h2>
          <span className="text-xs text-muted-foreground">
            已触发 {TRIGGERS.filter((t) => t.triggered).length} / {TRIGGERS.length}
          </span>
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
                <div className="text-sm text-foreground">{t.text}</div>
                <div className="text-xs text-muted-foreground">{t.note}</div>
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

      {/* Recent events */}
      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">最近事件流</h2>
          <Link to="/announcements" className="inline-flex items-center text-xs text-primary hover:underline">
            查看全部公告 <ChevronRight className="h-3 w-3" />
          </Link>
        </header>
        <ul className="divide-y divide-border">
          {recentEvents.map((e) => (
            <li key={e.id} className="flex items-start gap-4 px-5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-28 shrink-0">
                <Clock className="h-3 w-3" />
                {e.date}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{e.title}</div>
                <div className="text-xs text-muted-foreground">
                  {e.agency} · {e.country} · {e.category}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
