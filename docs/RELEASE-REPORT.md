# 智备课 MVP 上线验收报告

## 结论

智备课 MVP 已于 2026-08-28 完成技术发布与线上验收。

- 线上地址：https://sppbukp76vna0itdtk0c8.apigateway-cn-beijing.volceapi.com/
- GitHub：https://github.com/macistone71-jpg/course-design-skill
- 发布形态：veFaaS Application + Serverless APIG
- 发布状态：Released

## 云资源

| 资源 | 名称 | ID |
|---|---|---|
| Application | `zhibeike-mvp` | `e8fd77a46890` |
| Function | `zhibeike-mvp` 底层函数 | `x584e3ul` |
| Serverless APIG | `zhibeike-gateway` | `gda8kn5csm537253769l0` |

运行配置：Node.js 20、`npm start`、端口 3000、0.5 vCPU、1024MB。

## 自动化与线上验收

| 检查 | 结果 |
|---|---|
| Node 单元测试 | 4/4 通过 |
| 课程包 Python 结构验证 | 通过 |
| 首页 | HTTP 200，标题正确 |
| `/api/health` | HTTP 200，服务状态正常 |
| `/api/generate` | HTTP 200，返回结构化课程包 |
| 目标覆盖 | 3/3 目标有课程活动覆盖 |
| 评价覆盖 | 3/3 目标有形成性评价覆盖 |
| 时长一致性 | 7 个活动合计 45 分钟 |
| 质量门禁 | 示例课 92/100，无硬失败 |
| 移动端 | 390px 宽度无横向溢出 |

## 已交付能力

1. 课程主题、学科、年级、时长、学习结果、学情与来源输入。
2. 7 阶段课堂流程和可观察证据。
3. 目标—活动—评价映射。
4. 8 维质量评分与 `SOURCE_GAP` 硬门禁。
5. AI 草稿—教师审核—教研审核状态流。
6. 浏览器本地草稿箱。
7. Markdown 与 JSON 导出。
8. 响应式网页与隐私提示。

## 当前边界

- 当前线上引擎明确标注为“可审计演示引擎”，未冒充大模型生成。
- 尚未接入教材 OCR、真实课标数据库、用户账号、云端课程库和 LMS 自动发布。
- 正式教育内容仍需教师与教研员审核。
- 5–8 名真实教师可用性灰度是下一阶段任务，不虚构用户反馈和业务效果。
