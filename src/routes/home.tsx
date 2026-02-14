import { Link } from "react-router-dom";
import { calculateScore } from "../lib/scoring";
import type { AppState } from "../lib/types";

const formatDate = (value: string) => value || "日付未設定";

export default function HomeRoute({ state }: { state: AppState }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-500">Nobocon Scorebook</p>
          <h1 className="font-display text-2xl">コンペ一覧</h1>
        </div>
        <Link
          to="/competitions/new"
          className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-card"
        >
          ＋ 新規作成
        </Link>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {state.competitions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-500/30 bg-white/70 p-6 text-sm text-ink-600">
            まだコンペがありません。「＋ 新規作成」から開始してください。
          </div>
        )}

        {state.competitions.map((competition) => {
          const score = calculateScore(competition);
          return (
            <Link
              key={competition.id}
              to={`/competitions/${competition.id}`}
              className="group rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-sm transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-500">{formatDate(competition.eventDate)}</p>
                  <h2 className="mt-1 text-lg font-semibold text-ink-900">{competition.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-500">合計ポイント</p>
                  <p className="text-xl font-bold text-ink-900">{score.totalPoints}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-ink-600">
                <span>ランク: {score.rank}</span>
                <span>トライ数: {score.totalTries}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
