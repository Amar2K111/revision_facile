const choiceClass =
  "flex min-h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-medium text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50/50 active:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500";

const choiceSelectedClass =
  "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/30";

function SingleChoiceIndicator({ selected }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
      }`}
    >
      {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
    </span>
  );
}

function MultiChoiceIndicator({ selected }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
        selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
      }`}
    >
      {selected ? (
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

/**
 * @param {{ value: string, label: string }[]} options
 * @param {string} selected
 * @param {(value: string) => void} onSelect
 */
export function OnboardingChoiceButtons({ options, selected, onSelect }) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" role="radiogroup">
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`${choiceClass} ${isSelected ? choiceSelectedClass : ""}`}
            onClick={() => onSelect(opt.value)}
          >
            <SingleChoiceIndicator selected={isSelected} />
            <span className="min-w-0 flex-1">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * @param {{ groupLabel: string, options: { value: string, label: string }[] }[]} groups
 * @param {string} selected
 * @param {(value: string) => void} onSelect
 */
export function OnboardingGroupedChoiceButtons({ groups, selected, onSelect }) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.groupLabel}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {group.groupLabel}
          </p>
          <OnboardingChoiceButtons
            options={group.options}
            selected={selected}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * @param {{ value: string, label: string }[]} options
 * @param {string[]} selected
 * @param {(value: string) => void} onToggle
 */
export function OnboardingMultiChoiceButtons({ options, selected, onToggle }) {
  if (options.length === 0) {
    return null;
  }

  const selectedSet = new Set(selected);

  return (
    <div className="space-y-2" role="group" aria-label="Choix multiples">
      {options.map((opt) => {
        const isSelected = selectedSet.has(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isSelected}
            className={`${choiceClass} ${isSelected ? choiceSelectedClass : ""}`}
            onClick={() => onToggle(opt.value)}
          >
            <MultiChoiceIndicator selected={isSelected} />
            <span className="min-w-0 flex-1">{opt.label}</span>
          </button>
        );
      })}
      {selected.length > 0 ? (
        <p className="pt-1 text-center text-xs text-slate-500">
          {selected.length} sélectionné{selected.length > 1 ? "s" : ""} — tu peux en choisir plusieurs
        </p>
      ) : null}
    </div>
  );
}
