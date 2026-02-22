import {
  AUTO_TOP_GRADES_BY_CLASS,
  BOARD_KEYS,
  GRADE_OPTIONS,
  type Competition,
  type Grade,
  type ScoreSummary,
} from "./types";

export const gradePoints: Record<Grade, number> = {
  "8Q": 100,
  "7Q": 200,
  "6Q": 300,
  "5Q": 400,
  "4Q": 500,
  "3Q": 650,
  "2Q": 1050,
  "1Q": 1400,
  "1D": 2500,
  "2D": 4000,
};

export const boardPoints: Record<(typeof BOARD_KEYS)[number], number> = {
  "8Q-91": 100,
  "7Q-92": 200,
  "6Q-93": 300,
  "5Q-94": 400,
  "4Q-95": 500,
  "3Q-96": 650,
  "3Q-97": 650,
  "2Q-98": 1050,
};

const rankRules: Array<{ min: number; max: number; label: string }> = [
  { min: 0, max: 2999, label: "ノービス" },
  { min: 3000, max: 3999, label: "I" },
  { min: 4000, max: 4999, label: "H" },
  { min: 5000, max: 5999, label: "G" },
  { min: 6000, max: 6999, label: "F" },
  { min: 7000, max: 7999, label: "E" },
  { min: 8000, max: 8999, label: "D" },
  { min: 9000, max: 10999, label: "C" },
  { min: 11000, max: 13999, label: "B" },
  { min: 14000, max: 17499, label: "A" },
  { min: 17500, max: 26999, label: "S" },
  { min: 27000, max: 39999, label: "エキスパート" },
  { min: 40000, max: Number.POSITIVE_INFINITY, label: "アルティメット" },
];

export const getRankLabel = (points: number): string => {
  const match = rankRules.find((rule) => points >= rule.min && points <= rule.max);
  return match ? match.label : "-";
};

export const calculateScore = (competition: Competition): ScoreSummary => {
  const gradeTotals = GRADE_OPTIONS.reduce((acc, grade) => {
    acc[grade] = 0;
    return acc;
  }, {} as Record<Grade, number>);
  const autoTopGradeTotals = GRADE_OPTIONS.reduce((acc, grade) => {
    acc[grade] = 0;
    return acc;
  }, {} as Record<Grade, number>);

  const toppedProblems = competition.problems.filter((problem) => problem.topped);
  for (const problem of toppedProblems) {
    gradeTotals[problem.grade] += 1;
  }

  const autoTopGrades = AUTO_TOP_GRADES_BY_CLASS[competition.participationClass] ?? [];
  for (const grade of autoTopGrades) {
    const count = Math.max(0, Math.floor(competition.autoTopCounts?.[grade] ?? 0));
    autoTopGradeTotals[grade] = count;
    gradeTotals[grade] += count;
  }

  const autoTopPointsTotal = GRADE_OPTIONS.reduce((sum, grade) => {
    return sum + autoTopGradeTotals[grade] * gradePoints[grade];
  }, 0);

  const problemPointsTotal = toppedProblems.reduce((sum, problem) => {
    return sum + gradePoints[problem.grade];
  }, 0);

  const gradePointsTotal = GRADE_OPTIONS.reduce((sum, grade) => {
    return sum + gradeTotals[grade] * gradePoints[grade];
  }, 0);

  const boardPointsTotal = BOARD_KEYS.reduce((sum, key) => {
    return sum + (competition.boardStates[key] ? boardPoints[key] : 0);
  }, 0);

  const boardTriesTotal = BOARD_KEYS.reduce((sum, key) => {
    if (!competition.boardStates[key]) return sum;
    return sum + (competition.boardTries[key] ?? 0);
  }, 0);

  const totalPoints = gradePointsTotal + boardPointsTotal;
  const totalTries =
    competition.problems.reduce((sum, problem) => sum + problem.triesTotal, 0) + boardTriesTotal;
  const pointsPerTryBase = totalPoints - autoTopPointsTotal;
  const pointsPerTry = totalTries === 0 ? 0 : pointsPerTryBase / totalTries;

  return {
    gradeTotals,
    autoTopGradeTotals,
    autoTopPointsTotal,
    problemPointsTotal,
    gradePointsTotal,
    boardPointsTotal,
    boardTriesTotal,
    totalPoints,
    rank: getRankLabel(totalPoints),
    totalTries,
    pointsPerTry,
    totalToppedCount: toppedProblems.length + autoTopGrades.reduce((sum, grade) => sum + autoTopGradeTotals[grade], 0),
    toppedProblems,
  };
};
