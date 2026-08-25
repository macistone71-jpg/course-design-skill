# 学科互动产物与插件协议

本 Skill 负责课程级编排；学科插件负责确定性计算和专门渲染。不要让通用模型同时承担“计算答案、设计教学、写渲染代码、验证结果”四种职责。

## Artifact Spec

委派前生成：

```yaml
artifact_spec:
  id: IA1
  objective_ids: [O2]
  subject: math
  artifact_type: interactive_geometry
  problem_statement: "..."
  givens: {}
  target: "..."
  language: zh-CN
  required_steps: []
  accessibility_fallback: 静态图与文字步骤
  output: self-contained-html
```

## 可选兼容插件

以下能力来自 WY 的开源项目 `wy51ai/edulab`（Apache-2.0），本仓库不复制其代码，也不自动安装：

- `edu-solid-geometry`：立体几何；SymPy 精确计算、Three.js 3D 模型、分步高亮与镜头。
- `edu-analytic-geometry`：圆锥曲线；SymPy、Canvas 2D 动态画板、参数滑块和理论范围。
- `edu-chem-reaction`：化学反应；自动配平、原子守恒、键变化和 Three.js 微观演示。
- 该项目还展示了物理求解/抛体时间仿真 HTML，可作为物理适配器的设计参考，但不是当前声明的正式 Skill。

只有插件已经安装或用户明确同意安装时才能调用。安装和依赖变更前必须征得同意。

## 回收结果后的四同源检查

1. 计算核心给出的结果；
2. 讲解步骤中的中间值；
3. 答案卡；
4. 互动界面最终显示。

四者必须一致。任一不一致则标记 `ARTIFACT_MISMATCH`，不得进入审核。

## 降级策略

插件不存在或运行失败时：

- 保留 Artifact Spec；
- 输出静态分镜、关键帧或教师演示步骤；
- 明确说明未生成交互网页；
- 不静默切换到未经验证的模型心算结果。