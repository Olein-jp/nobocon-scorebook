import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import Tabs from "../components/Tabs";
import ProblemEditorSheet, { type ProblemFormInput } from "../components/ProblemEditorSheet";
import BoardToggleGroup from "../components/BoardToggleGroup";
import ScoreSummary from "../components/ScoreSummary";
import ScoreCard from "../components/ScoreCard";
import { calculateScore, gradePoints } from "../lib/scoring";
import { BOARD_KEYS, type AppState, type BoardStates, type Competition, type ProblemAttempt } from "../lib/types";
import { validateCompetition } from "../lib/validators";
import { exportElementToPng } from "../lib/exportPng";

const todayString = () => new Date().toISOString().slice(0, 10);

type Actions = {
  updateCompetitionMeta: (id: string, updates: Partial<Pick<Competition, "title" | "eventDate">>) => void;
  deleteCompetition: (id: string) => void;
  addProblem: (competitionId: string, payload: ProblemFormInput) => void;
  updateProblem: (competitionId: string, problemId: string, payload: Partial<Omit<ProblemAttempt, "id" | "createdAt">>) => void;
  deleteProblem: (competitionId: string, problemId: string) => void;
  toggleBoard: (competitionId: string, key: keyof BoardStates) => void;
  adjustBoardTries: (competitionId: string, key: keyof BoardStates, delta: number) => void;
  setBoardAll: (competitionId: string, value: boolean) => void;
  hydrateState: (nextState: AppState) => void;
};

const downloadJson = (data: AppState) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nobocon_scorebook_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const validateImportState = (data: AppState): string | null => {
  if (!data || typeof data !== "object") return "JSONが不正です。";
  if (data.version !== 1) return "バージョンが不正です。";
  if (!Array.isArray(data.competitions)) return "大会データが不正です。";
  for (const competition of data.competitions) {
    if (!competition || typeof competition !== "object") return "大会データが不正です。";
    if (!competition.id || !competition.title) return "大会データが不正です。";
    if (!Array.isArray(competition.problems)) return "課題データが不正です。";
    if (!competition.boardStates || typeof competition.boardStates !== "object") return "ボードデータが不正です。";
  }
  return null;
};

const normalizeImportState = (data: AppState): AppState => {
  const competitions = data.competitions.map((competition) => ({
    ...competition,
    boardTries: BOARD_KEYS.reduce((acc, key) => {
      acc[key] = competition.boardTries?.[key] ?? 0;
      return acc;
    }, {} as Record<(typeof BOARD_KEYS)[number], number>),
  }));
  return { ...data, competitions };
};

export default function CompetitionDetailRoute({ state, actions }: { state: AppState; actions: Actions }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const competition = state.competitions.find((item) => item.id === id);

  const [activeTab, setActiveTab] = useState("problems");
  const [metaEditMode, setMetaEditMode] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState(competition?.title ?? "");
  const [metaDate, setMetaDate] = useState(competition?.eventDate ?? todayString());
  const [metaErrors, setMetaErrors] = useState<Record<string, string>>({});
  const [importError, setImportError] = useState<string | null>(null);
  const [undoInfo, setUndoInfo] = useState<ProblemAttempt | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreCardRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(() => (competition ? calculateScore(competition) : null), [competition]);

  if (!competition) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-sm text-ink-700">大会が見つかりません。</p>
        <Link className="mt-4 inline-block text-sm text-ink-800 underline" to="/">
          一覧へ戻る
        </Link>
      </div>
    );
  }

  const handleSaveMeta = () => {
    const validation = validateCompetition({ title: metaTitle });
    setMetaErrors(validation);
    if (Object.keys(validation).length > 0) return;
    actions.updateCompetitionMeta(competition.id, {
      title: metaTitle.trim(),
      eventDate: metaDate,
    });
    setMetaEditMode(false);
  };

  const handleDeleteCompetition = () => {
    if (!window.confirm("この大会を削除しますか？")) return;
    actions.deleteCompetition(competition.id);
    navigate("/");
  };

  const handleAddProblem = () => {
    setSheetOpen(true);
  };

  const handleSaveProblem = (payload: ProblemFormInput) => {
    actions.addProblem(competition.id, payload);
  };

  const handleDeleteProblem = (problemId: string) => {
    if (!window.confirm("この課題を削除しますか？")) return;
    const target = competition.problems.find((problem) => problem.id === problemId);
    actions.deleteProblem(competition.id, problemId);
    if (target) {
      setUndoInfo(target);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      undoTimerRef.current = setTimeout(() => {
        setUndoInfo(null);
        undoTimerRef.current = null;
      }, 5000);
    }
  };

  const adjustProblemTries = (problem: ProblemAttempt, delta: number) => {
    const minValue = problem.topped ? 1 : 0;
    const nextTries = Math.max(minValue, problem.triesTotal + delta);
    actions.updateProblem(competition.id, problem.id, {
      triesTotal: nextTries,
      triesToTop: problem.topped ? nextTries : null,
    });
  };

  const toggleProblemTopped = (problem: ProblemAttempt) => {
    const nextTopped = !problem.topped;
    const nextTries = Math.max(nextTopped ? 1 : 0, problem.triesTotal);
    actions.updateProblem(competition.id, problem.id, {
      topped: nextTopped,
      triesTotal: nextTries,
      triesToTop: nextTopped ? nextTries : null,
    });
  };

  const handleUndoDelete = () => {
    if (!undoInfo) return;
    actions.addProblem(competition.id, {
      label: undoInfo.label,
      grade: undoInfo.grade,
      triesTotal: undoInfo.triesTotal,
      topped: undoInfo.topped,
      triesToTop: undoInfo.triesToTop,
    });
    setUndoInfo(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const handleExportPng = async () => {
    if (!scoreCardRef.current) return;
    await exportElementToPng(scoreCardRef.current, `${competition.title}_score.png`);
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppState;
        const error = validateImportState(parsed);
        if (error) {
          setImportError(error);
          return;
        }
        actions.hydrateState(normalizeImportState(parsed));
        setImportError(null);
      } catch {
        setImportError("JSONの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  const problemTab = (
    <div className="mt-6 space-y-4">
      {summary && summary.totalPoints > 0 && (
        <div className="rounded-2xl border border-mint-300/70 bg-mint-100/80 px-4 py-2 text-center text-xs font-semibold text-ink-700">
          今のスコア（{summary.totalPoints}pt）ならランク{summary.rank}獲得
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-950">課題一覧</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-night"
            onClick={handleAddProblem}
          >
            ＋ 課題追加
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {competition.problems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-mint-500/60 bg-mint-100/70 p-4 text-sm text-ink-700">
            まだ課題がありません。「課題追加」から追加してください。
          </div>
        )}

        {competition.problems.map((problem) => (
          <div
            key={problem.id}
            className={`soft-card p-4 ${problem.topped ? "border-accent-500/70" : ""}`}
          >
            <div className="grid gap-3 grid-cols-[1fr_auto_auto] items-center">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  <span className="text-moss-600">{problem.grade}</span> - {problem.label}
                </p>
                <p className="mt-1 text-xs text-ink-600">
                  獲得ポイント: {problem.topped ? gradePoints[problem.grade] : 0}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
                <button
                  type="button"
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                    problem.topped
                      ? "border-accent-500/80 bg-accent-500 text-night shadow-[0_0_0_2px_rgba(203,255,79,0.18)]"
                      : "border-mint-300 bg-mint-50 text-ink-700"
                  }`}
                  onClick={() => toggleProblemTopped(problem)}
                  aria-pressed={problem.topped}
                >
                  完登済み
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                    problem.topped
                      ? "border-mint-300 bg-mint-50 text-ink-700"
                      : "border-accent-500/70 bg-mint-100 text-ink-600 shadow-[0_0_0_2px_rgba(203,255,79,0.14)]"
                  }`}
                  onClick={() => toggleProblemTopped(problem)}
                  aria-pressed={!problem.topped}
                >
                  未完登
                </button>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-red-400/55 bg-mint-100 px-3 py-1 text-xs font-semibold text-red-300"
                onClick={() => handleDeleteProblem(problem.id)}
                aria-label="課題を削除"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-mint-300 bg-mint-50 px-3 py-2">
              <div>
                <p className="text-xs text-ink-600">トライ数</p>
                <p className="text-lg font-semibold text-ink-900">{problem.triesTotal}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-10 w-10 rounded-full border border-mint-300 bg-mint-100 text-lg"
                  onClick={() => adjustProblemTries(problem, -1)}
                  aria-label="トライ数を減らす"
                >
                  <Minus aria-hidden="true" className="mx-auto h-4 w-4" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full border border-mint-300 bg-mint-100 text-lg"
                  onClick={() => adjustProblemTries(problem, 1)}
                  aria-label="トライ数を増やす"
                >
                  <Plus aria-hidden="true" className="mx-auto h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BoardToggleGroup
        states={competition.boardStates}
        tries={competition.boardTries}
        onToggle={(key) => actions.toggleBoard(competition.id, key)}
        onAdjustTries={(key, delta) => actions.adjustBoardTries(competition.id, key, delta)}
        onToggleAll={(value) => actions.setBoardAll(competition.id, value)}
      />
    </div>
  );

  const scoreTab = (
    <div className="mt-6 space-y-4">
      {summary && <ScoreSummary summary={summary} />}
      {summary && (
        <div className="soft-card p-4">
          <p className="text-sm font-semibold text-ink-900">完登課題一覧</p>
          {summary.toppedProblems.length === 0 ? (
            <p className="mt-2 text-sm text-ink-600">完登課題がまだありません。</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              {summary.toppedProblems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between rounded-xl border border-mint-300 bg-mint-50 px-3 py-2">
                  <div>
                    <p className="font-semibold">
                      <span className="text-moss-600">{problem.grade}</span> - {problem.label}
                    </p>
                  </div>
                  <p className="text-xs text-ink-600">+{gradePoints[problem.grade]}pt</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="soft-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">スコアカード</p>
            <p className="text-xs text-ink-600">PNGとして保存できます。</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-accent-500 px-3 py-2 text-xs font-semibold text-night transition hover:bg-accent-600"
            onClick={handleExportPng}
          >
            画像として保存
          </button>
        </div>
        {summary && (
          <div className="mt-4">
            <ScoreCard ref={scoreCardRef} competition={competition} summary={summary} />
          </div>
        )}
      </div>

      <div className="soft-card p-4">
        <p className="text-sm font-semibold text-ink-900">バックアップ</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-mint-300 bg-mint-50 px-3 py-2 text-xs font-semibold text-ink-800"
            onClick={() => downloadJson(state)}
          >
            JSON書き出し
          </button>
          <label className="cursor-pointer rounded-full border border-mint-300 bg-mint-50 px-3 py-2 text-xs font-semibold text-ink-800">
            JSON読み込み
            <input type="file" accept="application/json" className="hidden" onChange={handleImportJson} />
          </label>
        </div>
        {importError && <p className="mt-2 text-sm text-red-600" aria-live="polite">{importError}</p>}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <header className="flex flex-col gap-3 border-b border-mint-300/80 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="text-xs uppercase tracking-[0.35em] text-ink-600">
            ← 一覧へ戻る
          </Link>
          {metaEditMode ? (
            <div className="mt-2 space-y-2">
              <input
                className="w-full rounded-xl border border-mint-300 bg-mint-50 px-3 py-2 text-base"
                value={metaTitle}
                onChange={(event) => setMetaTitle(event.target.value)}
              />
              <input
                type="date"
                className="w-full rounded-xl border border-mint-300 bg-mint-50 px-3 py-2 text-base"
                value={metaDate}
                onChange={(event) => setMetaDate(event.target.value)}
              />
              {metaErrors.title && (
                <p className="text-sm text-red-600" aria-live="polite">{metaErrors.title}</p>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <h1 className="font-display text-2xl text-ink-950">{competition.title}</h1>
              <p className="text-sm text-ink-600">{competition.eventDate || "日付未設定"}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {metaEditMode ? (
            <>
              <button
                type="button"
                className="rounded-full border border-mint-300 bg-mint-50 px-4 py-2 text-xs font-semibold text-ink-800"
                onClick={() => setMetaEditMode(false)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="rounded-full bg-accent-500 px-4 py-2 text-xs font-semibold text-night transition hover:bg-accent-600"
                onClick={handleSaveMeta}
              >
                保存
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-full border border-mint-300 bg-mint-50 px-4 py-2 text-xs font-semibold text-ink-800"
              onClick={() => {
                setMetaEditMode(true);
                setMetaTitle(competition.title);
                setMetaDate(competition.eventDate || todayString());
              }}
            >
              編集
            </button>
          )}
        </div>
      </header>

      <Tabs
        items={[
          {
            id: "problems",
            label: "課題",
            content: problemTab,
          },
          {
            id: "score",
            label: "スコア",
            content: scoreTab,
          },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />


      <div className="mt-8">
        <button
          type="button"
          className="w-full rounded-2xl border border-red-400/55 bg-mint-100 px-4 py-3 text-sm font-semibold text-red-300"
          onClick={handleDeleteCompetition}
        >
          この大会を削除
        </button>
      </div>

      <ProblemEditorSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSaveProblem}
      />

      {undoInfo && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-mint-300/85 bg-mint-100 px-4 py-3 text-sm text-ink-800 shadow-card">
          <span>課題を削除しました</span>
          <button
            type="button"
            className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-night"
            onClick={handleUndoDelete}
          >
            元に戻す
          </button>
        </div>
      )}
    </div>
  );
}
