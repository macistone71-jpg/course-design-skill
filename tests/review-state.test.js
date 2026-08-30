'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const review = require('../public/review-state.js');

test('review state advances through teacher and subject approval', () => {
  assert.equal(review.next('draft_ai'), 'teacher_review');
  assert.equal(review.next('teacher_review'), 'subject_review');
  assert.equal(review.next('subject_review'), 'approved');
  assert.equal(review.next('approved'), 'approved');
});

test('approved package has a final lesson conclusion', () => {
  const pkg = { meta: { status: 'approved' }, quality: { passed: true } };
  assert.equal(review.isApproved(pkg.meta.status), true);
  assert.equal(review.progress(pkg.meta.status), 3);
  assert.match(review.conclusion(pkg), /最终教案/);
});
