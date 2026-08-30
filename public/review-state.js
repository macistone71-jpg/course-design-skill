(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ReviewState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const labels = {
    draft_ai: 'AI 草稿',
    teacher_review: '教师审核中',
    subject_review: '教研审核中',
    approved: '已批准'
  };
  const transitions = {
    draft_ai: 'teacher_review',
    teacher_review: 'subject_review',
    subject_review: 'approved'
  };
  const phase = { draft_ai: 0, teacher_review: 1, subject_review: 2, approved: 3 };

  function next(status) { return transitions[status] || status; }
  function label(status) { return labels[status] || status; }
  function isApproved(status) { return status === 'approved'; }
  function progress(status) { return phase[status] ?? 0; }
  function conclusion(pkg) {
    if (pkg?.meta?.status === 'approved') return '教师与教研审核已完成，可作为最终教案使用';
    if (pkg?.quality?.passed) return '自动门禁通过，待人工审核';
    return '质量门禁未通过';
  }

  return { next, label, isApproved, progress, conclusion };
});
