import { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import HomeRoute from "./routes/home";
import CompetitionNewRoute from "./routes/competition-new";
import CompetitionDetailRoute from "./routes/competition-detail";
import {
  BOARD_KEYS,
  type AppState,
  type BoardStates,
  type BoardTries,
  type Competition,
  type ProblemAttempt,
} from "./lib/types";
import { canUseStorage, loadState, saveState } from "./lib/storage";
import { v4 as uuid } from "uuid";

const defaultBoardStates = (): BoardStates =>
  BOARD_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as BoardStates);

const defaultBoardTries = (): BoardTries =>
  BOARD_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as BoardTries);

const nowIso = () => new Date().toISOString();

const createEmptyState = (): AppState => ({
  version: 1,
  competitions: [],
  updatedAt: nowIso(),
});

const initState = (): AppState => {
  if (!canUseStorage()) return createEmptyState();
  const loaded = loadState();
  if (!loaded) return createEmptyState();
  if (!loaded.version || !Array.isArray(loaded.competitions)) return createEmptyState();
  const competitions = loaded.competitions.map((competition) => ({
    ...competition,
    boardStates: competition.boardStates ?? defaultBoardStates(),
    boardTries: competition.boardTries ?? defaultBoardTries(),
  }));
  return { ...loaded, competitions };
};

const buildCompetition = (title: string, eventDate: string): Competition => {
  const timestamp = nowIso();
  return {
    id: `cmp_${uuid()}`,
    title,
    eventDate,
    problems: [],
    boardStates: defaultBoardStates(),
    boardTries: defaultBoardTries(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const buildProblem = (payload: Omit<ProblemAttempt, "id" | "createdAt" | "updatedAt">): ProblemAttempt => {
  const timestamp = nowIso();
  return {
    id: `prb_${uuid()}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...payload,
  };
};

function App() {
  const [state, setState] = useState<AppState>(initState);
  const [storageAvailable] = useState(canUseStorage());

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      const withTimestamp = { ...next, updatedAt: nowIso() };
      saveState(withTimestamp);
      return withTimestamp;
    });
  };

  const actions = useMemo(
    () => ({
      createCompetition: (title: string, eventDate: string) => {
        const competition = buildCompetition(title, eventDate);
        updateState((prev) => ({
          ...prev,
          competitions: [...prev.competitions, competition],
        }));
        return competition.id;
      },
      updateCompetitionMeta: (id: string, updates: Partial<Pick<Competition, "title" | "eventDate">>) => {
        updateState((prev) => ({
          ...prev,
          competitions: prev.competitions.map((competition) =>
            competition.id === id
              ? {
                  ...competition,
                  ...updates,
                  updatedAt: nowIso(),
                }
              : competition
          ),
        }));
      },
      deleteCompetition: (id: string) => {
        updateState((prev) => ({
          ...prev,
          competitions: prev.competitions.filter((competition) => competition.id !== id),
        }));
      },
      addProblem: (competitionId: string, payload: Omit<ProblemAttempt, "id" | "createdAt" | "updatedAt">) => {
        const newProblem = buildProblem(payload);
        updateState((prev) => ({
          ...prev,
          competitions: prev.competitions.map((competition) =>
            competition.id === competitionId
              ? {
                  ...competition,
                  problems: [...competition.problems, newProblem],
                  updatedAt: nowIso(),
                }
              : competition
          ),
        }));
      },
      updateProblem: (
        competitionId: string,
        problemId: string,
        payload: Partial<Omit<ProblemAttempt, "id" | "createdAt">>
      ) => {
        updateState((prev) => ({
          ...prev,
          competitions: prev.competitions.map((competition) =>
            competition.id === competitionId
              ? {
                  ...competition,
                  problems: competition.problems.map((problem) =>
                    problem.id === problemId
                      ? {
                          ...problem,
                          ...payload,
                          updatedAt: nowIso(),
                        }
                      : problem
                  ),
                  updatedAt: nowIso(),
                }
              : competition
          ),
        }));
      },
      deleteProblem: (competitionId: string, problemId: string) => {
        updateState((prev) => ({
          ...prev,
          competitions: prev.competitions.map((competition) =>
            competition.id === competitionId
              ? {
                  ...competition,
                  problems: competition.problems.filter((problem) => problem.id !== problemId),
                  updatedAt: nowIso(),
                }
              : competition
          ),
        }));
      },
      toggleBoard: (competitionId: string, key: keyof BoardStates) => {
        updateState((prev) => ({
          ...prev,
          competitions: prev.competitions.map((competition) =>
            competition.id === competitionId
              ? {
                  ...competition,
                  boardTries: {
                    ...competition.boardTries,
                    [key]:
                      competition.boardStates[key] || (competition.boardTries[key] ?? 0) > 0
                        ? competition.boardTries[key] ?? 0
                        : 1,
                  },
                  boardStates: {
                    ...competition.boardStates,
                    [key]: !competition.boardStates[key],
                  },
                  updatedAt: nowIso(),
                }
              : competition
          ),
        }));
      },
      adjustBoardTries: (competitionId: string, key: keyof BoardStates, delta: number) => {
        updateState((prev) => ({
          ...prev,
          competitions: prev.competitions.map((competition) =>
            competition.id === competitionId
              ? {
                  ...competition,
                  boardTries: {
                    ...competition.boardTries,
                    [key]: Math.max(
                      competition.boardStates[key] ? 1 : 0,
                      (competition.boardTries[key] ?? 0) + delta
                    ),
                  },
                  updatedAt: nowIso(),
                }
              : competition
          ),
        }));
      },
      setBoardAll: (competitionId: string, value: boolean) => {
        updateState((prev) => ({
          ...prev,
          competitions: prev.competitions.map((competition) =>
            competition.id === competitionId
              ? {
                  ...competition,
                  boardStates: BOARD_KEYS.reduce((acc, key) => {
                    acc[key] = value;
                    return acc;
                  }, {} as BoardStates),
                  boardTries: BOARD_KEYS.reduce((acc, key) => {
                    acc[key] = value ? Math.max(1, competition.boardTries[key] ?? 0) : 0;
                    return acc;
                  }, {} as BoardTries),
                  updatedAt: nowIso(),
                }
              : competition
          ),
        }));
      },
      hydrateState: (nextState: AppState) => {
        setState(nextState);
        saveState(nextState);
      },
    }),
    []
  );

  return (
    <div className="min-h-screen">
      {!storageAvailable && (
        <div className="sticky top-0 z-40 bg-amber-200 text-amber-900 text-sm px-4 py-2">
          localStorageが利用できません。入力内容は保存されない可能性があります。
        </div>
      )}
      <Routes>
        <Route path="/" element={<HomeRoute state={state} />} />
        <Route path="/competitions/new" element={<CompetitionNewRoute actions={actions} />} />
        <Route
          path="/competitions/:id"
          element={<CompetitionDetailRoute state={state} actions={actions} />}
        />
      </Routes>
    </div>
  );
}

export default App;
