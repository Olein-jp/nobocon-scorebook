export const GRADE_OPTIONS = ["2D", "1D", "1Q", "2Q", "3Q", "4Q", "5Q", "6Q", "7Q", "8Q"] as const;
export type Grade = (typeof GRADE_OPTIONS)[number];

export const BOARD_KEYS = [
  "8Q-91",
  "7Q-92",
  "6Q-93",
  "5Q-94",
  "4Q-95",
  "3Q-96",
  "3Q-97",
  "2Q-98",
] as const;
export type BoardKey = (typeof BOARD_KEYS)[number];

export type BoardStates = Record<BoardKey, boolean>;
export type BoardTries = Record<BoardKey, number>;

export type ProblemAttempt = {
  id: string;
  label: string;
  grade: Grade;
  triesTotal: number;
  topped: boolean;
  triesToTop: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Competition = {
  id: string;
  title: string;
  eventDate: string;
  problems: ProblemAttempt[];
  boardStates: BoardStates;
  boardTries: BoardTries;
  createdAt: string;
  updatedAt: string;
};

export type AppState = {
  version: number;
  competitions: Competition[];
  updatedAt: string;
};

export type ScoreSummary = {
  gradeTotals: Record<Grade, number>;
  gradePointsTotal: number;
  boardPointsTotal: number;
  boardTriesTotal: number;
  totalPoints: number;
  rank: string;
  totalTries: number;
  pointsPerTry: number;
  toppedProblems: ProblemAttempt[];
};
