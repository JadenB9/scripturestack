/**
 * Client-side annotation store. Uses localStorage keyed by a per-device UUID.
 *
 * No login. No server sync. Export (txt/md/json) is the escape hatch.
 */

export type AnnotationType =
  | "observation"
  | "interpretation"
  | "application"
  | "question"
  | "cross-ref"
  | "note";

export type AnnotationColor = "yellow" | "blue" | "green" | "purple" | "red";

export type Annotation = {
  id: string;
  deviceId: string;
  book: string;
  chapter: number;
  verse: number;
  type: AnnotationType;
  color: AnnotationColor;
  text: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

const DEVICE_ID_KEY = "ss-device-id";
const STORE_KEY = "ss-annotations-v1";

export const ANN_TYPES: { value: AnnotationType; label: string }[] = [
  { value: "observation", label: "Observation" },
  { value: "interpretation", label: "Interpretation" },
  { value: "application", label: "Application" },
  { value: "question", label: "Question" },
  { value: "cross-ref", label: "Cross-ref" },
  { value: "note", label: "Note" },
];

export const ANN_COLORS: { value: AnnotationColor; hex: string; border: string }[] = [
  { value: "yellow", hex: "#FEF3C7", border: "#CA8A04" },
  { value: "blue", hex: "#DBEAFE", border: "#2563EB" },
  { value: "green", hex: "#D1FAE5", border: "#059669" },
  { value: "purple", hex: "#EDE9FE", border: "#7C3AED" },
  { value: "red", hex: "#FEE2E2", border: "#DC2626" },
];

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function readAll(): Annotation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Annotation[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list: Annotation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
  // Fire a same-window event so other hooks can react.
  window.dispatchEvent(new CustomEvent("ss-annotations-updated"));
}

export function listAnnotations(): Annotation[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function listForChapter(book: string, chapter: number): Annotation[] {
  return readAll().filter((a) => a.book === book && a.chapter === chapter);
}

export function listForVerse(book: string, chapter: number, verse: number): Annotation[] {
  return readAll()
    .filter((a) => a.book === book && a.chapter === chapter && a.verse === verse)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createAnnotation(
  input: Omit<Annotation, "id" | "deviceId" | "createdAt" | "updatedAt">
): Annotation {
  const now = Date.now();
  const ann: Annotation = {
    ...input,
    id: uuid(),
    deviceId: getDeviceId(),
    createdAt: now,
    updatedAt: now,
  };
  const list = readAll();
  list.push(ann);
  writeAll(list);
  return ann;
}

export function updateAnnotation(id: string, patch: Partial<Annotation>): Annotation | null {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const merged = { ...list[idx], ...patch, id: list[idx].id, updatedAt: Date.now() };
  list[idx] = merged;
  writeAll(list);
  return merged;
}

export function deleteAnnotation(id: string): boolean {
  const list = readAll();
  const next = list.filter((a) => a.id !== id);
  if (next.length === list.length) return false;
  writeAll(next);
  return true;
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  for (const a of readAll()) for (const t of a.tags) set.add(t);
  return Array.from(set).sort();
}

export function exportAsText(): string {
  return listAnnotations()
    .map(
      (a) =>
        `[${a.book} ${a.chapter}:${a.verse}] ${a.type.toUpperCase()} — ${a.text}` +
        (a.tags.length ? ` [${a.tags.join(", ")}]` : "")
    )
    .join("\n");
}

export function exportAsMarkdown(): string {
  const grouped = new Map<string, Annotation[]>();
  for (const a of listAnnotations()) {
    const key = `${a.book} ${a.chapter}:${a.verse}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(a);
  }
  const lines: string[] = ["# ScriptureStack — Annotations", ""];
  for (const [ref, anns] of grouped) {
    lines.push(`## ${ref}`, "");
    for (const a of anns) {
      lines.push(`**${a.type}** — ${a.text}`);
      if (a.tags.length) lines.push(`_tags: ${a.tags.join(", ")}_`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

export function exportAsJSON(): string {
  return JSON.stringify(listAnnotations(), null, 2);
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
