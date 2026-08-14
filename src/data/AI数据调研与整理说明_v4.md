# 疫情监测平台 · 数据调研与整理工作说明（v4）

本文件是给 AI 调研助手的**完整作业规范**。你的任务是：按下述方法调研公开信息，并产出 5 个可直接替换到平台 `src/data/parts/` 目录的 JSON 文件。
平台前端不会自动抓取任何数据；页面内容完全由这 5 个文件决定。

---

## 0. 交付物清单

| 文件名 | 内容 | 顶层键 |
|---|---|---|
| `outbreak.json` | 疫情基础信息、KPI、四维风险维度、升级触发条件、中转枢纽状态、综合研判结论 | `outbreak` `globalRisk` `kpis` `riskDimensions` `triggers` `hubStatus` `judgment` |
| `epidemic.json` | 各国**每日累计**确诊/死亡序列、重点国家 | `countryDaily` `focusCountries` |
| `announcements.json` | 各国/机构公告与措施时间线 | `announcements` |
| `border-measures.json` | 边境与旅行措施（当前快照 + 逐日日志） | `borderMeasures` `borderMeasuresDaily` |
| `info-sources.json` | 三层信息源清单及巡检状态 | `infoSources` |

硬性要求：
- 严格 UTF-8、标准 JSON（无注释、无尾逗号、无 `NaN`）。
- 所有日期一律 `YYYY-MM-DD`。
- 数值字段必须是数字类型，不能写成字符串（`3282` 而非 `"3282"`）。
- 只允许使用本文件列出的枚举值，写错枚举会导致样式/颜色渲染失败。
- **不要**新增或改名顶层键；不要新增前端未读取的字段。

---

## 1. 调研方法

### 1.1 信息源优先级（冲突时按此顺序取信）
1. **一级（权威原始）**：WHO Disease Outbreak News / WHO AFRO 周报 / IHR 紧急委员会声明；疫区国卫生部（DRC 卫生部、Uganda MoH）官方通报。
2. **二级（机构汇总）**：ECDC Communicable Disease Threats Report、US CDC、Africa CDC、各国卫生部/海关/边检公告、IATA Travel Centre。
3. **三级（补充线索）**：主流通讯社（路透、法新、AP）、ProMED、Airfinity/学术预印本。三级信息只能用于**发现线索**，数值必须回溯到一、二级源核对。

### 1.2 调研流程
1. 确定本次 `snapshotDate`（快照日，通常为调研当日 UTC 日期）。
2. 拉取一级源自上次快照以来的全部更新，逐日记录。
3. 用二级源补齐一级源缺失的日期与国别细节。
4. 交叉核对：确诊/死亡数以最权威且最新的源为准，并在 `source` 字段写明「机构 + 日期」。
5. 逐文件填写，最后执行第 8 节的自检清单。

### 1.3 数据缺失与冲突处理
- **数值缺失某日**：按「结转」原则，沿用前一日累计值（累计数不得下降）。
- **口径修订（回溯下调）**：以官方最新修订为准，直接改写历史该日数值，并在 `outbreak.summary` 里说明一句「X 日官方回溯修订」。
- **多源冲突**：取一级源；若一级源滞后超过 7 天且二级源有明确更新，取二级源并在 `source` 标注两个来源。
- 严禁凭推测编造数字；不确定就结转并在 `summary` 说明。

---

## 2. `outbreak.json`

```json
{
  "outbreak": {
    "pathogen": "Bundibugyo ebolavirus",
    "shortName": "BDBV / Ebola",
    "region": "DRC / Uganda",
    "startDate": "2026-04-12",
    "snapshotDate": "2026-07-28",
    "summary": "150–400 字中文综述：疫情走势、最新累计数、地理范围、对策进展、关键转折事件。"
  },
  "globalRisk": "high",
  "kpis": [
    { "label": "确诊病例", "value": 3282, "unit": "例", "deltaWeek": 789, "source": "ECDC 2026-07-28; WHO DON613" }
  ],
  "riskDimensions": [
    { "key": "severity", "name": "疫情严重度", "level": "high",
      "indicators": "该维度用于判断的观测指标", "highSignal": "达到高风险的量化门槛",
      "currentState": "当前实际情况 + 数据 + 日期" }
  ],
  "triggers": [
    { "id": 1, "text": "升级触发条件描述", "triggered": true, "note": "触发/未触发的证据与日期" }
  ],
  "hubStatus": [
    { "hub": "新加坡 樟宜", "code": "SIN", "status": "增强筛查", "level": "medium" }
  ],
  "judgment": {
    "level": "medium",
    "label": "中等",
    "headline": "一句话总体结论（不超过 80 字）",
    "paragraphs": ["段落1", "段落2", "段落3", "段落4"],
    "escalationPaths": ["升级路径1", "升级路径2"],
    "mitigatingFactors": ["缓解因素1", "缓解因素2"],
    "updatedAt": "2026-07-28"
  }
}
```

规则：
- `globalRisk` / `riskDimensions[].level` / `hubStatus[].level` / `judgment.level` 枚举：`"high" | "medium" | "low"`。
- `judgment.label` 与 `level` 必须对应：high→`"高"`，medium→`"中等"`，low→`"低"`。
- `kpis` 固定 4 项且顺序不变：确诊病例、确诊死亡、病死率 (CFR)、受影响国家。`deltaWeek` 是**近 7 天增量**（CFR 用百分点变化，可为负）。
- `kpis` 的确诊/死亡值必须等于 `epidemic.json` 中各国 `snapshotDate`（或其最近可得日期）累计值之和；CFR = 死亡/确诊×100，保留 1 位小数。
- `riskDimensions` 固定 4 个 `key`：`severity`（疫情严重度）、`spread`（扩散趋势）、`connectivity`（人员流动关联）、`mcm`（对策可用性）。
- `triggers` 的 `id` 从 1 连续编号，`triggered` 为布尔值，`note` 必须给出证据与日期（未触发也要写当前距阈值多远）。
- **`judgment` 必须是综合推理产物，禁止套模板**。写作前先核对：疫情走势与增速、地理扩散与跨境输入信号、对策（疫苗/药物）进展、边境与枢纽管控、WHO 官方定级。`paragraphs` 建议 3–5 段，每段一个主题、含具体数字与日期。`escalationPaths` 写「什么情况发生会调高等级」，`mitigatingFactors` 写「当前压低等级的依据」。`updatedAt` 同 `snapshotDate`。

---

## 3. `epidemic.json`

```json
{
  "countryDaily": [
    { "country": "刚果（金）", "iso": "COD", "date": "2026-04-12", "cumCases": 2, "cumDeaths": 0 }
  ],
  "focusCountries": ["刚果（金）", "乌干达"]
}
```

规则：
- 记录的是**累计值**，新增数、CFR 由前端自动派生，不要自己写。
- **`focusCountries` 列出的每个国家，从其首例日期到 `snapshotDate` 必须每一天都有一条记录，不允许跳日**（无更新则结转前一日数值）。
- 非重点国家（如仅 1 例输入的欧美国家）可只记录发生变化的日期。
- 同一国家同一日期只能有一条记录；累计值单调不减（除官方回溯修订）。
- `iso` 用 ISO 3166-1 alpha-3（COD、UGA、FRA、USA…）。`country` 用中文名，且与 `announcements`/`borderMeasures` 中同一国家的写法完全一致。
- 数组按国家分组、组内按日期升序排列（前端会自行排序，但便于人工校对）。

---

## 4. `announcements.json`

```json
{
  "announcements": [
    { "id": "who-don613-20260728", "date": "2026-07-28", "country": "乌干达", "region": "非洲",
      "agency": "WHO", "category": "疫情通报",
      "title": "不超过 40 字的标题", "summary": "60–200 字要点：宣布了什么、适用对象、生效时间、实际影响",
      "severity": "action", "url": "https://..." }
  ]
}
```

规则：
- `category` 枚举：`疫情通报` `入境限制` `增强筛查` `旅行建议` `海关公告` `应对部署` `PHEIC/IHR`。
- `severity` 枚举：`info`（一般信息）｜`advisory`（建议/提示性）｜`action`（有强制约束力的措施）。
- `id` 全局唯一，建议 `机构-主题-YYYYMMDD`，全小写、只用字母数字和连字符。
- `region` 用大区：`非洲` `亚洲` `欧洲` `北美` `中东` `大洋洲` `南美` `全球`。
- `url` 可选，但强烈建议填一级/二级源原文链接。
- **禁止占位条目**：不得出现「此日无新增信息」之类的记录。某天没有公告就不写该天。
- 尽可能做到逐日全量收集：每天扫描 WHO、疫区国卫生部、主要目的国卫生/海关、ECDC/CDC，凡有实质更新即建一条。同一天多个机构发布应拆成多条。
- 数组按日期排列即可，前端会自动按新→旧展示。

---

## 5. `border-measures.json`

该文件是**逐日日志 + 当日快照**双结构：

```json
{
  "borderMeasures": [
    { "country": "中国", "region": "亚洲", "measure": "健康申报", "status": "已实施",
      "effectiveDate": "2026-05-20", "detail": "措施内容与适用范围", "source": "海关总署" }
  ],
  "borderMeasuresDaily": [
    { "date": "2026-07-28", "type": "change", "summary": "乌干达: 常态运营 (已结束)",
      "changes": [ { "country": "乌干达", "region": "非洲", "newMeasure": "常态运营", "newStatus": "已结束",
                     "detail": "…", "source": "卫生部" } ],
      "activeCountries": 19,
      "snapshot": [ { "country": "…", "region": "…", "measure": "…", "status": "…",
                      "effectiveDate": "…", "detail": "…", "source": "…" } ] }
  ]
}
```

规则：
- `measure` 枚举：`入境禁令` `增强筛查` `健康申报` `旅行建议` `常态运营`。
- `status` 枚举：`已实施` `关注中` `已解除` `已结束`。
- `borderMeasuresDaily` 逐日维护，从疫情起始日到 `snapshotDate` 每天一条：
  - 无变更：`type: "nochange"`，`summary: "此日无新增边境措施变更"`，`changes` 省略或为空数组。
  - 有变更：`type: "change"`，`changes` 列出当日新增/调整的国家措施，`summary` 用「国家: 措施 (状态)」形式串联。
  - `activeCountries` = 当日 `snapshot` 中 `status` 为 `已实施` 或 `关注中` 的国家数。
  - `snapshot` = 该日结束时**全部国家的完整状态清单**（含未变更国家）。为控制体积，允许只在 `type: "change"` 的日期写完整 `snapshot`，`nochange` 日期留空数组。
- **`borderMeasures`（顶层）必须等于 `borderMeasuresDaily` 中最后一个非空 `snapshot`**，即最新快照。两者不一致会导致边境措施页与每日简报口径冲突。
- 短文本字段（国家、措施、状态）请保持简短，表格列已设为不换行。

---

## 6. `info-sources.json`

```json
{
  "infoSources": [
    { "name": "WHO Disease Outbreak News (DON)", "category": "WHO", "tier": 1,
      "frequency": "每6小时", "lastUpdate": "2026-07-28 12:00 UTC",
      "status": "正常", "url": "https://www.who.int/emergencies/disease-outbreak-news" }
  ]
}
```

规则：
- `tier`：`1` 权威原始源｜`2` 机构汇总源｜`3` 补充线索源。
- `category` 为自由文本分组标签，请复用既有值：`WHO` `WHO 区域办公室` `区域机构` `疫区国家` `非洲邻国` `中东枢纽` `亚洲` `欧洲` `北美` `辅助`。
- `status`：`正常` `延迟` `异常`（按本次巡检实际情况填写）。
- `lastUpdate` 格式 `YYYY-MM-DD HH:mm UTC`，为本次实际核对到的最新发布时间。
- 每次调研都要真实巡检一遍并更新 `lastUpdate` / `status`，不要照搬旧值。

---

## 7. 一致性总规则（跨文件）

1. `outbreak.snapshotDate` 是全站基准日。每日简报以它为锚点计算 24 小时窗口，因此：
   - `epidemic.countryDaily` 必须存在 `snapshotDate` 当天与前一天的记录（重点国家）；
   - `announcements` 与 `borderMeasuresDaily` 应覆盖到 `snapshotDate`。
2. 国家中文名在所有文件中必须完全一致（例：统一写「刚果（金）」，不要混用「刚果金」「DRC」）。
3. KPI 数值 = `epidemic.json` 派生的合计值；`judgment` 与 `triggers` 引用的数字必须与 KPI 一致。
4. 只做增量更新：不要删除历史记录，除官方回溯修订。

---

## 8. 交付前自检清单

- [ ] 5 个文件均为合法 JSON，顶层键与本说明一致。
- [ ] 所有日期为 `YYYY-MM-DD`；所有数值为数字类型。
- [ ] 枚举字段无越界值（level / severity / category / measure / status / tier）。
- [ ] 重点国家从首例到 `snapshotDate` **逐日无缺口**，累计值单调不减。
- [ ] `announcements` 无占位条目，`id` 无重复。
- [ ] `borderMeasures` == `borderMeasuresDaily` 最新非空 `snapshot`；`activeCountries` 计数正确。
- [ ] `kpis` 与 `epidemic.json` 合计值一致，CFR 计算正确。
- [ ] `judgment` 为本轮综合推理结果，含具体数字与日期，`updatedAt` == `snapshotDate`。
- [ ] `info-sources` 的 `lastUpdate` / `status` 已按本轮巡检更新。

自检脚本（可选，Python）：

```python
import json, datetime, collections
P = "src/data/parts/"
ob = json.load(open(P+"outbreak.json")); ep = json.load(open(P+"epidemic.json"))
an = json.load(open(P+"announcements.json"))["announcements"]
bm = json.load(open(P+"border-measures.json"))
snap = ob["outbreak"]["snapshotDate"]
for c in ep["focusCountries"]:
    ds = sorted(r["date"] for r in ep["countryDaily"] if r["country"] == c)
    d0 = datetime.date.fromisoformat(ds[0]); d1 = datetime.date.fromisoformat(snap)
    want = {(d0 + datetime.timedelta(i)).isoformat() for i in range((d1-d0).days+1)}
    print(c, "缺日:", sorted(want - set(ds))[:10])
ids = [a["id"] for a in an]
print("重复id:", [k for k, v in collections.Counter(ids).items() if v > 1])
print("占位条目:", [a["id"] for a in an if "无新增" in a["title"]])
last = [d for d in bm["borderMeasuresDaily"] if d.get("snapshot")][-1]
print("快照一致:", last["snapshot"] == bm["borderMeasures"], "快照日期:", last["date"])
```

---

## 9. 交付方式

把 5 个文件按原名一并交付。平台侧只需替换 `src/data/parts/` 下的同名文件，保存后页面自动刷新，无需改动任何代码。
