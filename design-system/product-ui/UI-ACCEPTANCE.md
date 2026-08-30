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
| 单元与结构测试 | Node 4/4；Python Lesson Package 通过 |

## 仍需真实灰度

教师修改率、排练/审核耗时、一次审核通过率和教学效果未采集，不计入技术验收。
