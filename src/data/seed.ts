// Seed data for the epidemic monitoring platform.
// Based on the 2026-05-30 Bundibugyo ebolavirus outbreak (DRC/Uganda).

export const OUTBREAK = {
  pathogen: "Bundibugyo ebolavirus",
  shortName: "BDBV / Ebola",
  region: "DRC / Uganda",
  startDate: "2026-04-12",
  snapshotDate: "2026-05-30",
  summary:
    "刚果（金）东北部于4月中旬出现Bundibugyo型埃博拉疫情，5月扩散至乌干达西部边境。无获批疫苗与治疗药物，WHO于5月28日召开专家会议讨论临床试验优先级。",
} as const;

export type RiskLevel = "low" | "medium" | "high";

export const GLOBAL_RISK: RiskLevel = "medium";

export const KPIS = [
  { label: "确诊病例", value: 142, unit: "例", deltaWeek: +18, source: "WHO DON 2026-05-29" },
  { label: "确诊死亡", value: 20, unit: "例", deltaWeek: +4, source: "WHO DON 2026-05-29" },
  { label: "病死率 (CFR)", value: 14.1, unit: "%", deltaWeek: +1.2, source: "估算 (确诊)" },
  { label: "受影响国家", value: 2, unit: "国", deltaWeek: +1, source: "DRC, Uganda" },
] as const;

// Four-dimension risk matrix per section 5.5
export const RISK_DIMENSIONS: Array<{
  key: string;
  name: string;
  level: RiskLevel;
  indicators: string;
  highSignal: string;
  currentState: string;
}> = [
  {
    key: "severity",
    name: "疫情严重度",
    level: "high",
    indicators: "确诊数、死亡数、CFR、医护人员感染比例",
    highSignal: "CFR > 25%；医护人员感染 > 10 例；周增长率 > 50%",
    currentState: "确诊CFR 14%，疑似CFR约25%；已报告4名医护人员感染；周增长约15%",
  },
  {
    key: "spread",
    name: "地理扩散度",
    level: "medium",
    indicators: "受影响国家数、新增省份/卫生区数、城市传播证据",
    highSignal: "首次出现首都病例；新增受影响国家；跨洲传播",
    currentState: "扩散至乌干达9例；乌干达已关闭边境；目前无第三国报告",
  },
  {
    key: "border",
    name: "边境管控力度",
    level: "low",
    indicators: "实施入境限制的国家数；关键中转枢纽筛查政策",
    highSignal: "新加坡/迪拜/多哈/亚的斯亚贝巴等枢纽加强管控；WHO IHR临时建议升级",
    currentState: "美、加、巴哈马、约旦、巴林已实施限制；中转枢纽尚未对中转旅客限流",
  },
  {
    key: "mcm",
    name: "对策可用性",
    level: "high",
    indicators: "获批疫苗/药物数量、临床试验阶段、全球储备量",
    highSignal: "零获批疫苗；临床试验距完成 > 6个月；全球储备 < 1万剂",
    currentState: "Bundibugyo型无获批疫苗与药物；WHO 5月28日启动临床试验优先级讨论",
  },
];

export const TRIGGERS = [
  { id: 1, text: "疫情扩散至新国家（尤其东非、南非）", triggered: true, note: "已扩散至乌干达 (2026-05-15)" },
  { id: 2, text: "任一国家确诊/死亡周增长率超过 100%", triggered: false, note: "当前最高约 35% (乌干达)" },
  { id: 3, text: "中国赴非主要中转枢纽实施入境限制", triggered: false, note: "迪拜/多哈/亚的斯亚贝巴维持常态" },
  { id: 4, text: "WHO 宣布 PHEIC 或升级风险等级", triggered: false, note: "IHR 紧急委员会未召开" },
  { id: 5, text: "出现输入性病例至非疫区亚洲国家", triggered: false, note: "无报告" },
];

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

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "who-don-20260529",
    date: "2026-05-29",
    country: "全球",
    region: "全球",
    agency: "WHO",
    category: "疫情通报",
    title: "Disease Outbreak News: Ebola virus disease – DRC & Uganda (Update 4)",
    summary: "WHO 报告刚果（金）累计确诊 133 例，死亡 19 例；乌干达确诊 9 例，死亡 1 例。区域风险评估为高，全球风险为低。",
    url: "https://www.who.int/emergencies/disease-outbreak-news",
    severity: "advisory",
  },
  {
    id: "who-ihr-20260528",
    date: "2026-05-28",
    country: "全球",
    region: "全球",
    agency: "WHO IHR Secretariat",
    category: "PHEIC/IHR",
    title: "WHO 召开专家会议讨论 Bundibugyo 型临床试验优先级",
    summary: "未触发 PHEIC 程序；建议加快候选疫苗（rVSV-BDBV、MVA-BN-Filo）的Ⅱ期试验部署。",
    severity: "advisory",
  },
  {
    id: "drc-moh-20260529",
    date: "2026-05-29",
    country: "刚果（金）",
    region: "非洲",
    agency: "卫生部",
    category: "疫情通报",
    title: "Ituri 与 North Kivu 卫生区每日疫情通报",
    summary: "新增确诊 12 例，死亡 2 例；接触者追踪覆盖率 78%；4 名医护人员感染住院。",
    severity: "advisory",
  },
  {
    id: "ug-moh-20260527",
    date: "2026-05-27",
    country: "乌干达",
    region: "非洲",
    agency: "卫生部",
    category: "入境限制",
    title: "关闭与刚果（金）陆路边境，启用 4 个卫生检查通道",
    summary: "暂停 Mpondwe、Bunagana 等 6 个非正式过境点；货物经卫生检查通道放行。",
    severity: "action",
  },
  {
    id: "africa-cdc-20260528",
    date: "2026-05-28",
    country: "非洲联盟",
    region: "非洲",
    agency: "Africa CDC",
    category: "应对部署",
    title: "向 DRC 与 Uganda 部署快速反应小组并发布大陆级风险评估",
    summary: "派遣 35 名流行病学家与实验室专家；将大陆风险等级评定为 Grade 2。",
    severity: "action",
  },
  {
    id: "us-cdc-20260526",
    date: "2026-05-26",
    country: "美国",
    region: "北美",
    agency: "US CDC",
    category: "旅行建议",
    title: "Travel Health Notice Level 3：避免前往刚果（金）东北部与乌干达西部",
    summary: "升级至 Level 3 (Reconsider Nonessential Travel)；机场对来自疫区旅客启动主动筛查。",
    url: "https://wwwnc.cdc.gov/travel/notices",
    severity: "action",
  },
  {
    id: "ca-phac-20260526",
    date: "2026-05-26",
    country: "加拿大",
    region: "北美",
    agency: "PHAC",
    category: "入境限制",
    title: "限制非加拿大公民自疫区出发或过境的入境",
    summary: "对过去 21 天内到访过 DRC 东北部与乌干达西部的非公民暂停发放访客签证。",
    severity: "action",
  },
  {
    id: "bs-moh-20260525",
    date: "2026-05-25",
    country: "巴哈马",
    region: "北美",
    agency: "卫生部",
    category: "入境限制",
    title: "对疫区出发旅客暂停免签入境",
    summary: "所有过去 21 天内到访 DRC/Uganda 的旅客须申请特别许可方可入境。",
    severity: "action",
  },
  {
    id: "jo-moh-20260524",
    date: "2026-05-24",
    country: "约旦",
    region: "中东",
    agency: "卫生部",
    category: "入境限制",
    title: "暂停来自 DRC、Uganda 的非公民入境",
    summary: "对所有疫区返回公民实施 21 天健康监测。",
    severity: "action",
  },
  {
    id: "bh-moh-20260524",
    date: "2026-05-24",
    country: "巴林",
    region: "中东",
    agency: "卫生部",
    category: "入境限制",
    title: "对疫区旅客实施入境限制及强制健康申报",
    summary: "海湾合作委员会成员国正在协调统一应对措施。",
    severity: "action",
  },
  {
    id: "ae-mohap-20260527",
    date: "2026-05-27",
    country: "阿联酋",
    region: "中东",
    agency: "MoHAP",
    category: "增强筛查",
    title: "迪拜国际机场对来自疫区中转旅客启用体温与症状筛查",
    summary: "未限制中转，但加强健康申报与体温监测；为中国赴非中转主要枢纽。",
    severity: "advisory",
  },
  {
    id: "qa-moph-20260527",
    date: "2026-05-27",
    country: "卡塔尔",
    region: "中东",
    agency: "MoPH",
    category: "增强筛查",
    title: "多哈机场对疫区航线启用健康申报与体温筛查",
    summary: "中转旅客需填写健康申报表；未限流。",
    severity: "info",
  },
  {
    id: "ecdc-20260528",
    date: "2026-05-28",
    country: "欧盟",
    region: "欧洲",
    agency: "ECDC",
    category: "旅行建议",
    title: "Rapid Risk Assessment：对欧盟整体输入风险评定为低",
    summary: "建议成员国维持现行入境政策并加强港口卫生官员培训。",
    severity: "info",
  },
  {
    id: "uk-ukhsa-20260528",
    date: "2026-05-28",
    country: "英国",
    region: "欧洲",
    agency: "UKHSA",
    category: "旅行建议",
    title: "对前往 DRC 东北部旅行建议升至避免非必要旅行",
    summary: "英国边境管理局未实施入境限制；希思罗机场加强症状监测。",
    severity: "advisory",
  },
  {
    id: "fr-spf-20260527",
    date: "2026-05-27",
    country: "法国",
    region: "欧洲",
    agency: "Santé publique France",
    category: "旅行建议",
    title: "对海外领土马约特发布加强监测预警",
    summary: "重点关注经东非中转抵达马约特的旅客。",
    severity: "advisory",
  },
  {
    id: "jp-mhlw-20260527",
    date: "2026-05-27",
    country: "日本",
    region: "亚洲",
    agency: "厚生劳动省",
    category: "增强筛查",
    title: "成田/羽田机场对疫区航线启用入境检疫",
    summary: "未限制入境；对 21 天内到访疫区者开展健康追踪。",
    severity: "advisory",
  },
  {
    id: "kr-kdca-20260526",
    date: "2026-05-26",
    country: "韩国",
    region: "亚洲",
    agency: "KDCA",
    category: "增强筛查",
    title: "仁川机场对疫区返回旅客启动健康申报",
    summary: "维持入境，未限流。",
    severity: "info",
  },
  {
    id: "sg-moh-20260527",
    date: "2026-05-27",
    country: "新加坡",
    region: "亚洲",
    agency: "MOH",
    category: "增强筛查",
    title: "樟宜机场对疫区中转旅客启用症状监测",
    summary: "中国赴非中转关键枢纽；未限流，加强热成像筛查与申报。",
    severity: "advisory",
  },
  {
    id: "cn-customs-20260520",
    date: "2026-05-20",
    country: "中国",
    region: "亚洲",
    agency: "海关总署",
    category: "海关公告",
    title: "2026 年第 65 号公告：防止 Bundibugyo 型埃博拉传入我国",
    summary: "要求来自 DRC、Uganda 的人员主动健康申报；对有症状者实施医学排查；加强口岸卫生检疫。",
    severity: "action",
  },
  {
    id: "in-mohfw-20260526",
    date: "2026-05-26",
    country: "印度",
    region: "亚洲",
    agency: "MoHFW",
    category: "增强筛查",
    title: "对疫区返回旅客启用机场症状筛查",
    summary: "孟买、德里、班加罗尔机场启用；未限流。",
    severity: "info",
  },
  {
    id: "rw-moh-20260525",
    date: "2026-05-25",
    country: "卢旺达",
    region: "非洲",
    agency: "卫生部",
    category: "增强筛查",
    title: "西部边境启用 11 个卫生检查点并部署应急团队",
    summary: "尚无确诊病例；与 DRC 边境加强联防。",
    severity: "action",
  },
  {
    id: "ke-moh-20260526",
    date: "2026-05-26",
    country: "肯尼亚",
    region: "非洲",
    agency: "卫生部",
    category: "增强筛查",
    title: "Jomo Kenyatta 机场启用埃博拉筛查协议",
    summary: "重点监测来自 Entebbe 与 Goma 的航班。",
    severity: "advisory",
  },
];

// Border / travel measures (subset of announcements, structured for the dedicated page)
export type BorderMeasure = {
  country: string;
  region: "非洲" | "北美" | "欧洲