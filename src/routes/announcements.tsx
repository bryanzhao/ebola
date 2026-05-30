import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, Filter, Megaphone, Globe } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ANNOUNCEMENTS, type Announcement } from "@/data/seed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "公告汇总 · 国家疫情监测平台" },
      { name: "description", content: "WHO 与各国 CDC、卫生部、海关、外交部门的公开公告与措施汇总时间线。" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(announcementsQueryOptions),
  component: AnnouncementsPage,
});

// Combine seed announcements with live WHO DON feed
type WhoDon = {
  ok: boolean;
  fetchedAt?: string;
  items: Array<{ title: string; link: string; pubDate: string; description: string }>;
  error?: string;
};

const announcementsQueryOptions = queryOptions({
  queryKey: ["seed-announcements"],
  queryFn: () => Promise.resolve(ANNOUNCEMENTS),
  staleTime: Infinity,
});

const whoDonQueryOptions = queryOptions({
  queryKey: ["who-don"],
  queryFn: async (): Promise<WhoDon> => {
    const res = await fetch("/api/who-don");
    if (!res.ok) return { ok: false, items: [], error: `HTTP ${res.status}` };
    return (await res.json()) as WhoDon;
  },
  staleTime: 1000 * 60 * 5,
});

const REGIONS = ["全部", "全球", "非洲", "北美", "欧洲", "亚洲", "中东"] as const;
const CATEGORIES = ["全部", "疫情通报", "入境限制", "增强筛查", "旅行建议", "海关公告", "应对部署", "PHEIC/IHR"] as const;

function SeverityDot({ s }: { s: Announcement["severity"] }) {
  const color = s === "action" ? "bg-destructive" : s === "advisory" ? "bg-warning" : "bg-primary";
  return <span className={cn("inline-block h-2 w-2 rounded-full", color)} />;
}

function AnnouncementsPage() {
  const { data: seed } = useSuspenseQuery(announcementsQueryOptions);
  const { data: don } = useQuery(whoDonQueryOptions);
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("全部");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("全部");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return seed.filter((a) => {
      if (region !== "全部" && a.region !== region) return false;
      if (category !== "全部" && a.category !== category) return false;
      if (q && !`${a.title} ${a.country} ${a.agency} ${a.summary}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [seed, region, category, q]);

  const counts = {
    total: seed.length,
    action: seed.filter((a) => a.severity === "action").length,
    countries: new Set(seed.map((a) => a.country)).size,
    last7d: seed.filter((a) => Date.parse(a.date) >= Date.parse("2026-05-23")).length,
  };

  return (
    <PageShell
      eyebrow="ANNOUNCEMENTS"
      title="各国公告与措施汇总"
      description="汇总 WHO、各国 CDC / 卫生部 / 海关 / 外交部门的公开公告，支持按区域、类型与关键词过滤。"
    >
      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="公告总数" value={counts.total} />
        <Stat label="行动级公告" value={counts.action} tone="bad" />
        <Stat label="覆盖国家/组织" value={counts.countries} />
        <Stat label="近 7 日公告" value={counts.last7d} />
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> 区域
          </div>
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={cn(
                "rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                region === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Megaphone className="h-3.5 w-3.5" /> 类型
          </div>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索国家、机构、关键词..."
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Timeline */}
      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">公告时间线</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} 条结果</span>
        </header>
        <ol className="divide-y divide-border">
          {filtered.map((a) => (
            <li key={a.id} className="grid grid-cols-[7rem_auto_1fr] items-start gap-4 px-5 py-4">
              <div className="text-xs text-muted-foreground">
                <div className="font-mono text-foreground">{a.date}</div>
                <div className="mt-0.5">{a.region}</div>
              </div>
              <div className="flex flex-col items-center pt-1">
                <SeverityDot s={a.severity} />
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">{a.country}</span>
                  <span className="text-xs text-muted-foreground">· {a.agency}</span>
                  <span className="ml-auto rounded-sm border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {a.category}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-semibold text-foreground">{a.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.summary}</p>
                {a.url && (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    原文链接 <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-muted-foreground">无匹配公告</li>
          )}
        </ol>
      </section>

      {/* Live WHO DON feed */}
      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              <Globe className="inline h-3.5 w-3.5 mr-1" />
              WHO Disease Outbreak News · 实时摘要
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">通过服务端代理实时拉取 WHO DON RSS</p>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {don?.fetchedAt ? `拉取时间 ${new Date(don.fetchedAt).toLocaleString()}` : ""}
          </span>
        </header>
        {don && don.ok && don.items.length > 0 ? (
          <ul className="divide-y divide-border">
            {don.items.slice(0, 6).map((it) => (
              <li key={it.link} className="px-5 py-3">
                <a href={it.link} target="_blank" rel="noreferrer noopener" className="text-sm font-medium text-foreground hover:text-primary">
                  {it.title}
                </a>
                <div className="text-xs text-muted-foreground">{it.pubDate}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-6 text-xs text-muted-foreground">
            {don?.error ? `暂时无法获取 WHO 实时数据 (${don.error})` : "正在拉取..."}
          </div>
        )}
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