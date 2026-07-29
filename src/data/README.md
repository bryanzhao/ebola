# 数据文件说明

平台采用「前端 / 数据分离」结构，数据按主题拆分到 `parts/` 下的多份 JSON：

- `parts/outbreak.json`        —— 疫情基础信息、`globalRisk`、KPI、研判维度、触发条件、枢纽
- `parts/epidemic.json`        —— `countryDaily`（各国每日累计）、`focusCountries`
- `parts/announcements.json`   —— 公告时间线
- `parts/border-measures.json` —— 边境与旅行措施
- `parts/info-sources.json`    —— 三层信息源
- `seed.ts` —— 只负责合并加载、暴露类型、派生 `newCases` / `newDeaths` / `cfr`、以及**按日期倒序**排序。**不要**手工塞数值。

> 每个 part 可以交给不同 AI 独立更新，互不影响。

## 更新流程

1. 打开 `parts/` 下对应主题的 JSON，直接改数值 / 增删记录。
2. 保存后 Vite 会热更新，页面自动刷新。
3. 页面按最新日期倒序展示，不需要手工排序。

## 数据校验硬性要求

- **每日必录**：`countryDaily` 中每个国家（`focusCountries` 列表）从 `outbreak.startDate` 到 `outbreak.snapshotDate` **每一天都必须有一条记录**。仅当当天官方明确没有更新时，可跳过并在提交说明中列出跳过日期与依据链接。
- **累计单调**：同一国家的 `cumCases` / `cumDeaths` 随日期只能非递减。
- **公告尽量按天**：`announcements` 力求覆盖每一个自然日的重要更新；确认某日无公开公告时才可空缺。
- **列表倒序**：数据文件本身无需排序，`seed.ts` 会在加载时按日期倒序。

## 字段速查

| JSON 键 | 页面 | 说明 |
| --- | --- | --- |
| `outbreak` | 全局 | 疫情基础信息（`snapshotDate` 决定“24小时简报”对比日期）|
| `globalRisk` | 顶部导航灯 | `"low" \| "medium" \| "high"` |
| `kpis` | 首页 KPI 卡 | 保留 4 项即可（`deltaWeek` 为周变化）|
| `riskDimensions` | 研判矩阵 | 4 个维度对象 |
| `triggers` | 研判矩阵 | 升级触发条件列表 |
| `announcements` | 公告页 / 首页事件流 / 简报 | 每条含 `severity` (`info/advisory/action`) |
| `borderMeasures` | 边境措施页 / 简报 | 结构化的入境政策 |
| `infoSources` | 信息源页 | Tier 1/2/3 采集清单 |
| `hubStatus` | 边境措施页 / 首页灯 | 关键中转枢纽 |
| `countryDaily` | 疫情数据页 / 首页表 / 简报 | **只填累计值** `cumCases` / `cumDeaths`，每日新增与 CFR 由代码自动派生 |
| `focusCountries` | 疫情数据页顶部卡 | 重点关注国家名（需与 `countryDaily.country` 完全一致）|

## 常见操作

### 新增一个国家的每日数据

```json
{ "country": "肯尼亚", "iso": "KEN", "date": "2026-06-01", "cumCases": 3, "cumDeaths": 0 }
```

插入到 `countryDaily` 数组即可。日期请用 `YYYY-MM-DD`。

### 新增一条公告

```json
{
  "id": "唯一ID",
  "date": "2026-06-01",
  "country": "德国",
  "region": "欧洲",
  "agency": "RKI",
  "category": "旅行建议",
  "title": "……",
  "summary": "……",
  "severity": "advisory"
}
```

`region` 枚举：`全球 | 非洲 | 北美 | 欧洲 | 亚洲 | 中东 | 大洋洲`
`category` 枚举：`疫情通报 | 入境限制 | 增强筛查 | 旅行建议 | 海关公告 | 应对部署 | PHEIC/IHR`
`severity` 枚举：`info | advisory | action`

### 切换全球风险灯

把 `globalRisk` 改为 `"low"` / `"medium"` / `"high"`。