# 项目一｜AI 智能备课（智备课）

## 一、项目定位

产品名称：智备课（AI Lesson Studio）

GitHub：https://github.com/macistone71-jpg/course-design-skill

定位：把“一次对话生成一篇教案”升级为有来源、有目标对齐、有质量门禁、有人审核、有版本记录的教学内容生产工作台。

目标用户：一线教师、教研员、课程运营与教学管理者。

核心链路：LessonBrief → Source Pack → 反向设计学习目标 → 课堂活动与形成性评价 → 8 维质量门禁 → 教师审核 → 教研审核 → Markdown/JSON 导出。

## 二、已完成产品功能

1. 课程简报：课程主题、学科、年级、授课方式、时长与可观察学习结果；
2. 来源与学情：登记课程标准、教材、教师材料、先备知识与典型困难；
3. 课堂流程：自动编排诊断导入、目标说明、核心讲解、引导练习、独立迁移、反馈纠错、退出条 7 个阶段；
4. 目标—活动—评价映射：3 个可观察目标均绑定课堂活动与形成性评价；
5. 差异化教学：支持支架层、核心层与挑战层建议；
6. 质量门禁：来源、目标对齐、教学设计、学情适配、认知负荷、清晰与无障碍、互动评价、治理审计 8 维检查；
7. SOURCE_GAP：缺少来源时硬失败，草稿不可进入正式发布；
8. 人工审核：AI 草稿 → 教师审核 → 教研审核，不允许 AI 越权发布；
9. 本地草稿箱：只保存在浏览器 localStorage；
10. Markdown/JSON 导出：输出可读教案与结构化 Lesson Package。

## 三、14 步执行进度

1. 产品阅读与行业积累：完成，已研读 course-design-skill 全部协议与质量门禁；
2. 行业分析：完成，已研究 MagicSchool、Eduaide、Diffit、Kuraplan；
3. 用户调研：部分完成，已有教育一线/FDE 场景假设，真实 5–8 名教师灰度待执行；
4. 竞品分析：完成，差异化聚焦来源、目标对齐、门禁与审核；
5. 立项报告：完成；
6. 最小 MVP：完成，响应式 Web，不做小程序、账号体系和 LMS 自动发布；
7. 技术可行性：完成，Node 零第三方运行依赖、确定性规则引擎与结构化课程包；
8. PRD：完成，见 docs/PRD.md；
9. 技术文档：完成，见 docs/TECHNICAL.md；
10. 开发：完成，前端工作台、生成 API、门禁、审核、草稿与导出已实现；
11. 开发验证：完成，Node 单元测试与 Lesson Package Python 验证器通过；
12. 灰度测试：技术灰度已完成，待 5–8 名真实教师可用性测试；
13. 正式上线：已完成 veFaaS + Serverless APIG 技术发布与线上端到端验收；
14. 上线迭代：待采集真实教师修改率、来源填写率、提交审核率与一次教研通过率。

## 四、行业与竞品结论

MagicSchool 的优势是教师场景工具集合，Eduaide 强在引导式生产与修改，Diffit 强在材料分级，Kuraplan 强调课程框架 grounding。智备课不扩张为大量零散工具，优先完成“来源—目标—活动—评价—审核”的完整闭环。

## 五、技术与测试

技术架构：浏览器响应式表单与 localStorage → POST /api/generate → Node.js 内置 HTTP Server → 确定性生成器 → 结构与门禁检查。

运行要求：Node.js 20+；启动命令 npm start；端口 3000；健康检查 /api/health。

测试覆盖：必填字段和时长边界、20/45/90/180 分钟分配守恒、目标和评价全覆盖、缺少来源触发 SOURCE_GAP、结构化 Lesson Package 引用有效。

隐私边界：不采集学生姓名、联系方式、成绩明细；服务端不持久化输入；AI 草稿不能直接成为 published。

## 六、真实数据边界

当前未虚构教师节省时长、采用率、事实错误率或教学效果。真实备课耗时、教师修改率、一次审核通过率与课程效果必须在灰度后采集；没有数据时标记“待验证”。

## 七、上线结果与下一步

线上地址：https://sppbukp76vna0itdtk0c8.apigateway-cn-beijing.volceapi.com/

云资源：Application `zhibeike-mvp`（`e8fd77a46890`）；Function `x584e3ul`；Serverless APIG `zhibeike-gateway`（`gda8kn5csm537253769l0`）。首页、健康检查和真实生成 API 均返回 HTTP 200；示例课程 7 个活动合计 45 分钟，质量得分 92/100，无硬失败。

P0：邀请 5–8 名一线教师完成真实 45 分钟教案任务。

P1：增加文件解析、逐段编辑、审核退回原因、课程包版本对比和安全的服务端模型路由。

P2：接入授权课程标准库、组织权限、多人协作和真实 LMS 适配器。

## 八、必要文件与报告（可点击）

- [行业与竞品分析](https://github.com/macistone71-jpg/course-design-skill/blob/main/docs/RESEARCH.md)
- [产品需求文档 PRD](https://github.com/macistone71-jpg/course-design-skill/blob/main/docs/PRD.md)
- [技术选型与架构](https://github.com/macistone71-jpg/course-design-skill/blob/main/docs/TECHNICAL.md)
- [14 步上线进度、灰度与指标](https://github.com/macistone71-jpg/course-design-skill/blob/main/docs/PRODUCT-LAUNCH.md)
- [线上发布与验收报告](https://github.com/macistone71-jpg/course-design-skill/blob/main/docs/RELEASE-REPORT.md)
- [结构化课程包 Schema](https://github.com/macistone71-jpg/course-design-skill/blob/main/references/lesson-package-schema.md)
- [质量评分与硬门禁](https://github.com/macistone71-jpg/course-design-skill/blob/main/references/quality-gates.md)
- [示例课程包](https://github.com/macistone71-jpg/course-design-skill/blob/main/examples/lesson-package.example.json)
- [核心自动化测试](https://github.com/macistone71-jpg/course-design-skill/blob/main/tests/generator.test.js)
