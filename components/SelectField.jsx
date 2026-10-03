"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

function childrenToText(node) {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(childrenToText).join("");
  if (isValidElement(node)) {
    if (node.type === Fragment) return childrenToText(node.props.children);
    return childrenToText(node.props.children);
  }
  return "";
}

function parseSelectChildren(children) {
  const items = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === "option") {
      items.push({
        kind: "option",
        value: String(child.props.value ?? ""),
        label: childrenToText(child.props.children),
        disabled: !!child.props.disabled,
      });
      return;
    }
    if (child.type === "optgroup") {
      const options = [];
      Children.forEach(child.props.children, (opt) => {
        if (!isValidElement(opt) || opt.type !== "option") return;
        options.push({
          kind: "option",
          value: String(opt.props.value ?? ""),
          label: childrenToText(opt.props.children),
          disabled: !!opt.props.disabled,
        });
      });
      items.push({
        kind: "group",
        label: child.props.label ?? "",
        options,
      });
    }
  });
  return items;
}

function findLabel(items, value) {
  const v = String(value);
  for (const item of items) {
    if (item.kind === "option") {
      if (item.value === v) return item.label;
    } else {
      for (const opt of item.options) {
        if (opt.value === v) return opt.label;
      }
    }
  }
  return "";
}

export function SelectField({
  id,
  label,
  hint,
  value,
  onChange,
  disabled,
  children,
  /** Liste du portail : sous le champ (défaut) ou au-dessus — utile pour « Sujet » en bas de formulaire */
  menuPlacement = "below",
}) {
  const autoId = useId();
  const listId = `${id ?? autoId}-list`;
  const rootRef = useRef(null);
  const portalListRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);

  const items = useMemo(() => parseSelectChildren(children), [children]);
  const displayLabel = findLabel(items, value);

  const setClosed = useCallback(() => {
    setMenuRect(null);
    setOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (!open || disabled) return;
    function updatePosition() {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 4;
      if (menuPlacement === "above") {
        const maxHeight = Math.min(240, Math.max(80, r.top - gap - 12));
        const bottom = window.innerHeight - r.top + gap;
        setMenuRect({
          placement: "above",
          bottom,
          left: r.left,
          width: r.width,
          maxHeight,
        });
        return;
      }
      const top = r.bottom + gap;
      const maxHeight = Math.min(240, Math.max(80, window.innerHeight - top - 12));
      setMenuRect({
        placement: "below",
        top,
        left: r.left,
        width: r.width,
        maxHeight,
      });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, disabled, menuPlacement]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      const t = e.target;
      if (rootRef.current?.contains(t)) return;
      if (portalListRef.current?.contains(t)) return;
      setClosed();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setClosed]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setClosed();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setClosed]);

  function selectOption(next) {
    onChange(next);
    setClosed();
  }

  const fieldId = id ?? autoId;

  const listBody =
    open && !disabled && menuRect
      ? createPortal(
          <div
            ref={portalListRef}
            id={listId}
            role="listbox"
            style={{
              position: "fixed",
              left: menuRect.left,
              width: menuRect.width,
              maxHeight: menuRect.maxHeight,
              ...(menuRect.placement === "above"
                ? { bottom: menuRect.bottom }
                : { top: menuRect.top }),
            }}
            className="z-[9999] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
          >
            {items.map((item, i) => {
              if (item.kind === "option") {
                const selected = String(value) === item.value;
                return (
                  <div
                    key={`${item.value}-${i}`}
                    role="option"
                    aria-selected={selected}
                    className={`cursor-pointer px-4 py-2.5 text-sm ${
                      item.disabled
                        ? "cursor-not-allowed text-slate-300"
                        : selected
                          ? "bg-indigo-50 text-indigo-950"
                          : " text-slate-800 hover:bg-slate-50"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !item.disabled && selectOption(item.value)}
                  >
                    {item.label}
                  </div>
                );
              }
              return (
                <div key={`${item.label}-${i}`} role="group" aria-label={item.label}>
                  <div className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.label}
                  </div>
                  {item.options.map((opt, j) => {
                    const selected = String(value) === opt.value;
                    return (
                      <div
                        key={`${opt.value}-${j}`}
                        role="option"
                        aria-selected={selected}
                        className={`cursor-pointer px-4 py-2.5 pl-6 text-sm ${
                          opt.disabled
                            ? "cursor-not-allowed text-slate-300"
                            : selected
                              ? "bg-indigo-50 text-indigo-950"
                              : " text-slate-800 hover:bg-slate-50"
                        }`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => !opt.disabled && selectOption(opt.value)}
                      >
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={fieldId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open && !disabled}
          aria-controls={listId}
          onClick={() => {
            if (disabled) return;
            if (open) setClosed();
            else {
              setMenuRect(null);
              setOpen(true);
            }
          }}
          className="peer flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-left text-base text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        >
          <span className={displayLabel ? "text-slate-900" : "text-slate-400"}>
            {displayLabel || "—"}
          </span>
        </button>
        <span
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition ${open && !disabled ? "rotate-180" : ""}`}
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      {listBody}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
