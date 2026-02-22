import type { ScoreSummary } from "../lib/types";

const formatNumber = (value: number) => new Intl.NumberFormat("ja-JP").format(value);

export default function ScoreSummary({ summary }: { summary: ScoreSummary }) {
  return (
    <div className="soft-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-accent-500 px-4 py-3 text-night">
          <p className="text-xs uppercase tracking-[0.4em]">Total</p>
          <p className="mt-2 text-3xl font-bold">{formatNumber(summary.totalPoints)}</p>
          <p className="text-sm">ランク: {summary.rank}</p>
        </div>
        <div className="rounded-2xl border border-mint-300 bg-mint-50 px-4 py-3">
          <p className="text-xs text-ink-600">合計トライ数</p>
          <p className="mt-2 text-2xl font-bold">{formatNumber(summary.totalTries)}</p>
          <p className="mt-2 text-xs text-ink-600">1トライあたりポイント</p>
          <p className="text-lg font-semibold">{summary.pointsPerTry.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-mint-300 bg-mint-50 px-4 py-3">
          <p className="text-xs text-ink-600">課題ポイント</p>
          <p className="mt-2 text-lg font-semibold">+{formatNumber(summary.problemPointsTotal)}pt</p>
          <p className="text-xs text-ink-600">完登数: {summary.toppedProblems.length}</p>
        </div>
        <div className="rounded-2xl border border-mint-300 bg-mint-50 px-4 py-3">
          <p className="text-xs text-ink-600">事前完登扱いポイント</p>
          <p className="mt-2 text-lg font-semibold">+{formatNumber(summary.autoTopPointsTotal)}pt</p>
          <p className="text-xs text-ink-600">参加クラスによる加点</p>
        </div>
        <div className="rounded-2xl border border-mint-300 bg-mint-50 px-4 py-3">
          <p className="text-xs text-ink-600">のぼコンボード</p>
          <p className="mt-2 text-lg font-semibold">+{formatNumber(summary.boardPointsTotal)}pt</p>
          <p className="text-xs text-ink-600">トライ数: {formatNumber(summary.boardTriesTotal)}</p>
        </div>
      </div>
    </div>
  );
}
