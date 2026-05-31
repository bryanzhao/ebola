import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { COUNTRY_DAILY, FOCUS_COUNTRIES, type CountryDaily } from "@/data/seed";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/epidemic-data")({
  head: () => ({
    meta: [
      { title: "疫情数据 · 国家疫情监测平台" },
      { name: "description", content: "按国家与日期查看疫情累计与新增数据。" },
    ],
  }),
  component: EpidemicDataPage,
});

type SortKey = "country" | "date" | "cumCases" | "newCases" | "cumDeaths" | "newDeaths" | "cfr";
type SortDir = "asc" | "desc";

function EpidemicDataPage() {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo(() => {
    const data = [...COUNTRY_DAILY];
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [sortKey, sortDir]);

  const toggle = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "country" ? "asc" : "desc");
    }
  };

  return (
    <PageShell
      eyebrow="EPIDEMIC DATA"
      title="疫情数据"
      description="每日各国疫情数据快照，可按国家或时间排序；下方提供重点国家概览。"
    >
      {/* Focus countries */}
      <div className="grid gap-4 md:grid-cols-2">
        {FOCUS_COUNTRIES.map((country) => {
          const series = COUNTRY_DAILY.filter((r) => r.country === country).sort((a, b) =>
            a.date.localeCompare(b.date),
          );
          const latest = series[series.length - 1];
          const first = series[0];
          if (!latest) return null;
          return (
            <section key={country} className="rounded-md border border-border bg-card">
              <header className="flex items-center justify-between border-b border-border px-5 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  重点国家 · {country}
                </h2>
                <span className="text-xs text-muted-foreground">截至 {latest.date}</span>
              </header>
              <div className="grid grid-cols-3 divide-x divide-border">
                <Stat label="累计确诊" value={latest.cumCases} unit="例" />
                <Stat label="累计死亡" value={latest.cumDeaths} unit="例" />
                <Stat label="病死率" value={`${latest.cfr}`} unit="%" />
              </div>
              <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                首例报告 {first.date} · 监测周期 {series.length} 个数据点
              </div>
            </section>
          );
        })}
      </div>

      {/* Daily table */}
      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">每日数据明细</h2>
          <span className="text-xs text-muted-foreground">{rows.length} 条记录</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th label="国家" k="country" sortKey={sortKey} sortDir={sortDir} onClick={toggle} />
                <Th label="日期" k="date" sortKey={sortKey} sortDir={sortDir} onClick={toggle} />
                <Th label="累计确诊" k="cumCases" sortKey={sortKey} sortDir={sortDir} onClick={toggle} align="right" />
                <Th label="新增确诊" k="newCases" sortKey={sortKey} sortDir={sortDir} onClick={toggle} align="right" />
                <Th label="累计死亡" k="cumDeaths" sortKey={sortKey} sortDir={sortDir} onClick={toggle} align="right" />
                <Th label="新增死亡" k="newDeaths" sortKey={sortKey} sortDir={sortDir} onClick={toggle} align="right" />
                <Th label="CFR" k="cfr" sortKey={sortKey} sortDir={sortDir} onClick={toggle} align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={`${r.country}-${r.date}`} className="hover:bg-surface">
                  <td className="px-4 py-2 font-medium text-foreground">{r.country}</td>
                  <td className="px-4 py-2 text-muted-foreground tabular-nums">{r.date}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.cumCases}</td>
                  <td className={cn("px-4 py-2 text-right tabular-nums", r.newCases > 0 && "text-destructive")}>
                    {r.newCases > 0 ? `+${r.newCases}` : r.newCases}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.cumDeaths}</td>
                  <td className={cn("px-4 py-2 text-right tabular-nums", r.newDeaths > 0 && "text-destructive")}>
                    {r.newDeaths > 0 ? `+${r.newDeaths}` : r.newDeaths}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.cfr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-foreground tabular-nums">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

function Th({
  label,
  k,
  sortKey,
  sortDir,
  onClick,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onClick: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === k;
  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-4 py-2", align === "right" ? "text-right" : "text-left")}>
      <button
        type="button"
        onClick={() => onClick(k)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          active && "text-primary",
          align === "right" && "flex-row-reverse",
        )}
      >
        <Icon className="h-3 w-3" />
        {label}
      </button>
    </th>
  );
}

export type _CountryDaily = CountryDaily;