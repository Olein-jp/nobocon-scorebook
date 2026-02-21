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
      <div className="app-shell">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink-600">Nobocon Scorebook</p>
            <h1 className="mt-1 font-display text-2xl text-ink-950">コンペ作成</h1>
          </div>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="soft-card p-4">
            <label className="text-sm font-semibold text-ink-800">大会名</label>
            <input
              className="mt-2 w-full rounded-2xl border border-mint-300 bg-mint-50 px-3 py-2 text-base"
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
              className="mt-2 w-full rounded-2xl border border-mint-300 bg-mint-50 px-3 py-2 text-base"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-accent-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-accent-600"
          >
            保存して開始
          </button>
        </form>
      </div>
    </div>
  );
}
