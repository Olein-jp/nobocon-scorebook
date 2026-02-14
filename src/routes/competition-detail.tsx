import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const [problemEditMode, setProblemEditMode] = useState(false);
  const [metaEditMode, setMetaEditMode] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemAttempt | null>(null);
  const [metaTitle, setMetaTitle] = useState(competition?.title ?? "");
  const [metaDate, setMetaDate] = useState(competition?.eventDate ?? todayString());
  const [metaErrors, setMetaErrors] = useState<Record<string, string>>({});
  const [importError, setImportError] = useState<string | null>(null);
  const scoreCardRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(() => (competition ? calculateScore(competition) : null), [competition]);

  if (!competition) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-sm text-ink-600">大会が見つかりません。</p>
        <Link className="mt-4 inline-block text-sm text-ink-700 underline" to="/">
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
    setEditingProblem(null);
    setSheetOpen(true);
  };

  const handleEditProblem = (problem: ProblemAttempt) => {
    setEditingProblem(problem);
    setSheetOpen(true);
  };

  const handleSaveProblem = (payload: ProblemFormInput) => {
    if (editingProblem) {
      actions.updateProblem(competition.id, editingProblem.id, payload);
    } else {
      actions.addProblem(competition.id, payload);
    }
  };

  const handleDeleteProblem = (problemId: string) => {
    if (!window.confirm("この課題を削除しますか？")) return;
    actions.deleteProblem(competition.id, problemId);
  };

  const adjustProblemTries = (problem: ProblemAttempt, delta: number) => {
    const minValue = problem.topped ? 1 : 0;
    const nextTries = Math.max(minValue, problem.triesTotal + delta);
    actions.updateProblem(competition.id, problem.id, {
      triesTotal: nextTries,
      triesToTop: problem.topped ? nextTries : null,
    });
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
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">課題一覧</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold"
            onClick={() => setProblemEditMode((prev) => !prev)}
          >
            {problemEditMode ? "閲覧モード" : "編集モード"}
          </button>
          {problemEditMode && (
            <button
              type="button"
              className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white"
              onClick={handleAddProblem}
            >
              ＋ 課題追加
            </button>
          )}
        </div>
      </div>

      <BoardToggleGroup
        states={competition.boardStates}
        tries={competition.boardTries}
        onToggle={(key) => actions.toggleBoard(competition.id, key)}
        onAdjustTries={(key, delta) => actions.adjustBoardTries(competition.id, key, delta)}
        onToggleAll={(value) => actions.setBoardAll(competition.id, value)}
      />

      <div className="space-y-3">
        {competition.problems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-500/30 bg-white/70 p-4 text-sm text-ink-600">
            まだ課題がありません。編集モードで追加してください。
          </div>
        )}

        {competition.problems.map((problem) => (
          <div key={problem.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">P{problem.label}</p>
                <p className="text-xs text-ink-500">{problem.grade}</p>
              </div>
              <div className="text-right text-xs text-ink-500">
                <p>{problem.topped ? "完登済み" : "未完登"}</p>
                <p>獲得ポイント: {problem.topped ? gradePoints[problem.grade] : 0}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-ink-200 bg-white px-3 py-2">
              <div>
                <p className="text-xs text-ink-500">トライ数</p>
                <p className="text-lg font-semibold">{problem.triesTotal}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-10 w-10 rounded-full border border-ink-200 text-lg"
                  onClick={() => adjustProblemTries(problem, -1)}
                >
                  −
                </button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full border border-ink-200 text-lg"
                  onClick={() => adjustProblemTries(problem, 1)}
                >
                  ＋
                </button>
              </div>
            </div>

            {problemEditMode && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-full border border-ink-200 px-3 py-2 text-xs font-semibold"
                  onClick={() => handleEditProblem(problem)}
                >
                  編集
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                  onClick={() => handleDeleteProblem(problem.id)}
                >
                  削除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const scoreTab = (
    <div className="mt-6 space-y-4">
      {summary && <ScoreSummary summary={summary} />}
      {summary && (
        <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card">
          <p className="text-sm font-semibold">完登課題一覧</p>
          {summary.toppedProblems.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">完登課題がまだありません。</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              {summary.toppedProblems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2">
                  <div>
                    <p className="font-semibold">P{problem.label}</p>
                    <p className="text-xs text-ink-500">{problem.grade}</p>
                  </div>
                  <p className="text-xs text-ink-500">+{gradePoints[problem.grade]}pt</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">スコアカード</p>
            <p className="text-xs text-ink-500">PNGとして保存できます。</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-ink-900 px-3 py-2 text-xs font-semibold text-white"
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

      <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card">
        <p className="text-sm font-semibold">バックアップ</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-ink-200 px-3 py-2 text-xs font-semibold"
            onClick={() => downloadJson(state)}
          >
            JSON書き出し
          </button>
          <label className="rounded-full border border-ink-200 px-3 py-2 text-xs font-semibold cursor-pointer">
            JSON読み込み
            <input type="file" accept="application/json" className="hidden" onChange={handleImportJson} />
          </label>
        </div>
        {importError && <p className="mt-2 text-sm text-red-600" aria-live="polite">{importError}</p>}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="text-xs uppercase tracking-[0.4em] text-ink-500">
            ← 一覧へ戻る
          </Link>
          {metaEditMode ? (
            <div className="mt-2 space-y-2">
              <input
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-base"
                value={metaTitle}
                onChange={(event) => setMetaTitle(event.target.value)}
              />
              <input
                type="date"
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-base"
                value={metaDate}
                onChange={(event) => setMetaDate(event.target.value)}
              />
              {metaErrors.title && (
                <p className="text-sm text-red-600" aria-live="polite">{metaErrors.title}</p>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <h1 className="font-display text-2xl">{competition.title}</h1>
              <p className="text-sm text-ink-500">{competition.eventDate || "日付未設定"}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {metaEditMode ? (
            <>
              <button
                type="button"
                className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold"
                onClick={() => setMetaEditMode(false)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white"
                onClick={handleSaveMeta}
              >
                保存
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold"
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
          { id: "problems", label: "課題", content: problemTab },
          { id: "score", label: "スコア", content: scoreTab },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-8">
        <button
          type="button"
          className="w-full rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
          onClick={handleDeleteCompetition}
        >
          この大会を削除
        </button>
      </div>

      <ProblemEditorSheet
        open={sheetOpen}
        initial={
          editingProblem
            ? {
                label: editingProblem.label,
                grade: editingProblem.grade,
                triesTotal: editingProblem.triesTotal,
                topped: editingProblem.topped,
                triesToTop: editingProblem.triesToTop,
              }
            : undefined
        }
        onClose={() => setSheetOpen(false)}
        onSave={handleSaveProblem}
      />
    </div>
  );
}
