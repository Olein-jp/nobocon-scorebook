import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Competition } from "../lib/types";
import { validateCompetition } from "../lib/validators";

const todayString = () => new Date().toISOString().slice(0, 10);

type Actions = {
  createCompetition: (title: string, eventDate: string) => string;
  updateCompetitionMeta?: (id: string, updates: Partial<Pick<Competition, "title" | "eventDate">>) => void;
};

export default function CompetitionNewRoute({ actions }: { actions: Actions }) {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(todayString());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateCompetition({ title });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    const id = actions.createCompetition(title.trim(), eventDate);
    navigate(`/competitions/${id}`);
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-500">Nobocon Scorebook</p>
          <h1 className="font-display text-2xl">コンペ作成</h1>
        </div>
      </header>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-card">
          <label className="text-sm font-semibold text-ink-700">大会名</label>
          <input
            className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-base"
            placeholder="のぼコン 2026-02"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          {errors.title && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.title}</p>}
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-card">
          <label className="text-sm font-semibold text-ink-700">開催日</label>
          <input
            type="date"
            className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-base"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-2xl bg-ink-900 px-4 py-3 text-base font-semibold text-white"
        >
          保存して開始
        </button>
      </form>
    </div>
  );
}
