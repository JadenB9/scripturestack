"use client";

import { useEffect, useRef, useState } from "react";
import {
  ANN_COLORS,
  ANN_TYPES,
  type Annotation,
  type AnnotationColor,
  type AnnotationType,
  createAnnotation,
  deleteAnnotation,
  getAllTags,
  updateAnnotation,
} from "@/lib/annotations";

type Props = {
  book: string;
  chapter: number;
  verse: number;
  existing: Annotation[];
  onClose: () => void;
  onChange: () => void;
};

const SUGGESTED_TAGS = ["sermon prep", "memorize", "question", "key verse", "cross-ref", "prayer"];

export function AnnotationEditor({ book, chapter, verse, existing, onClose, onChange }: Props) {
  const [type, setType] = useState<AnnotationType>("note");
  const [color, setColor] = useState<AnnotationColor>("yellow");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allTags = Array.from(new Set([...SUGGESTED_TAGS, ...getAllTags()]));

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 30);
  }, []);

  function save() {
    if (!text.trim()) return;
    if (editingId) {
      updateAnnotation(editingId, { text: text.trim(), type, color, tags });
    } else {
      createAnnotation({ book, chapter, verse, type, color, text: text.trim(), tags });
    }
    setText("");
    setTags([]);
    setEditingId(null);
    onChange();
    if (!editingId) onClose();
  }

  function startEdit(a: Annotation) {
    setEditingId(a.id);
    setText(a.text);
    setType(a.type);
    setColor(a.color);
    setTags(a.tags);
    setTimeout(() => textareaRef.current?.focus(), 10);
  }

  function remove(id: string) {
    deleteAnnotation(id);
    onChange();
  }

  function addTag(t: string) {
    const clean = t.trim();
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      save();
    }
  }

  return (
    <div
      className="my-3 border rounded fade-in"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border-strong)",
        fontFamily: "var(--font-sans)",
      }}
      onKeyDown={handleKey}
    >
      {existing.length > 0 && (
        <div className="border-b" style={{ borderColor: "var(--color-border)" }}>
          {existing.map((a) => {
            const hue = ANN_COLORS.find((c) => c.value === a.color)!;
            return (
              <div
                key={a.id}
                className="group/ann flex items-start gap-3 px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: hue.border }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge" style={{ background: hue.hex, color: hue.border, fontSize: 9 }}>
                      {a.type}
                    </span>
                    {a.tags.map((t) => (
                      <span key={t} className="text-[10px]" style={{ color: "var(--color-ink-faint)" }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                  <p className="text-[13px] leading-[1.55]" style={{ color: "var(--color-ink)" }}>
                    {a.text}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover/ann:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(a)} className="text-[11px]" style={{ color: "var(--color-ink-muted)" }}>
                    Edit
                  </button>
                  <button onClick={() => remove(a.id)} className="text-[11px]" style={{ color: "var(--color-ink-muted)" }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {ANN_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className="px-2 py-1 text-[11px] border rounded transition-colors"
              style={{
                borderColor: type === t.value ? "var(--color-gold)" : "var(--color-border)",
                color: type === t.value ? "var(--color-gold)" : "var(--color-ink-muted)",
                background: type === t.value ? "var(--color-gold-light)" : "transparent",
              }}
            >
              {t.label}
            </button>
          ))}

          <div className="flex items-center gap-1 ml-2 pl-2 border-l" style={{ borderColor: "var(--color-border)" }}>
            {ANN_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                aria-label={c.value}
                className="w-5 h-5 rounded-full transition-transform"
                style={{
                  background: c.hex,
                  border: `2px solid ${color === c.value ? c.border : "transparent"}`,
                  transform: color === c.value ? "scale(1.1)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={editingId ? "Update your note…" : "What do you observe?"}
          className="w-full min-h-[80px] text-[14px] leading-[1.55] resize-y"
          style={{
            background: "transparent",
            color: "var(--color-ink)",
            border: "1px solid var(--color-border)",
            borderRadius: 4,
            padding: 10,
            fontFamily: "var(--font-sans)",
          }}
        />

        <div className="mt-3">
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => removeTag(t)}
                  className="badge badge-muted"
                  style={{ fontSize: 9 }}
                >
                  #{t} ×
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Add tag… press Enter"
            list="ss-tag-suggestions"
          />
          <datalist id="ss-tag-suggestions">
            {allTags.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button onClick={save} disabled={!text.trim()} className="btn btn-primary" style={{ opacity: text.trim() ? 1 : 0.4 }}>
            {editingId ? "Update" : "Save"}
            <span className="text-[10px] opacity-70 ml-1">⌘↵</span>
          </button>
          <button
            onClick={() => {
              if (editingId) {
                setEditingId(null);
                setText("");
                setTags([]);
              } else {
                onClose();
              }
            }}
            className="text-[12px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {editingId ? "Cancel edit" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
