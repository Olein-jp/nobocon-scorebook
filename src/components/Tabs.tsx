import type { ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export default function Tabs({ items, activeId, onChange }: { items: TabItem[]; activeId: string; onChange: (id: string) => void }) {
  return (
    <div>
      <div className="mt-6 flex gap-2 rounded-2xl border border-mint-300/85 bg-mint-100/85 p-1 shadow-card">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeId === item.id ? "bg-accent-500 text-night" : "text-ink-700 hover:bg-mint-50"
            }`}
            aria-selected={activeId === item.id}
            aria-controls={`tab-panel-${item.id}`}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <section key={item.id} id={`tab-panel-${item.id}`} className={activeId === item.id ? "block" : "hidden"}>
          {item.content}
        </section>
      ))}
    </div>
  );
}
