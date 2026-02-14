import { useEffect, useMemo, useState } from "react";
import { GRADE_OPTIONS, type ProblemAttempt } from "../lib/types";
import { validateProblem } from "../lib/validators";

export type ProblemFormInput = Omit<ProblemAttempt, "id" | "createdAt" | "updatedAt">;

type Props = {
  open: boolean;
  initial?: ProblemFormInput;
  onClose: () => void;
  onSave: (payload: ProblemFormInput) => void;
};

const defaultForm: ProblemFormInput = {
  label: "",
  grade: "5Q",
  triesTotal: 0,
  topped: false,
  triesToTop: null,
};

export default function ProblemEditorSheet({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<ProblemFormInput>(initial ?? defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ?? defaultForm);
      setErrors({});
    }
  }, [open, initial]);

  const triesTotal = useMemo(() => Math.max(0, Number(form.triesTotal) || 0), [form.triesTotal]);

  useEffect(() => {
    if (!form.topped) return;
    const nextTries = triesTotal > 0 ? triesTotal : 1;
    if (triesTotal === 0) {
      setForm((prev) => ({ ...prev, triesTotal: nextTries, triesToTop: nextTries }));
      return;
    }
    if (form.triesToTop !== nextTries) {
      setForm((prev) => ({ ...prev, triesToTop: nextTries }));
    }
  }, [form.topped, form.triesToTop, triesTotal]);

  const handleSave = () => {
    const normalized: ProblemFormInput = {
      ...form,
      label: form.label.trim(),
      triesTotal,
      triesToTop: form.topped ? (form.triesToTop === null ? null : Number(form.triesToTop)) : null,
    };
    const validation = validateProblem(normalized);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    onSave(normalized);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 px-4 pb-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">課題を入力</h3>
          <button type="button" className="text-sm text-ink-500" onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-ink-200 bg-ink-50/40 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-semibold text-ink-700">課題番号</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2"
                  value={form.label}
                  onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                  placeholder="1"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-semibold text-ink-700">グレード</label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {GRADE_OPTIONS.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                        form.grade === grade
                          ? "border-ink-900 bg-ink-900 text-white"
                          : "border-ink-200 bg-white text-ink-700"
                      }`}
                      onClick={() => setForm((prev) => ({ ...prev, grade }))}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {errors.label && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.label}</p>}
            {errors.grade && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.grade}</p>}
          </div>

          <label className="block text-sm font-semibold text-ink-700">トライ数</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-11 w-11 rounded-full border border-ink-200 text-lg"
              onClick={() => setForm((prev) => ({ ...prev, triesTotal: Math.max(0, triesTotal - 1) }))}
            >
              −
            </button>
            <input
              type="number"
              className="w-full rounded-xl border border-ink-200 px-3 py-2"
              min={0}
              value={triesTotal}
              onChange={(event) => setForm((prev) => ({ ...prev, triesTotal: Number(event.target.value) }))}
            />
            <button
              type="button"
              className="h-11 w-11 rounded-full border border-ink-200 text-lg"
              onClick={() => setForm((prev) => ({ ...prev, triesTotal: triesTotal + 1 }))}
            >
              ＋
            </button>
          </div>
          {errors.triesTotal && <p className="text-sm text-red-600" aria-live="polite">{errors.triesTotal}</p>}

          <div className="flex items-center justify-between rounded-2xl border border-ink-200 px-3 py-2">
            <div>
              <p className={`text-sm font-semibold ${form.topped ? "text-moss-600" : "text-ink-700"}`}>
                {form.topped ? "完登登録済み" : "未完登"}
              </p>
              <p className="text-xs text-ink-500">
                {form.topped ? "完登として記録しました" : "タップで完登登録"}
              </p>
            </div>
            <button
              type="button"
              className={`rounded-full px-4 py-1 text-sm font-semibold ${
                form.topped ? "bg-moss-500 text-white" : "bg-ink-200 text-ink-600"
              }`}
              aria-pressed={form.topped}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  topped: !prev.topped,
                  triesTotal: !prev.topped && triesTotal === 0 ? 1 : prev.triesTotal,
                  triesToTop: !prev.topped ? (triesTotal > 0 ? triesTotal : 1) : null,
                }))
              }
            >
              {form.topped ? "完登済み" : "完登登録"}
            </button>
          </div>
          {errors.triesToTop && <p className="text-sm text-red-600" aria-live="polite">{errors.triesToTop}</p>}
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-2xl bg-ink-900 px-4 py-3 text-base font-semibold text-white"
          onClick={handleSave}
        >
          保存
        </button>
      </div>
    </div>
  );
}
