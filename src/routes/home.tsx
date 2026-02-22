import { Link } from "react-router-dom";
import { calculateScore } from "../lib/scoring";
import type { AppState } from "../lib/types";

const formatDate = (value: string) => value || "日付未設定";

export default function HomeRoute({ state }: { state: AppState }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <header className="flex items-center justify-between gap-3 border-b border-mint-300/80 pb-4">
        <div>
          <p className="font-display text-[0.72rem] uppercase leading-[1.2] tracking-[0.45em] text-ink-600">
            <span className="block">Nobocon</span>
            <span className="mt-1 block">Scorebook</span>
          </p>
        </div>
        <Link
          to="/competitions/new"
          className="accent-button inline-flex items-center gap-2 text-center text-sm leading-tight"
        >
          <span aria-hidden="true" className="text-base leading-none">＋</span>
          <span>
            <span className="block">コンペを</span>
            <span className="block">新規作成</span>
          </span>
        </Link>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {state.competitions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-mint-500/60 bg-mint-100/70 p-6 text-sm text-ink-700">
            まだコンペがありません。「＋ 新規作成」から開始してください。
          </div>
        )}

        {state.competitions.map((competition) => {
          const score = calculateScore(competition);
          return (
            <Link
              key={competition.id}
              to={`/competitions/${competition.id}`}
              className="group soft-card p-5 transition hover:-translate-y-1 hover:border-accent-500/55"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-600">{formatDate(competition.eventDate)}</p>
                  <h2 className="mt-1 text-lg font-semibold text-ink-950">{competition.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-600">合計ポイント</p>
                  <p className="text-xl font-bold text-ink-950">{score.totalPoints}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-mint-300/85 bg-mint-50 px-3 py-2 text-sm text-ink-700">
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
