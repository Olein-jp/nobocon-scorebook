import type { ScoreSummary } from "../lib/types";

const formatNumber = (value: number) => new Intl.NumberFormat("ja-JP").format(value);

export default function ScoreSummary({ summary }: { summary: ScoreSummary }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-ink-900 px-4 py-3 text-white">
          <p className="text-xs uppercase tracking-[0.4em]">Total</p>
          <p className="mt-2 text-3xl font-bold">{formatNumber(summary.totalPoints)}</p>
          <p className="text-sm">ランク: {summary.rank}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 px-4 py-3">
          <p className="text-xs text-ink-500">合計トライ数</p>
          <p className="mt-2 text-2xl font-bold">{formatNumber(summary.totalTries)}</p>
          <p className="mt-2 text-xs text-ink-500">1トライあたりポイント</p>
          <p className="text-lg font-semibold">{summary.pointsPerTry.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 px-4 py-3">
          <p className="text-xs text-ink-500">のぼコンボード</p>
          <p className="mt-2 text-lg font-semibold">+{formatNumber(summary.boardPointsTotal)}pt</p>
          <p className="text-xs text-ink-500">トライ数: {formatNumber(summary.boardTriesTotal)}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 px-4 py-3">
          <p className="text-xs text-ink-500">課題ポイント</p>
          <p className="mt-2 text-lg font-semibold">+{formatNumber(summary.gradePointsTotal)}pt</p>
          <p className="text-xs text-ink-500">完登数: {summary.toppedProblems.length}</p>
        </div>
      </div>
    </div>
  );
}
