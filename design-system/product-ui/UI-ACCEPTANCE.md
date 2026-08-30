# 智备课｜UI Acceptance

日期：2026-08-30

## 环境

- 正式地址：https://sppbukp76vna0itdtk0c8.apigateway-cn-beijing.volceapi.com/
- veFaaS Application：`e8fd77a46890`
- 发布：Node.js 20 / `npm start` / 3000，released

## 实际结果

| 任务 | 结果 |
|---|---|
| 示例课程生成 | 通过，返回结构化课程包 |
| 质量门禁 | 92/100，无硬失败，pass message 可见 |
| 键盘焦点 | Tab 后 `:focus-visible = true`，outline `solid 3px` |
| reduced-motion | transition 计算值 `0.00001s` |
| 390px | `innerWidth = scrollWidth = 390` |
| 单元与结构测试 | Node 6/6；Python Lesson Package 通过 |

## v1.1 最终教案修复验收

| 任务 | 本地及正式环境真实 Chromium 结果 |
|---|---|
| 审核状态机 | AI 草稿 → 教师审核中 → 教研审核中 → 已批准 |
| 教研批准后的去向 | 自动选中“最终教案”，不再停留在原标签 |
| 最终交付物 | 6 个内容章节、来源、目标、流程、评价、差异化支持和审批记录完整可见 |
| 状态持久化 | 草稿箱保存状态为 `approved`，审核日志 3 条 |
| 桌面端 | `innerWidth = scrollWidth = 1440` |
| 移动端 | `innerWidth = scrollWidth = 390` |
| reduced-motion | 390px 环境匹配为 `true` |
| 运行时异常 | 0 |

正式环境复验：v1.1 已发布；审核状态、自动进入最终教案、6 个内容章节、自动保存、1440px、390px、reduced-motion 均通过，运行时异常 0。

## 仍需真实灰度

教师修改率、排练/审核耗时、一次审核通过率和教学效果未采集，不计入技术验收。
