'use strict';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const form = $('#lessonForm');
const formShell = $('#formShell');
const resultShell = $('#resultShell');
const resultLoading = $('#resultLoading');
const resultContent = $('#resultContent');
const validationBox = $('#validationBox');
const historyDialog = $('#historyDialog');
let currentPackage = null;
let activeTab = 'flow';

const demo = {
  topic: '光合作用与生态系统能量流动', subject: '生物', grade: '七年级', duration: '45', deliveryMode: '面授',
  learningResult: '学生能用食物网解释能量如何在生态系统中流动，并预测一种生物数量变化对其他生物的影响。',
  audience: '七年级学生；已认识生产者、消费者和分解者；需要加强图示阅读与因果表达。',
  priorKnowledge: '知道植物能制造有机物，认识常见的食物链关系。',
  difficulties: '容易把食物网箭头方向理解反；只看到直接影响，忽略间接影响。',
  sourcesText: '义务教育生物学课程标准（2022年版）\n七年级生物学教材：绿色植物与生物圈\n教师确认的本校学情记录（匿名）', mode: 'standard'
};

function fillDemo() {
  Object.entries(demo).forEach(([name, value]) => {
    const control = form.elements[name];
    if (!control) return;
    if (control instanceof RadioNodeList) {
      [...control].forEach(item => { item.checked = item.value === value; });
    } else control.value = value;
  });
  form.querySelector('[name="topic"]').focus();
  validationBox.hidden = true;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function formData() {
  return Object.fromEntries(new FormData(form).entries());
}

function clientValidate(data) {
  const errors = [];
  if (!data.topic?.trim()) errors.push('请填写课程主题');
  if (!data.subject) errors.push('请选择学科');
  if (!data.grade) errors.push('请选择年级');
  if (!data.learningResult?.trim()) errors.push('请填写可观察的学习结果');
  const duration = Number(data.duration);
  if (!Number.isInteger(duration) || duration < 20 || duration > 180) errors.push('课时须为 20–180 分钟');
  return errors;
}

function showErrors(errors) {
  validationBox.innerHTML = `<strong>请先补全以下信息：</strong><br>${errors.map(esc).join('<br>')}`;
  validationBox.hidden = false;
  validationBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = formData();
  const errors = clientValidate(data);
  if (errors.length) return showErrors(errors);
  validationBox.hidden = true;
  formShell.hidden = true;
  resultShell.hidden = false;
  resultLoading.hidden = false;
  resultContent.hidden = true;
  setStep(3);
  resultShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const [response] = await Promise.all([
      fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      new Promise(resolve => setTimeout(resolve, 1100))
    ]);
    const payload = await response.json();
    if (!response.ok) throw new Error((payload.errors || ['生成失败']).join('；'));
    currentPackage = payload.lessonPackage;
    activeTab = 'flow';
    renderResult();
  } catch (error) {
    formShell.hidden = false;
    resultShell.hidden = true;
    setStep(1);
    showErrors([error.message || '网络异常，请重试']);
  } finally {
    button.disabled = false;
  }
});

function setStep(step) {
  $$('.steps li').forEach(item => item.classList.toggle('active', Number(item.dataset.step) === step));
}

function renderResult() {
  const pkg = currentPackage;
  resultLoading.hidden = true;
  resultContent.hidden = false;
  $('#resultTitle').textContent = pkg.meta.title;
  $('#resultMeta').textContent = `${pkg.meta.package_id} · ${pkg.brief.total_duration_minutes} 分钟 · ${pkg.brief.delivery_mode}`;
  updateStatus();
  $$('.result-tabs button').forEach(button => button.classList.toggle('active', button.dataset.tab === activeTab));
  renderTab();
}

function updateStatus() {
  const labels = { draft_ai: 'AI 草稿', teacher_review: '教师审核中', subject_review: '教研审核中', approved: '已批准' };
  $('#resultStatus').textContent = labels[currentPackage.meta.status] || currentPackage.meta.status;
  const button = $('#teacherReview');
  if (currentPackage.meta.status === 'draft_ai') button.textContent = '提交教师审核';
  else if (currentPackage.meta.status === 'teacher_review') button.textContent = '教师确认，提交教研';
  else if (currentPackage.meta.status === 'subject_review') button.textContent = '教研批准';
  else { button.textContent = '审核已完成'; button.disabled = true; }
}

function renderTab() {
  const panel = $('#tabPanel');
  if (activeTab === 'flow') panel.innerHTML = renderFlow();
  if (activeTab === 'alignment') panel.innerHTML = renderAlignment();
  if (activeTab === 'quality') panel.innerHTML = renderQuality();
  if (activeTab === 'json') panel.innerHTML = `<pre class="json-view">${esc(JSON.stringify(currentPackage, null, 2))}</pre>`;
}

function renderFlow() {
  const lesson = currentPackage.lessons[0];
  return `<div class="brief-strip"><div><b>教学对象</b><span>${esc(currentPackage.brief.grade)} · ${esc(currentPackage.brief.subject)}</span></div><div><b>核心任务</b><span>${esc(currentPackage.brief.learning_result)}</span></div><div><b>来源状态</b><span>${currentPackage.sources.length ? `${currentPackage.sources.length} 条已登记` : '存在来源缺口'}</span></div></div>
  <section class="section-block"><h3>课堂流程与证据</h3><div class="flow-list">${lesson.activities.map((item, index) => `<article class="flow-item"><i>${String(index + 1).padStart(2, '0')}</i><div><h4>${esc(item.phase)}</h4><p><b>教师：</b>${esc(item.teacher)}</p><p><b>学生：</b>${esc(item.student)}</p>${item.objective_ids.map(id => `<span class="chip">${esc(id)}</span>`).join('')}<span class="chip">证据：${esc(item.evidence)}</span></div><strong>${item.minutes}'</strong></article>`).join('')}</div></section>
  <section class="section-block"><h3>差异化支持</h3><div class="objective-card"><p><b>需要支架：</b>${esc(currentPackage.teacher_guide.differentiation.support)}</p><p><b>核心要求：</b>${esc(currentPackage.teacher_guide.differentiation.core)}</p><p><b>进阶挑战：</b>${esc(currentPackage.teacher_guide.differentiation.challenge)}</p></div></section>`;
}

function renderAlignment() {
  return `<section class="section-block"><h3>可观察学习目标</h3>${currentPackage.objectives.map(objective => `<article class="objective-card"><span>${esc(objective.id)} · ${esc(objective.bloom_level).toUpperCase()}</span><h4>${esc(objective.statement)}</h4><p><b>成功标准：</b>${esc(objective.success_criteria)}</p><p><b>达成证据：</b>${esc(objective.evidence)}</p><p><b>来源：</b>${objective.source_ids.length ? objective.source_ids.map(esc).join('、') : 'SOURCE_GAP'}</p></article>`).join('')}</section><section class="section-block"><h3>形成性评价</h3>${currentPackage.assessments.map(item => `<article class="assessment-card"><span class="chip">${esc(item.id)}</span>${item.objective_ids.map(id => `<span class="chip">对应 ${esc(id)}</span>`).join('')}<p><b>任务：</b>${esc(item.prompt)}</p><p><b>评分依据：</b>${esc(item.answer_or_rubric)}</p></article>`).join('')}</section>`;
}

function renderQuality() {
  const q = currentPackage.quality;
  const labels = { source_grounding: '事实与来源', objective_alignment: '目标对齐', instructional_design: '教学设计', learner_fit: '学情适配', cognitive_load: '认知负荷', clarity_accessibility: '清晰无障碍', interaction_assessment: '互动评价', governance_audit: '治理审计' };
  const maxima = { source_grounding: 25, objective_alignment: 20, instructional_design: 15, learner_fit: 10, cognitive_load: 10, clarity_accessibility: 10, interaction_assessment: 5, governance_audit: 5 };
  return `<div class="quality-hero"><strong>${q.score}</strong><div><h3>${q.passed ? '自动门禁已通过' : '暂不可提交正式发布'}</h3><p>建议阈值 ${q.threshold} 分，且无硬失败</p></div></div><section class="section-block"><h3>八维质量评分</h3><div class="gate-list">${Object.entries(q.score_breakdown).map(([key, value]) => `<div><span>${labels[key]}</span><i><b style="width:${Math.round(value / maxima[key] * 100)}%"></b></i><strong>${value}</strong></div>`).join('')}</div>${q.hard_failures.length ? `<div class="hard-failure"><b>硬门禁失败</b><br>${q.hard_failures.map(esc).join('<br>')}</div>` : '<div class="pass-message"><b>✓ 无硬门禁失败</b>，可以进入教师人工审核。</div>'}</section><section class="section-block"><h3>来源清单</h3>${currentPackage.sources.length ? currentPackage.sources.map(source => `<article class="objective-card"><span>${esc(source.id)} · ${esc(source.type)}</span><h4>${esc(source.title)}</h4><p>版本/日期：${esc(source.version_or_date)} · 适用：${esc(source.usage_scope)}</p></article>`).join('') : '<p>尚未提供来源。</p>'}</section>`;
}

$$('.result-tabs button').forEach(button => button.addEventListener('click', () => { activeTab = button.dataset.tab; renderResult(); }));

$('#teacherReview').addEventListener('click', () => {
  if (!currentPackage.quality.passed) return alert('当前草稿存在硬门禁失败。请返回补充来源材料后重新生成。');
  const transitions = { draft_ai: 'teacher_review', teacher_review: 'subject_review', subject_review: 'approved' };
  if (transitions[currentPackage.meta.status]) {
    currentPackage.meta.status = transitions[currentPackage.meta.status];
    currentPackage.governance.updated_at = new Date().toISOString();
    updateStatus();
  }
});

$('#newLesson').addEventListener('click', () => { resultShell.hidden = true; formShell.hidden = false; setStep(1); formShell.scrollIntoView({ behavior: 'smooth' }); });
$('#fillDemo').addEventListener('click', fillDemo);
$('#loadDemo').addEventListener('click', () => { fillDemo(); $('#workspace').scrollIntoView({ behavior: 'smooth' }); });

function saveDraft() {
  const drafts = loadDrafts();
  const next = [currentPackage, ...drafts.filter(item => item.meta.package_id !== currentPackage.meta.package_id)].slice(0, 10);
  localStorage.setItem('zhibeike-drafts', JSON.stringify(next));
  updateDraftCount();
  $('#saveDraft').textContent = '已保存 ✓';
  setTimeout(() => { $('#saveDraft').textContent = '保存草稿'; }, 1500);
}
function loadDrafts() { try { return JSON.parse(localStorage.getItem('zhibeike-drafts') || '[]'); } catch { return []; } }
function updateDraftCount() { $('#draftCount').textContent = loadDrafts().length; }
$('#saveDraft').addEventListener('click', saveDraft);

function download(name, content, type) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function toMarkdown(pkg) {
  const lesson = pkg.lessons[0];
  return `# ${pkg.meta.title}\n\n> 状态：${pkg.meta.status}｜版本：${pkg.meta.version}｜课程包：${pkg.meta.package_id}\n\n## Lesson Brief\n\n- 对象：${pkg.brief.audience}\n- 时长：${pkg.brief.total_duration_minutes} 分钟\n- 学习结果：${pkg.brief.learning_result}\n- 典型困难：${pkg.brief.typical_difficulty}\n\n## 来源包\n\n${pkg.sources.length ? pkg.sources.map(s => `- [${s.id}] ${s.title}`).join('\n') : '- SOURCE_GAP：未提供来源'}\n\n## 学习目标\n\n${pkg.objectives.map(o => `### ${o.id}\n${o.statement}\n\n**成功标准：** ${o.success_criteria}\n`).join('\n')}\n## 课堂流程\n\n${lesson.activities.map((a, i) => `### ${i + 1}. ${a.phase}（${a.minutes} 分钟）\n- 教师：${a.teacher}\n- 学生：${a.student}\n- 证据：${a.evidence}\n`).join('\n')}\n## 形成性评价\n\n${pkg.assessments.map(a => `- **${a.id}** ${a.prompt}\n  - 评分：${a.answer_or_rubric}`).join('\n')}\n\n## 质量门禁\n\n- 得分：${pkg.quality.score}/100\n- 结论：${pkg.quality.passed ? '自动门禁通过，待人工审核' : '未通过'}\n- 硬失败：${pkg.quality.hard_failures.join('；') || '无'}\n`;
}

$('#exportJson').addEventListener('click', () => download(`${currentPackage.meta.package_id}.json`, JSON.stringify(currentPackage, null, 2), 'application/json'));
$('#exportMd').addEventListener('click', () => download(`${currentPackage.meta.package_id}.md`, toMarkdown(currentPackage), 'text/markdown'));

function renderHistory() {
  const drafts = loadDrafts();
  $('#historyList').innerHTML = drafts.length ? drafts.map((pkg, index) => `<article class="history-item"><div><h3>${esc(pkg.meta.title)}</h3><p>${esc(pkg.meta.package_id)} · ${esc(pkg.meta.status)} · ${pkg.quality.score} 分</p></div><button data-draft="${index}">打开</button></article>`).join('') : '<div class="empty-history">还没有保存的草稿</div>';
  $$('[data-draft]').forEach(button => button.addEventListener('click', () => { currentPackage = drafts[Number(button.dataset.draft)]; historyDialog.close(); formShell.hidden = true; resultShell.hidden = false; renderResult(); setStep(3); resultShell.scrollIntoView({ behavior: 'smooth' }); }));
}
$('#historyBtn').addEventListener('click', () => { renderHistory(); historyDialog.showModal(); });
$('#closeHistory').addEventListener('click', () => historyDialog.close());
historyDialog.addEventListener('click', event => { if (event.target === historyDialog) historyDialog.close(); });

updateDraftCount();
fetch('/api/health').then(response => response.json()).then(data => { if (!data.ok) throw new Error(); }).catch(() => { $('.engine-state span').textContent = '服务连接异常'; $('.engine-state i').style.background = '#ad3c32'; });
