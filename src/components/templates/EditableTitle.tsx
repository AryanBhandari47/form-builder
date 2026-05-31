"use client";

import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

export function EditableTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        autoFocus
        className="
          text-sm font-semibold text-text-primary bg-transparent
          border-b border-primary outline-none
          min-w-[100px] max-w-[200px] sm:max-w-[280px] px-0.5
        "
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="Click to edit"
      className="
        text-sm font-semibold text-text-primary
        hover:text-primary transition-colors
        max-w-[200px] sm:max-w-[280px] truncate cursor-pointer
      "
    >
      {value}
    </button>
  );
}
