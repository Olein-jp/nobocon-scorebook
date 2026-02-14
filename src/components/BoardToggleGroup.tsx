import { BOARD_KEYS, type BoardStates, type BoardTries } from "../lib/types";
import { boardPoints } from "../lib/scoring";

type Props = {
  states: BoardStates;
  tries: BoardTries;
  onToggle: (key: keyof BoardStates) => void;
  onAdjustTries: (key: keyof BoardStates, delta: number) => void;
  onToggleAll: (value: boolean) => void;
};

export default function BoardToggleGroup({ states, tries, onToggle, onAdjustTries, onToggleAll }: Props) {
  const allOn = BOARD_KEYS.every((key) => states[key]);
  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">のぼコンボード</h3>
        <button
          type="button"
          className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold"
          onClick={() => onToggleAll(!allOn)}
        >
          {allOn ? "全て未完登" : "全て完登"}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {BOARD_KEYS.map((key) => (
          <div
            key={key}
            className={`rounded-2xl border px-3 py-3 text-sm transition ${
              states[key] ? "border-moss-500 bg-moss-500/15" : "border-ink-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-pressed={states[key]}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  states[key] ? "bg-moss-500 text-white" : "bg-ink-200 text-ink-700"
                }`}
                onClick={() => onToggle(key)}
              >
                {states[key] ? "完登" : "未完登"}
              </button>
              <span className="text-xs text-ink-600">+{boardPoints[key]}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-500">{key}</p>
                <p className="text-sm font-semibold">{tries[key] ?? 0}トライ</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-ink-200 text-base"
                  onClick={() => onAdjustTries(key, -1)}
                >
                  −
                </button>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-ink-200 text-base"
                  onClick={() => onAdjustTries(key, 1)}
                >
                  ＋
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
