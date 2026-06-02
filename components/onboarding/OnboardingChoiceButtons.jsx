const choiceClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500";

const choiceSelectedClass =
  "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/30";

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
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`${choiceClass} ${isSelected ? choiceSelectedClass : ""}`}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
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
 * @param {(values: string[]) => void} onChange
 */
export function OnboardingMultiChoiceButtons({ options, selected, onChange }) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            className={`${choiceClass} ${isSelected ? choiceSelectedClass : ""}`}
            onClick={() => {
              const next = isSelected
                ? selected.filter((x) => x !== opt.value)
                : [...selected, opt.value];
              onChange(next);
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
