'use strict';

const crypto = require('node:crypto');

const LIMITS = {
  topic: 80,
  audience: 120,
  learningResult: 240,
  priorKnowledge: 240,
  difficulties: 240,
  sourcesText: 8000
};

function clean(value, max = 500) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function validateInput(input = {}) {
  const errors = [];
  if (!clean(input.topic, LIMITS.topic)) errors.push('请填写课程主题');
  if (!clean(input.subject, 30)) errors.push('请选择学科');
  if (!clean(input.grade, 30)) errors.push('请选择年级');
  const duration = Number(input.duration);
  if (!Number.isInteger(duration) || duration < 20 || duration > 180) errors.push('课时须为 20–180 分钟的整数');
  if (!clean(input.learningResult, LIMITS.learningResult)) errors.push('请填写可观察的学习结果');
  return errors;
}

function parseSources(text) {
  return String(text || '')
    .split(/\n+/)
    .map(line => clean(line, 500))
    .filter(Boolean)
    .slice(0, 8)
    .map((line, index) => ({
      id: `S${index + 1}`,
      title: line,
      type: /课标|标准/.test(line) ? 'curriculum-standard' : /教材|教科书/.test(line) ? 'textbook' : 'teacher-provided',
      version_or_date: '待教师确认',
      authoritative: /课标|标准|教材|教科书|官方/.test(line),
      usage_scope: '仅用于本次备课'
    }));
}

function distributeMinutes(total) {
  const weights = [0.1, 0.12, 0.22, 0.2, 0.18, 0.1, 0.08];
  const values = weights.map(weight => Math.max(2, Math.round(total * weight)));
  values[values.length - 1] += total - values.reduce((sum, value) => sum + value, 0);
  return values;
}

function generateLessonPackage(rawInput) {
  const input = {
    topic: clean(rawInput.topic, LIMITS.topic),
    subject: clean(rawInput.subject, 30),
    grade: clean(rawInput.grade, 30),
    audience: clean(rawInput.audience, LIMITS.audience),
    learningResult: clean(rawInput.learningResult, LIMITS.learningResult),
    priorKnowledge: clean(rawInput.priorKnowledge, LIMITS.priorKnowledge),
    difficulties: clean(rawInput.difficulties, LIMITS.difficulties),
    deliveryMode: clean(rawInput.deliveryMode, 20) || '面授',
    duration: Number(rawInput.duration),
    mode: ['quick-draft', 'standard', 'enterprise'].includes(rawInput.mode) ? rawInput.mode : 'standard',
    sourcesText: String(rawInput.sourcesText || '').slice(0, LIMITS.sourcesText)
  };

  const sources = parseSources(input.sourcesText);
  const sourceIds = sources.map(source => source.id);
  const [m1, m2, m3, m4, m5, m6, m7] = distributeMinutes(input.duration);
  const audience = input.audience || `${input.grade}学生`;
  const prior = input.priorKnowledge || '通过开场诊断题现场确认，教师不预设学生已经掌握。';
  const difficulty = input.difficulties || `容易停留在记忆结论，难以把“${input.topic}”迁移到新情境。`;

  const objectives = [
    {
      id: 'O1',
      statement: `学生能用自己的话解释“${input.topic}”的核心概念，并给出一个正确例子。`,
      bloom_level: 'understand',
      success_criteria: '表述包含关键概念，例子与概念一致；两项均满足即达成。',
      evidence: '概念卡片与同伴互评',
      source_ids: sourceIds,
      prerequisite_ids: []
    },
    {
      id: 'O2',
      statement: input.learningResult,
      bloom_level: 'apply',
      success_criteria: '能独立完成核心任务，步骤完整、依据清楚，正确率达到 80%。',
      evidence: '课堂核心任务与教师观察记录',
      source_ids: sourceIds,
      prerequisite_ids: ['O1']
    },
    {
      id: 'O3',
      statement: `学生能比较两个与“${input.topic}”有关的情境，指出关键差异并说明理由。`,
      bloom_level: 'analyze',
      success_criteria: '至少指出一个关键差异，并使用本课概念作出有依据的解释。',
      evidence: '迁移挑战与退出条',
      source_ids: sourceIds,
      prerequisite_ids: ['O1', 'O2']
    }
  ];

  const activities = [
    { id: 'A1', phase: '诊断导入', minutes: m1, objective_ids: ['O1'], teacher: `呈现一个与“${input.topic}”有关的真实情境，追问“你依据什么判断？”`, student: '独立作答后投票，暴露已有认识与常见误区。', evidence: '诊断答案分布' },
    { id: 'A2', phase: '目标与标准', minutes: m2, objective_ids: ['O1', 'O2'], teacher: '展示本节可观察目标、成功标准和最终任务。', student: '用一句话复述“这节课结束时我要能做什么”。', evidence: '目标复述' },
    { id: 'A3', phase: '核心讲解', minutes: m3, objective_ids: ['O1'], teacher: `基于来源材料分块讲解“${input.topic}”，每讲一个要点立即给出正例与反例。`, student: '完成“概念—证据—例子”三列表。', evidence: '概念卡片' },
    { id: 'A4', phase: '示范与引导练习', minutes: m4, objective_ids: ['O2'], teacher: '先示范一次完整思考过程，再逐步撤去提示。', student: '两人协作完成同构任务，并标注每一步依据。', evidence: '引导练习单' },
    { id: 'A5', phase: '独立迁移', minutes: m5, objective_ids: ['O2', 'O3'], teacher: '提供一个信息结构不同的新情境，观察而不直接给答案。', student: '独立完成任务，比较新旧情境并写出理由。', evidence: '独立任务单' },
    { id: 'A6', phase: '反馈纠错', minutes: m6, objective_ids: ['O1', 'O2'], teacher: `围绕“${difficulty}”展示匿名错例，组织依据式纠错。`, student: '使用成功标准自评，并完成一次针对性修正。', evidence: '修改前后对照' },
    { id: 'A7', phase: '退出条与延伸', minutes: m7, objective_ids: ['O3'], teacher: '收集退出条，按“已达成/需补救/需挑战”分组。', student: '提交 1 分钟退出条：结论、依据、仍有疑问。', evidence: '退出条' }
  ];

  const assessments = [
    { id: 'F1', type: 'concept-check', objective_ids: ['O1'], prompt: `不用照抄定义，用自己的话解释“${input.topic}”，并给出一个例子。`, answer_or_rubric: '概念准确 1 分；例子匹配 1 分；表达清楚 1 分。' },
    { id: 'F2', type: 'performance-task', objective_ids: ['O2'], prompt: input.learningResult, answer_or_rubric: '过程完整 40%；依据正确 30%；结果正确 20%；表达与自检 10%。' },
    { id: 'F3', type: 'exit-ticket', objective_ids: ['O3'], prompt: `比较课堂示例与一个新情境，写出一处关键差异以及它对结论的影响。`, answer_or_rubric: '差异真实、影响合理、解释引用本课概念。' }
  ];

  const hardFailures = sources.length ? [] : ['SOURCE_GAP：尚未提供课程标准、教材或教师确认来源，草稿不可进入正式发布。'];
  const scoreBreakdown = {
    source_grounding: sources.length ? Math.min(25, 17 + sources.length * 2) : 8,
    objective_alignment: 20,
    instructional_design: 14,
    learner_fit: input.audience || input.priorKnowledge ? 9 : 7,
    cognitive_load: 9,
    clarity_accessibility: 8,
    interaction_assessment: 5,
    governance_audit: 4
  };
  const score = Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0);
  const id = `LP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const timestamp = new Date().toISOString();

  return {
    meta: { package_id: id, title: `${input.topic}｜${input.grade}${input.subject}教案`, version: '1.0.0', status: 'draft_ai', language: 'zh-CN', engine: 'auditable-demo-v1' },
    brief: {
      topic: input.topic,
      subject: input.subject,
      grade: input.grade,
      audience,
      delivery_mode: input.deliveryMode,
      total_duration_minutes: input.duration,
      source_policy: sources.length ? 'source-grounded' : 'exploratory',
      learning_result: input.learningResult,
      prior_knowledge: prior,
      typical_difficulty: difficulty,
      output_mode: input.mode,
      constraints: ['不使用学生个人信息', '未核验事实必须标注来源缺口', 'AI 草稿需教师与教研审核']
    },
    sources,
    objectives,
    lessons: [{
      id: 'L1',
      title: input.topic,
      duration_minutes: input.duration,
      objective_ids: objectives.map(item => item.id),
      knowledge_points: [`${input.topic}的核心概念与边界`, '从正反例中提炼判断依据', '把方法迁移到新情境'],
      activities,
      assessment_ids: assessments.map(item => item.id)
    }],
    assessments,
    teacher_guide: {
      lesson_focus: input.learningResult,
      likely_misconceptions: [difficulty, '只记结论、不说明依据', '在新情境中机械套用课堂例子'],
      questions: ['你观察到了什么？', '你的判断依据来自哪里？', '如果条件改变，结论还成立吗？', '哪条成功标准能帮助你改进答案？'],
      differentiation: {
        support: '提供关键词卡、步骤条和半完成示例；允许先口述再书写。',
        core: '独立完成核心任务，并用成功标准自检。',
        challenge: '改写一个条件，预测结果变化并为同伴设计一道变式题。'
      },
      after_class: '根据退出条分组：次课前 5 分钟补救；达成者进入变式挑战。'
    },
    quality: {
      score,
      threshold: 85,
      passed: score >= 85 && hardFailures.length === 0,
      score_breakdown: scoreBreakdown,
      hard_failures: hardFailures,
      source_gaps: sources.length ? [] : ['缺少可核验的课程标准/教材/官方资料'],
      review_status: 'pending-teacher-review'
    },
    governance: {
      generated_by: 'ai-lesson-planner skill / 智备课 MVP v1',
      human_owner: '待认领',
      reviewers: ['teacher', 'subject_reviewer'],
      created_at: timestamp,
      updated_at: timestamp,
      change_reason: 'initial draft',
      privacy_note: '禁止输入学生姓名、联系方式、成绩明细等个人信息。'
    }
  };
}

module.exports = { generateLessonPackage, validateInput, parseSources, distributeMinutes };
