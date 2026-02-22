import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AUTO_TOP_GRADES_BY_CLASS,
  GRADE_OPTIONS,
  PARTICIPATION_CLASSES,
  type AutoTopCounts,
  type Competition,
  type ParticipationClass,
} from "../lib/types";
import { validateCompetition } from "../lib/validators";

const todayString = () => new Date().toISOString().slice(0, 10);

type Actions = {
  createCompetition: (
    title: string,
    eventDate: string,
    participationClass: ParticipationClass,
    autoTopCounts: AutoTopCounts
  ) => string;
  updateCompetitionMeta?: (
    id: string,
    updates: Partial<Pick<Competition, "title" | "eventDate" | "participationClass" | "autoTopCounts">>
  ) => void;
};

const classLabel: Record<ParticipationClass, string> = {
  general: "一般",
  advance: "アドバンスクラス",
  master: "マスタークラス",
};

const defaultAutoTopCounts = (): AutoTopCounts =>
  GRADE_OPTIONS.reduce((acc, grade) => {
    acc[grade] = 0;
    return acc;
  }, {} as AutoTopCounts);

export default function CompetitionNewRoute({ actions }: { actions: Actions }) {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(todayString());
  const [participationClass, setParticipationClass] = useState<ParticipationClass>("general");
  const [autoTopCounts, setAutoTopCounts] = useState<AutoTopCounts>(defaultAutoTopCounts);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const autoTopGrades = AUTO_TOP_GRADES_BY_CLASS[participationClass];

  const adjustAutoTopCount = (grade: (typeof GRADE_OPTIONS)[number], delta: number) => {
    setAutoTopCounts((prev) => ({
      ...prev,
      [grade]: Math.max(0, (prev[grade] ?? 0) + delta),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateCompetition({ title });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    const id = actions.createCompetition(title.trim(), eventDate, participationClass, autoTopCounts);
    navigate(`/competitions/${id}`);
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-8">
      <header className="flex items-center justify-between border-b border-mint-300/80 pb-4">
        <div>
          <p className="font-display text-[0.72rem] uppercase leading-[1.2] tracking-[0.45em] text-ink-600">
            <span className="block">Nobocon</span>
            <span className="mt-1 block">Scorebook</span>
          </p>
          <h1 className="mt-3 text-sm font-semibold tracking-[0.16em] text-ink-700">コンペ作成</h1>
        </div>
      </header>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="soft-card p-4">
          <label className="text-sm font-semibold text-ink-800">大会名</label>
          <input
            className="mt-2 w-full rounded-xl border border-mint-300 bg-mint-50 px-3 py-2 text-base placeholder:text-ink-600"
            placeholder="のぼコン 2026-02"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          {errors.title && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.title}</p>}
        </div>

        <div className="soft-card p-4">
          <label className="text-sm font-semibold text-ink-800">開催日</label>
          <input
            type="date"
            className="mt-2 w-full rounded-xl border border-mint-300 bg-mint-50 px-3 py-2 text-base"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </div>

        <div className="soft-card p-4">
          <p className="text-sm font-semibold text-ink-800">参加枠</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {PARTICIPATION_CLASSES.map((cls) => (
              <button
                key={cls}
                type="button"
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  participationClass === cls
                    ? "border-accent-500 bg-accent-500 text-night"
                    : "border-mint-300 bg-mint-50 text-ink-800"
                }`}
                onClick={() => setParticipationClass(cls)}
                aria-pressed={participationClass === cls}
              >
                {classLabel[cls]}
              </button>
            ))}
          </div>

          {autoTopGrades.length > 0 && (
            <div className="mt-4 space-y-2 rounded-xl border border-mint-300 bg-mint-50 p-3">
              <p className="text-xs text-ink-600">
                {participationClass === "advance"
                  ? "4Q以下（4Q〜8Q）の課題数を入力してください。"
                  : "3Q以下（3Q〜8Q）の課題数を入力してください。"}
              </p>
              {autoTopGrades.map((grade) => (
                <div key={grade} className="flex items-center justify-between rounded-xl border border-mint-300 bg-mint-100 px-3 py-2">
                  <p className="text-sm font-semibold text-ink-900">{grade}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full border border-mint-300 bg-mint-50 text-base"
                      onClick={() => adjustAutoTopCount(grade, -1)}
                      aria-label={`${grade}の課題数を減らす`}
                    >
                      -
                    </button>
                    <p className="w-10 text-center text-base font-semibold text-ink-900">
                      {autoTopCounts[grade]}
                    </p>
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full border border-mint-300 bg-mint-50 text-base"
                      onClick={() => adjustAutoTopCount(grade, 1)}
                      aria-label={`${grade}の課題数を増やす`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-accent-500 px-4 py-3 text-base font-semibold text-night transition hover:bg-accent-600"
        >
          保存して開始
        </button>
      </form>
    </div>
  );
}
