# 智备课 MVP 技术说明

## 架构

```text
Browser
  ├─ 响应式表单、结果审校、localStorage 草稿、文件导出
  └─ POST /api/generate
            ↓
Node.js HTTP Server（零第三方依赖）
  ├─ 输入长度与范围校验
  ├─ 可审计规则生成器
  ├─ 目标—活动—评价映射
  └─ 质量评分与硬门禁
```

## 选型理由

- 使用 Node 内置 `http`，无运行时第三方依赖，降低首发部署与供应链复杂度。
- 静态前端无构建步骤，适合快速灰度、定位问题和 veFaaS 部署。
- 首版使用确定性规则生成器，便于测试来源门禁、分钟分配和引用一致性。
- 服务端不持久化用户输入；草稿仅存浏览器 `localStorage`。
- 后续可在 `src/generator.js` 前增加模型路由，但结构校验和门禁必须保留在确定性代码侧。

## API

### `GET /api/health`

返回服务状态与当前引擎类型。

### `POST /api/generate`

必填：`topic`、`subject`、`grade`、`duration`、`learningResult`。

可选：`audience`、`priorKnowledge`、`difficulties`、`deliveryMode`、`sourcesText`、`mode`。

限制：请求体 ≤1MB；来源文本 ≤8000 字符；时长 20–180 分钟。

## 安全与隐私

- 静态文件路径使用 `path.resolve` 并限制在 `public/`。
- JSON 请求限制体积，字段统一截断和清理。
- 用户输入在前端展示前进行 HTML 转义。
- `.env*` 默认不进入 Git。
- 不收集学生 PII，不记录请求正文，不在服务端保存草稿。
- AI 输出不能直接成为 `published`。

## 本地运行

```bash
npm test
npm start
# http://localhost:3000
```

## 部署配置

- Runtime：Node.js ≥20
- Build command：无
- Start command：`npm start`
- Port：`3000`（也兼容平台注入的 `PORT`）
- Health check：`/api/health`

## 后续模型接入

建议增加 `AIProvider` 接口，模型只生成候选内容：

1. 低成本模型抽取 LessonBrief 与 Source Pack；
2. 强模型生成活动与差异化；
3. 确定性代码检查 ID、分钟、覆盖率、状态与来源缺口；
4. 失败模块局部重跑，不整包重写；
5. 记录 provider、model、prompt/skill version、latency、token 与估算成本。
