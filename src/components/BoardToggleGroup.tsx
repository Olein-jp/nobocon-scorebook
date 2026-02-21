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
    <div className="soft-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink-950">のぼコンボード</h3>
        <button
          type="button"
          className="rounded-full border border-mint-300 bg-mint-50 px-3 py-1 text-xs font-semibold text-ink-800"
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
              states[key] ? "border-moss-500 bg-moss-500/10" : "border-mint-300 bg-mint-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-pressed={states[key]}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  states[key] ? "bg-moss-500 text-white" : "bg-white text-ink-700"
                }`}
                onClick={() => onToggle(key)}
              >
                {states[key] ? "完登" : "未完登"}
              </button>
              <span className="text-xs text-ink-700">+{boardPoints[key]}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-600">{key}</p>
                <p className="text-sm font-semibold text-ink-900">{tries[key] ?? 0}トライ</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-mint-300 bg-white text-base"
                  onClick={() => onAdjustTries(key, -1)}
                >
                  −
                </button>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-mint-300 bg-white text-base"
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
