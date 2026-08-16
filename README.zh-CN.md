<!-- i18n-source: README.md  i18n-hash: 7c1ea480b94019ca  -->

[English](README.md) · **简体中文** · [Türkçe](README.tr.md)

# Apple Ads CLI

**用 AI 智能体投放 Apple Search Ads —— 并且看清哪些关键词真正回本，而不只是哪些关键词带来了转化。**

基于 [Adapty CLI](https://github.com/adaptyteam/adapty-cli) 的 Apple Search Ads 技能、操作手册与垂类指南。支持 Claude Code、Cowork、Codex、Gemini CLI 和 Copilot CLI。

> CLI 本身通过 `npm i -g adapty` 安装。本仓库是它之上的智能体层：做什么、什么时候做、为什么这么做。

---

## 为什么需要它

任何 Apple Ads 工具都能告诉你某个关键词的单次安装成本，但没有一个能告诉你，这次安装在六周之后到底值多少钱。

Apple 的 API 只知道花费、点击和安装量。它不知道从 `samsung tv remote` 来的用户续订了四次周订阅，而从 `free remote app` 来的用户第二天就取消了。广告预算正是消失在这个缺口里 —— 而填上它需要订阅数据，这正是 Adapty 所拥有的。

因此，这是唯一一套能让智能体回答下面这个问题的 Apple Search Ads 方案：

```
按第 30 天的同期群收入计算（而不是按安装量），哪些关键词是盈利的？
```

---

## 安装

```bash
npm i -g adapty
adapty auth login
adapty asa connect
```

然后安装智能体层：

```bash
claude plugin marketplace add adaptyteam/apple-ads-cli
claude plugin install apple-ads@adapty
```

<details>
<summary>其他智能体工具</summary>

```bash
# Codex、Gemini CLI、Copilot CLI、Cursor、Zed 等
npx skills add adaptyteam/apple-ads-cli --all

# 只安装其中一个技能
npx skills add adaptyteam/apple-ads-cli --skill apple-ads-strategy
```

通过这种方式安装的技能不会自动更新 —— 之后请运行 `npx skills update`。
来自第三方市场的插件同样不会自动更新 —— 请运行 `claude plugin update apple-ads@adapty`。

</details>

<details>
<summary>Claude Cowork</summary>

Cowork 在沙箱中执行命令，只能访问白名单域名。安装前请**同时**添加 `adapty.io` 和 `*.adapty.io` —— 在多数白名单实现中，通配符并不覆盖顶级域名本身。

设置 → Capabilities → 启用代码执行 → 允许网络出站 → 添加这两个域名。设置在任务开始时生效，因此在对话进行中修改不会影响当前任务。

</details>

---

## 包含内容

| | |
|---|---|
| **`apple-ads`** | 执行层。读取投放表现、调整出价与预算、添加关键词与否定词、收割搜索词、启动与暂停广告系列 —— 全部通过 CLI 完成，任何花钱的操作前都会先确认。 |
| **`apple-ads-audit`** | 只读审计层。检查账户健康、投放状态、线上结构、流量归属、重复的精确匹配关键词，并在同一时间范围内简单比较 Apple 与 Adapty 的安装量。绝不执行写操作。 |
| **`apple-ads-strategy`** | 规划层。**不需要账号、不需要 CLI、不需要订阅。** 把「我有一个电视遥控器 App，该从哪儿开始」变成完整的账户结构、关键词分类、启动预算和否定词清单。 |
| **操作手册** | 每周检查 · 账户健康 · 结构审计 · 同期群 ROAS · 关键词出价审查 · Market Intelligence 关键词机会 · 搜索词收割 · 否定关键词挖掘 · CPP 路由 · 预算再分配 · 广告系列启动 · 超支应急 · 自动化规则。 |
| **垂类指南** | 分品类的操作手册 —— 需求画像、关键词分类、账户结构、启动期经济模型，以及该品类特有的失败模式。 |

所有操作手册都可以直接在 GitHub 上阅读。使用它们不需要安装任何东西，也不需要 Adapty 账号。

---

## 试试这些

```
> 按第 30 天同期群 ROAS 计算，上个月哪些广告组在亏钱？
> 审计这个线上账户，告诉我哪些地方需要关注，但不要做任何修改。
> 这三个竞品 App Store ID 在美国出现了哪些我的账户尚未覆盖的搜索词？
> 把上周的搜索词收割成精确匹配关键词和否定词，先给我看方案。
> 我的周订阅工具类 App，CPI 是目标值的 3 倍。问题出在哪儿？
> 我要上线一款通用电视遥控器 App，帮我搭一套广告系列结构。
```

最后一条只需要规划技能，其余什么都不用装。

---

## 安全性

Apple Ads **没有沙箱环境**。每一次调用都作用于线上，花的都是真钱。

- 读操作免费。每一次写操作都会先预览，并需要明确确认。
- 写操作携带幂等键，因此在结果不明时重试不会创建出第二个广告系列。
- 请求预算受到约束，智能体不会把你的速率限制烧到进入数小时的冷却状态。
- 没有删除功能。广告系列的删除只能在控制台完成，这是刻意的设计。

---

## 环境要求与限制

- Node 18+，Adapty CLI 0.4.0 或更高版本。
- 一个 Apple Ads **Advanced** 账户。
- 有效的 Adapty Ads Manager 订阅 —— **月收入低于 5000 美元时免费**，之后按广告花费的 3.5% 计。没有订阅时，`asa` 命令会返回 `402`。
- 规划技能和本仓库中的所有操作手册，不需要上述任何一项。

---

## 路线图

- **Apple Ads Platform API v1。** Apple 将于 **2027 年 1 月 26 日** 停用 Campaign Management API。Platform API v1 保持相同的 OAuth 流程，但用 `adAccountId` 取代 `orgId`，并新增 Apple Maps 广告。迁移进度将公开跟踪。
- **托管 MCP** —— 无需安装 Node、无需配置域名白名单，直接从 Claude 连接。
- **更多垂类** —— 指南库按品类持续扩充。

---

## 相关链接

- [Adapty CLI](https://github.com/adaptyteam/adapty-cli) · [CLI 文档](https://adapty.io/docs/developer-cli-quickstart)
- [Ads Manager 技能文档](https://adapty.io/docs/developer-cli-ads-manager-skill)
- [Adapty SDK 接入技能](https://github.com/adaptyteam/adapty-sdk-integration-skill)

欢迎提交 Issue 和 Pull Request，尤其欢迎新的垂类指南。请参考[模板](skills/apple-ads-strategy/references/verticals/_TEMPLATE.md)。
