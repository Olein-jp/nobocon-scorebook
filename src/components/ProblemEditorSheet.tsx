import { useEffect, useRef, useState } from "react";
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
  triesTotal: 1,
  topped: false,
  triesToTop: null,
};

export default function ProblemEditorSheet({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<ProblemFormInput>(initial ?? defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ?? defaultForm);
      setErrors({});
      requestAnimationFrame(() => labelRef.current?.focus());
    }
  }, [open, initial]);

  const normalizeForm = () => ({
    ...form,
    label: form.label.trim(),
    triesTotal: 1,
    topped: false,
    triesToTop: null,
  });

  const resetForNext = () => {
    setForm((prev) => ({
      ...defaultForm,
      grade: prev.grade,
      label: "",
    }));
    setErrors({});
    requestAnimationFrame(() => labelRef.current?.focus());
  };

  const handleSave = () => {
    const normalized = normalizeForm();
    const validation = validateProblem(normalized);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    onSave(normalized);
    onClose();
  };

  const handleSaveAndContinue = () => {
    const normalized = normalizeForm();
    const validation = validateProblem(normalized);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    onSave(normalized);
    resetForNext();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/70 px-4 pb-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-mint-300/85 bg-mint-100 p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink-950">課題を入力</h3>
          <button type="button" className="text-sm text-ink-600" onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-mint-300 bg-mint-50 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-semibold text-ink-800">課題番号</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-mint-300 bg-mint-50 px-3 py-2"
                  value={form.label}
                  onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                  placeholder="1"
                  ref={labelRef}
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-semibold text-ink-800">グレード</label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {GRADE_OPTIONS.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                        form.grade === grade
                          ? "border-accent-500 bg-accent-500 text-night"
                          : "border-mint-300 bg-mint-50 text-ink-800"
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
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="flex-1 rounded-xl bg-accent-500 px-4 py-3 text-base font-semibold text-night transition hover:bg-accent-600"
            onClick={handleSave}
          >
            追加する
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl border border-mint-300 bg-mint-50 px-4 py-3 text-base font-semibold text-ink-800"
            onClick={handleSaveAndContinue}
          >
            続けて追加する
          </button>
        </div>
      </div>
    </div>
  );
}
