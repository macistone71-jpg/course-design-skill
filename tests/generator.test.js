'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { generateLessonPackage, validateInput, distributeMinutes } = require('../src/generator');

const validInput = {
  topic: '光合作用与生态系统能量流动',
  subject: '生物',
  grade: '七年级',
  duration: 45,
  deliveryMode: '面授',
  learningResult: '学生能用食物网解释能量如何在生态系统中流动',
  audience: '七年级学生，已学习生物与非生物因素',
  sourcesText: '义务教育生物学课程标准（2022年版）\n七年级生物教材第三单元'
};

test('validates required fields and duration', () => {
  assert.equal(validateInput(validInput).length, 0);
  assert.ok(validateInput({}).length >= 4);
  assert.ok(validateInput({ ...validInput, duration: 8 }).some(item => item.includes('20–180')));
});

test('activity minutes always equal lesson duration', () => {
  for (const duration of [20, 45, 90, 180]) {
    assert.equal(distributeMinutes(duration).reduce((sum, value) => sum + value, 0), duration);
  }
});

test('generated package covers every objective and assessment', () => {
  const pkg = generateLessonPackage(validInput);
  const objectiveIds = new Set(pkg.objectives.map(item => item.id));
  const covered = new Set(pkg.lessons.flatMap(lesson => lesson.objective_ids));
  const assessed = new Set(pkg.assessments.flatMap(item => item.objective_ids));
  assert.deepEqual(covered, objectiveIds);
  assert.deepEqual(assessed, objectiveIds);
  assert.equal(pkg.lessons[0].activities.reduce((sum, item) => sum + item.minutes, 0), 45);
  assert.equal(pkg.quality.hard_failures.length, 0);
  assert.equal(pkg.quality.passed, true);
});

test('missing sources triggers a hard quality gate', () => {
  const pkg = generateLessonPackage({ ...validInput, sourcesText: '' });
  assert.equal(pkg.meta.status, 'draft_ai');
  assert.equal(pkg.quality.passed, false);
  assert.ok(pkg.quality.hard_failures[0].includes('SOURCE_GAP'));
});
