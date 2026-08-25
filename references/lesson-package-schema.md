# Lesson Package Schema

`lesson-package.json` 是课程包的机器可读索引，用于版本管理、审核、LMS 适配和自动质量检查。

## 顶层字段

```json
{
  "meta": {},
  "brief": {},
  "sources": [],
  "objectives": [],
  "lessons": [],
  "assessments": [],
  "quality": {},
  "governance": {}
}
```

## meta

- `package_id`：组织内唯一 ID。
- `title`：课程名。
- `version`：语义或组织版本号。
- `status`：`draft_ai | teacher_review | subject_review | approved | published | archived`。
- `language`：如 `zh-CN`。

## brief

- `audience`：年级/年龄、先备知识、典型困难。
- `delivery_mode`：录播、直播、面授、图文或混合。
- `total_duration_minutes`：总时长。
- `source_policy`：`source-grounded | provided-only | exploratory`。
- `constraints`：课程标准、设备、平台、无障碍与禁用内容。

## sources[]

每项包含 `id`、`title`、`type`、`version_or_date`、`authoritative`、`usage_scope`。关键事实应能引用来源 ID。

## objectives[]

每项包含：

- `id`
- `statement`
- `bloom_level`
- `success_criteria`
- `evidence`
- `source_ids`
- `prerequisite_ids`

## lessons[]

每项包含 `id`、`title`、`duration_minutes`、`objective_ids`、`knowledge_points`、`activities`、`assessment_ids`。活动内部可以继续标注教师行为、学生行为、材料和时间。

## assessments[]

这里只放形成性评价索引：`id`、`type`、`objective_ids`、`prompt`、`answer_or_rubric`。正式题库和学习诊断应交给知识检测 Skill。

## quality

- `score`：0–100，仅在真实评分后填写。
- `hard_failures`：硬门禁问题列表。
- `source_gaps`：来源缺口。
- `review_status`：质量审核状态。

## governance

- `generated_by`：模型和 Skill 版本。
- `human_owner`：课程负责人。
- `reviewers`：审核角色与人员匿名 ID。
- `created_at` / `updated_at`
- `change_reason`

验证器只检查结构和引用，不判断教学内容真实性。