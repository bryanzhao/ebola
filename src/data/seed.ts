// 数据仅从 src/data/dataset.json 加载。请勿在此文件写入内容值。
// 修改 dataset.json 后，Vite 会自动 HMR 刷新页面。
import dataset from "./dataset.json";

export type RiskLevel = "low" | "medium" | "high";

export const OUTBREAK = dataset.outbreak as {
  pathogen: string;
  shortName: string;
  region: string;
  startDate: string;
  snapshotDate: string;
  summary: string;
};

export const GLOBAL_RISK = dataset.globalRisk as RiskLevel;

export const KPIS = dataset.kpis as ReadonlyArray<{
  label: string;
  value: number;
  unit: string;
  deltaWeek: number;
  source: string;
}>;

export const RISK_DIMENSIONS: Array<{
  key: string;
  name: string;
  level: RiskLevel;
  indicators: string;
  highSignal: string;
  currentState: string;
}> = dataset.riskDimensions as any;

export const TRIGGERS = dataset.triggers as Array<{
  id: number;
  text: string;
  triggered: boolean;
  note: string;
}>;

// Announcements: WHO + national CDC / health ministries / customs / foreign ministries
export type Announcement = {
  id: string;
  date: string;       // ISO
  country: string;    // 国家/组织
  region: "全球" | "非洲" | "北美" | "欧洲" | "亚洲" | "中东" | "大洋洲";
  agency: string;
  category: "疫情通报" | "入境限制" | "增强筛查" | "旅行建议" | "海关公告" | "应对部署" | "PHEIC/IHR";
  title: string;
  summary: string;
  url?: string;
  severity: "info" | "advisory" | "action";
};

export const ANNOUNCEMENTS: Announcement[] = dataset.announcements as Announcement[];

// Border / travel measures (subset of announcements, structured for the dedicated page)
export type BorderMeasure = {
  country: string;
  region: "非洲" | "北美" | "欧洲" | "亚洲" | "中东";
  measure: "入境禁令" | "增强筛查" | "航班暂停" | "健康申报";
  status: "已实施" | "关注中" | "已解除";
  effectiveDate: string;
  detail: string;
  source: string;
};

export const BORDER_MEASURES: BorderMeasure[] = dataset.borderMeasures as BorderMeasure[];

// Information sources — 3-tier model
export type SourceTier = 1 | 2 | 3;
export type SourceStatus = "正常" | "延迟" | "失败";

export type InfoSource = {
  name: string;
  category: string;
  tier: SourceTier;
  frequency: string;
  lastUpdate: string;
  status: SourceStatus;
  url?: string;
};

export const INFO_SOURCES: InfoSource[] = dataset.infoSources as InfoSource[];

export const HUB_STATUS = dataset.hubStatus as Array<{
  hub: string;
  code: string;
  status: string;
  level: RiskLevel;
}>;

// ============================================================
// 各国每日疫情数据 (weekly snapshots since outbreak start)
// ============================================================
export type CountryDaily = {
  country: string;
  iso: string;
  date: string;          // ISO date
  cumCases: number;
  newCases: number;
  cumDeaths: number;
  newDeaths: number;
  cfr: number;           // %
};

// 从 dataset.json 读取累计值，派生 newCases / newDeaths / cfr
type RawCountryDaily = { country: string; iso: string; date: string; cumCases: number; cumDeaths: number };
function cfrPct(d: number, c: number) {
  return c === 0 ? 0 : Math.round((d / c) * 1000) / 10;
}
const _raw = (dataset.countryDaily as RawCountryDaily[])
  .slice()
  .sort((a, b) => (a.country === b.country ? a.date.localeCompare(b.date) : a.country.localeCompare(b.country)));
const _prevByCountry: Record<string, RawCountryDaily | undefined> = {};
export const COUNTRY_DAILY: CountryDaily[] = _raw.map((row) => {
  const prev = _prevByCountry[row.country];
  const newCases = row.cumCases - (prev?.cumCases ?? 0);
  const newDeaths = row.cumDeaths - (prev?.cumDeaths ?? 0);
  _prevByCountry[row.country] = row;
  return {
    country: row.country,
    iso: row.iso,
    date: row.date,
    cumCases: row.cumCases,
    cumDeaths: row.cumDeaths,
    newCases,
    newDeaths,
    cfr: cfrPct(row.cumDeaths, row.cumCases),
  };
});

// Latest snapshot per country (for overview tables / cards)
export const COUNTRY_OVERVIEW: CountryDaily[] = Object.values(
  COUNTRY_DAILY.reduce<Record<string, CountryDaily>>((acc, row) => {
    const prev = acc[row.country];
    if (!prev || row.date > prev.date) acc[row.country] = row;
    return acc;
  }, {}),
).sort((a, b) => b.cumCases - a.cumCases);

// 重点国家概览（用于"疫情数据"页顶部卡片）
export const FOCUS_COUNTRIES = dataset.focusCountries as readonly string[];