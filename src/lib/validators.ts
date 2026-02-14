import { GRADE_OPTIONS, type ProblemAttempt, type Competition } from "./types";

export type ValidationErrors = Record<string, string>;

export const validateProblem = (input: Omit<ProblemAttempt, "id" | "createdAt" | "updatedAt">): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!input.label.trim()) {
    errors.label = "ラベルは必須です。";
  }
  if (!GRADE_OPTIONS.includes(input.grade)) {
    errors.grade = "グレードが不正です。";
  }
  if (!Number.isInteger(input.triesTotal) || input.triesTotal < 0) {
    errors.triesTotal = "トライ数は0以上の整数です。";
  }
  if (input.topped) {
    if (input.triesToTop === null || input.triesToTop === undefined) {
      errors.triesToTop = "完登までのトライ数を入力してください。";
    } else if (!Number.isInteger(input.triesToTop) || input.triesToTop < 1) {
      errors.triesToTop = "完登までのトライ数は1以上の整数です。";
    } else if (input.triesToTop > input.triesTotal) {
      errors.triesToTop = "完登までのトライ数は総トライ数以下です。";
    }
  }
  return errors;
};

export const validateCompetition = (input: Pick<Competition, "title">): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!input.title.trim()) {
    errors.title = "大会名は必須です。";
  }
  return errors;
};
