import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import {
  ANNOUNCEMENTS,
  BORDER_MEASURES,
  COUNTRY_DAILY,
  COUNTRY_OVERVIEW,
  GLOBAL_RISK,
  INFO_SOURCES,
  OUTBREAK,
  TRIGGERS,
  type Announcement,
  type BorderMeasure,
  type CountryDaily,
} from "@/data/seed";

export const Route = createFileRoute("/daily-brief")({
  head: () => ({
    meta: [
      { title: "每日简报 · 国家疫情监测平台" },
      { name: "description", content: "过去 24 小时疫情动态与当前情况概览的标准化每日简报。" },
    ],
  }),
  component: DailyBriefPage,
});

// ------------------------------------------------------------------
// 数据派生：以 OUTBREAK.snapshotDate 为基准，自动生成"过去 24 小时"内容
// ------------------------------------------------------------------

const SNAPSHOT = OUTBREAK.snapshotDate;

function shiftDate(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const YESTERDAY = shiftDate(SNAPSHOT, -1);

function within24h(iso: string) {
  return iso >= YESTERDAY && iso <= SNAPSHOT;
}

// 期号：以疫情起始日起算的第 N 天
function issueNumber() {
  const start = new Date(OUTBREAK.startDate + "T00:00:00Z").getTime();
  const now = new Date(SNAPSHOT + "T00:00:00Z").getTime();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
}

// 各国 24h 变化（取 snapshotDate 的行）
function dailyByCountry(): Array<CountryDaily & { prevCum: number }> {
  return COUNTRY_OVERVIEW.map((row) => {
    const series = COUNTRY_DAILY.filter((r) => r.country === row.country).sort((a, b) => a.date.localeCompare(b.date));
    const idx = series.findIndex((r) => r.date === row.date);
    const prev = idx > 0 ? series[idx - 1] : undefined;
    return { ...row, prevCum: prev?.cumCases ?? 0 };
  });
}

function sumNewCases(rows: CountryDaily[]) {
  return rows.reduce((s, r) => s + r.newCases, 0);
}
function sumNewDeaths(rows: CountryDaily[]) {
  return rows.reduce((s, r) => s + r.newDeaths, 0);
}

// ------------------------------------------------------------------

function DailyBriefPage() {
  const latestRows = dailyByCountry();
  const totalCum = latestRows.reduce((s, r) => s + r.cumCases, 0);
  const totalDeaths = latestRows.reduce((s, r) => s + r.cumDeaths, 0);
  const totalNewCases = sumNewCases(latestRows);
  const totalNewDeaths = sumNewDeaths(latestRows);
  const cfr = totalCum === 0 ? 0 : Math.round((totalDeaths / totalCum) * 1000) / 10;

  const recent24h: Announcement[] = ANNOUNCEMENTS.filter((a) => within24h(a.date)).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const recentBorder: BorderMeasure[] = BORDER_MEASURES.filter((m) => within24h(m.effectiveDate));
  const triggered = TRIGGERS.filter((t) => t.triggered);

  const summary =
    `截至 ${SNAPSHOT}，本轮 ${OUTBREAK.pathogen} 疫情累计报告确诊 ${totalCum} 例（24h 新增 ${totalNewCases}）、` +
    `死亡 ${totalDeaths} 例（24h 新增 ${totalNewDeaths}），综合病死率约 ${cfr}%，` +
    `波及 ${latestRows.length} 国（${latestRows.map((r) => r.country).join("、")}）。` +
    `过去 24 小时收录权威公告 ${recent24h.length} 项，其中涉及边境与旅行措施调整 ${recentBorder.length} 项。` +
    `全球综合风险等级研判为 ${GLOBAL_RISK === "high" ? "高" : GLOBAL_RISK === "medium" ? "中" : "低"}` +
    `${triggered.length > 0 ? `，已触发 ${triggered.length} 项升级条件。` : "，尚未触发升级条件。"}`;

  const issue = issueNumber();
  const tier1Sources = INFO_SOURCES.filter((s) => s.tier === 1);

  return (
    <>
      {/* 屏幕端的顶部工具条（打印时隐藏） */}
      <div className="print:hidden border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-[820px] items-center justify-between px-6 py-3">
          <div className="text-xs text-muted-foreground">
            该页面为标准化每日简报模板，内容由平台数据自动生成。
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            <Printer className="h-3.5 w-3.5" />
            打印 / 导出 PDF
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[820px] bg-background px-10 py-10 text-foreground print:max-w-none print:px-0 print:py-0">
        {/* ============ 报头 ============ */}
        <header className="border-b-2 border-primary pb-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>内部参考 · 仅供分析使用</span>
            <span>第 {issue} 期</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary">
            {OUTBREAK.pathogen} 疫情每日简报
          </h1>
          <div className="mt-1 text-sm text-muted-foreground">
            报告日期：{SNAPSHOT} · 数据截止：{SNAPSHOT} 12:00 UTC · 监测区域：{OUTBREAK.region}
          </div>
        </header>

        {/* ============ 一、摘要 ============ */}
        <Section index="一" title="摘要">
          <p className="text-[13.5px] leading-7 text-foreground">{summary}</p>
        </Section>

        {/* ============ 二、关键指标（24h） ============ */}
        <Section index="二" title="关键指标（过去 24 小时 / 累计）">
          <div className="grid grid-cols-4 gap-3">
            <KeyStat label="累计确诊" value={totalCum} unit="例" delta={totalNewCases} deltaSuffix="（24h）" />
            <KeyStat label="累计死亡" value={totalDeaths} unit="例" delta={totalNewDeaths} deltaSuffix="（24h）" />
            <KeyStat label="综合 CFR" value={cfr} unit="%" />
            <KeyStat label="受影响国家" value={latestRows.length} unit="国" />
          </div>
        </Section>

        {/* ============ 三、各国疫情 ============ */}
        <Section index="三" title="各国疫情情况">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-muted-foreground">
                <Th>国家</Th>
                <Th>报告日期</Th>
                <Th align="right">累计确诊</Th>
                <Th align="right">24h 新增</Th>
                <Th align="right">累计死亡</Th>
                <Th align="right">24h 死亡</Th>
                <Th align="right">CFR</Th>
              </tr>
            </thead>
            <tbody>
              {latestRows.map((r) => (
                <tr key={r.country} className="border-b border-border/60">
                  <td className="py-2 pr-2 font-medium">{r.country}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{r.date}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{r.cumCases}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-destructive">+{r.newCases}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{r.cumDeaths}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-destructive">+{r.newDeaths}</td>
                  <td className="py-2 text-right tabular-nums">{r.cfr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[12.5px] leading-6 text-muted-foreground">
            数据来源：WHO Disease Outbreak News、刚果（金）卫生部、乌干达卫生部每日通报。
          </p>
        </Section>

        {/* ============ 四、过去 24 小时重要公告 ============ */}
        <Section index="四" title={`过去 24 小时重要公告（共 ${recent24h.length} 项）`}>
          {recent24h.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground">过去 24 小时未收录新增权威公告。</p>
          ) : (
            <ol className="space-y-3">
              {recent24h.map((a) => (
                <li key={a.id} className="border-l-2 border-primary/70 pl-3">
                  <div className="flex flex-wrap items-baseline gap-x-2 text-[11px] text-muted-foreground">
                    <span className="tabular-nums">{a.date}</span>
                    <span>·</span>
                    <span className="font-medium text-foreground">{a.country}</span>
                    <span>·</span>
                    <span>{a.agency}</span>
                    <span className="ml-auto rounded-sm bg-secondary px-1.5 py-0.5 text-[10px]">{a.category}</span>
                  </div>
                  <div className="mt-0.5 text-[13px] font-medium text-foreground">{a.title}</div>
                  <div className="mt-0.5 text-[12.5px] leading-6 text-muted-foreground">{a.summary}</div>
                </li>
              ))}
            </ol>
          )}
        </Section>

        {/* ============ 五、边境与旅行措施变化 ============ */}
        <Section index="五" title={`边境与旅行措施变化（24h 新增 ${recentBorder.length} 项）`}>
          {recentBorder.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground">过去 24 小时无新增或调整的边境/旅行措施。</p>
          ) : (
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-left text-muted-foreground">
                  <Th>国家</Th>
                  <Th>措施</Th>
                  <Th>状态</Th>
                  <Th>生效</Th>
                  <Th>详情</Th>
                </tr>
              </thead>
              <tbody>
                {recentBorder.map((m) => (
                  <tr key={m.country + m.effectiveDate} className="border-b border-border/60">
                    <td className="py-2 pr-2 font-medium">{m.country}</td>
                    <td className="py-2 pr-2">{m.measure}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{m.status}</td>
                    <td className="py-2 pr-2 tabular-nums text-muted-foreground">{m.effectiveDate}</td>
                    <td className="py-2 text-muted-foreground">{m.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* ============ 六、风险研判结论 ============ */}
        <Section index="六" title="风险研判结论">
          <p className="text-[13px] leading-7">
            综合疫情严重度、地理扩散、边境管控与对策可用性四个维度评估，当前全球综合输入性风险等级为
            <strong className="mx-1 text-primary">
              {GLOBAL_RISK === "high" ? "高" : GLOBAL_RISK === "medium" ? "中" : "低"}
            </strong>
            。
          </p>
          <div className="mt-3 text-[12.5px]">
            <div className="mb-1 font-medium">升级触发条件检查：</div>
            <ul className="space-y-1">
              {TRIGGERS.map((t) => (
                <li key={t.id} className="flex items-baseline gap-2 leading-6">
                  <span className={`shrink-0 whitespace-nowrap ${t.triggered ? "text-destructive" : "text-success"}`}>
                    {t.triggered ? "● 已触发" : "○ 未触发"}
                  </span>
                  <span className="min-w-0"><span className="text-foreground">{t.text}</span>{" "}<span className="text-muted-foreground">— {t.note}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ============ 七、信息来源 ============ */}
        <Section index="七" title="信息来源与免责声明">
          <div className="text-[12px] leading-6 text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">Tier 1 核心来源（最新更新时间）：</div>
            <ul className="grid grid-cols-2 gap-x-4">
              {tier1Sources.map((s) => (
                <li key={s.name}>
                  · {s.name} <span className="tabular-nums">— {s.lastUpdate}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              本简报由国家疫情监测平台基于公开权威信息源自动汇编，不代表官方立场；数据如有差异以原始来源为准。
            </p>
          </div>
        </Section>

        {/* ============ 落款 ============ */}
        <footer className="mt-8 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>编制：国家疫情监测平台 · Epidemic Intelligence Unit</span>
            <span>第 {issue} 期 · {SNAPSHOT}</span>
          </div>
        </footer>
      </main>
    </>
  );
}

// ------------------------------------------------------------------
// 子组件
// ------------------------------------------------------------------

function Section({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 break-inside-avoid">
      <h2 className="mb-2 border-b border-border pb-1 text-[15px] font-semibold text-foreground">
        <span className="mr-2 text-primary">{index}、</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`py-1.5 px-2 text-[11px] font-medium uppercase tracking-wider ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function KeyStat({
  label,
  value,
  unit,
  delta,
  deltaSuffix,
}: {
  label: string;
  value: number;
  unit: string;
  delta?: number;
  deltaSuffix?: string;
}) {
  return (
    <div className="rounded-sm border border-border bg-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-semibold tabular-nums text-foreground">{value}</span>
        <span className="text-[11px] text-muted-foreground">{unit}</span>
      </div>
      {typeof delta === "number" && (
        <div className={`mt-0.5 text-[11px] tabular-nums ${delta > 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {delta > 0 ? `+${delta}` : delta}
          {deltaSuffix}
        </div>
      )}
    </div>
  );
}