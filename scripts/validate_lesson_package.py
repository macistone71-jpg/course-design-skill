#!/usr/bin/env python3
"""Structural validator for an AI lesson package. Standard-library only."""
import json
import sys
from pathlib import Path

VALID_STATUS = {"draft_ai", "teacher_review", "subject_review", "approved", "published", "archived"}


def validate(data):
    errors, warnings = [], []
    for key in ("meta", "brief", "sources", "objectives", "lessons", "assessments", "quality", "governance"):
        if key not in data:
            errors.append(f"missing top-level field: {key}")
    if errors:
        return errors, warnings

    if data["meta"].get("status") not in VALID_STATUS:
        errors.append("meta.status is invalid")
    if not isinstance(data["brief"].get("total_duration_minutes"), (int, float)) or data["brief"].get("total_duration_minutes", 0) <= 0:
        errors.append("brief.total_duration_minutes must be positive")

    def ids(items, label):
        values = [x.get("id") for x in items]
        if None in values:
            errors.append(f"{label} contains item without id")
        if len(values) != len(set(values)):
            errors.append(f"{label} contains duplicate ids")
        return set(values)

    source_ids = ids(data["sources"], "sources")
    objective_ids = ids(data["objectives"], "objectives")
    assessment_ids = ids(data["assessments"], "assessments")
    ids(data["lessons"], "lessons")

    lesson_objectives, assessed_objectives = set(), set()
    lesson_minutes = 0
    for lesson in data["lessons"]:
        lesson_minutes += lesson.get("duration_minutes", 0)
        for oid in lesson.get("objective_ids", []):
            if oid not in objective_ids:
                errors.append(f"lesson {lesson.get('id')} references unknown objective {oid}")
            lesson_objectives.add(oid)
        for aid in lesson.get("assessment_ids", []):
            if aid not in assessment_ids:
                errors.append(f"lesson {lesson.get('id')} references unknown assessment {aid}")
        for activity in lesson.get("activities", []):
            for oid in activity.get("objective_ids", []):
                if oid not in objective_ids:
                    errors.append(f"activity {activity.get('id')} references unknown objective {oid}")

    for objective in data["objectives"]:
        for sid in objective.get("source_ids", []):
            if sid not in source_ids:
                errors.append(f"objective {objective.get('id')} references unknown source {sid}")

    for assessment in data["assessments"]:
        if not assessment.get("answer_or_rubric"):
            errors.append(f"assessment {assessment.get('id')} has no answer_or_rubric")
        for oid in assessment.get("objective_ids", []):
            if oid not in objective_ids:
                errors.append(f"assessment {assessment.get('id')} references unknown objective {oid}")
            assessed_objectives.add(oid)

    missing_in_lessons = objective_ids - lesson_objectives
    missing_in_assessment = objective_ids - assessed_objectives
    if missing_in_lessons:
        errors.append(f"objectives not covered by lessons: {sorted(missing_in_lessons)}")
    if missing_in_assessment:
        errors.append(f"objectives not assessed: {sorted(missing_in_assessment)}")
    if abs(lesson_minutes - data["brief"]["total_duration_minutes"]) > 1:
        warnings.append("sum of lesson duration differs from brief.total_duration_minutes")
    if data["meta"].get("status") in {"approved", "published"} and data["quality"].get("hard_failures"):
        errors.append("approved/published package still has hard failures")
    return errors, warnings


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: validate_lesson_package.py lesson-package.json")
    path = Path(sys.argv[1])
    data = json.loads(path.read_text(encoding="utf-8"))
    errors, warnings = validate(data)
    for msg in warnings:
        print(f"WARN: {msg}")
    for msg in errors:
        print(f"ERROR: {msg}")
    if errors:
        raise SystemExit(1)
    print("OK: lesson package structure is valid")


if __name__ == "__main__":
    main()
