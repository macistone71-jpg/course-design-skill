# 企业级 AI 备课与教学内容生产 Skill

> 从“生成一篇教案”升级为“有来源、有目标对齐、有学科工具、有质量门禁、有人工审核、有版本审计”的课程生产流程。

## 项目定位

该项目源自 AI 教育业务场景，面向教师、教研员、课程运营和教学管理者。AI 负责结构抽取与初稿生产，教师负责学情和可教性，教研员负责学科审核，组织管理员负责模板、模型、数据和成本策略。

它不是一组孤立 Prompt，而是一套模型无关的课程内容生产协议。

## 企业级链路

```text
课程标准/教材/知识库
        ↓
LessonBrief 确认
        ↓
来源包与引用
        ↓
学习目标反向设计
        ↓
逐节教案/讲稿/活动/练习
        ↓
学科交互插件（可选）
        ↓
自动质量门禁
        ↓
教师审核 → 教研审核 → 发布
        ↓
版本、成本与效果复盘
```

## 相比初版的变化

- 从 5 步 Prompt 流程升级为 8 阶段企业工作流；
- 增加三类输入入口和 quick/standard/enterprise 输出模式；
- 增加 Source Pack、引用和来源缺口管理；
- 使用反向设计，强制目标—活动—评价对齐；
- 增加教师、教研员、课程管理员和组织管理员权限建议；
- 增加质量评分、硬门禁、局部重跑和审核状态机；
- 增加模型路由、成本、隐私、版权和审计规则；
- 增加结构化 `lesson-package.json` 和可执行验证器；
- 增加学科互动插件协议，可选对接立体几何、解析几何和化学反应演示。

## Web MVP：智备课

仓库已从方法论 Skill 落地为可上线的响应式 Web 产品，包含课程简报、来源登记、目标—活动—评价映射、8 维质量门禁、人工审核流、本地草稿箱和 Markdown/JSON 导出。

```bash
npm test
npm start
# 打开 http://localhost:3000
```

产品研究、PRD、技术说明和 14 步上线进度见：

- `docs/RESEARCH.md`
- `docs/PRD.md`
- `docs/TECHNICAL.md`
- `docs/PRODUCT-LAUNCH.md`

## Skill 快速使用

把 `SKILL.md` 安装到支持 Agent Skills 的工具中，或将课程主题、来源材料和以下信息交给 Agent：

```text
目标学员：
学习结果：
课程形式与时长：
来源材料：
需要的产物：
审核角色：
```

默认输出 standard 课程包。批量生产前先确认一节样板课。

验证结构化课程包：

```bash
python3 scripts/validate_lesson_package.py examples/lesson-package.example.json
```

验证器只检查结构、引用和目标覆盖，不替代事实核验与人工教研审核。

## 文件结构

```text
.
├── SKILL.md
├── README.md
├── package.json
├── server.js
├── src/generator.js
├── public/                 # 智备课 Web MVP
├── tests/                  # Node 单元测试
├── docs/                   # 研究、PRD、技术与上线记录
├── examples/
│   └── lesson-package.example.json
├── references/
│   ├── interactive-artifacts.md
│   ├── lesson-package-schema.md
│   └── quality-gates.md
└── scripts/
    └── validate_lesson_package.py
```

## 学科交互能力

本 Skill 借鉴 `wy51ai/edulab` 的工程思想：结构化题目规格、确定性计算核心、自包含互动页面、结果同源和交付前自检。可选兼容：

- `edu-solid-geometry`
- `edu-analytic-geometry`
- `edu-chem-reaction`

这些插件属于外部 Apache-2.0 项目，本仓库不复制其代码，也不会未经用户同意自动安装。

## 企业项目展示建议

面试或案例复盘时只使用真实数据：备课耗时、AI 初稿采用率、教师修改率、一次审核通过率、事实错误率、单节成本、发布周期和模板复用率。没有采集的数据标记“待验证”，不要编造。
