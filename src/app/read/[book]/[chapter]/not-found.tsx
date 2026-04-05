import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[680px] mx-auto px-6 py-24 text-center">
      <div className="t-label mb-3">Chapter not found</div>
      <h1 className="font-serif text-[28px] mb-3" style={{ color: "var(--color-ink)" }}>
        That book or chapter doesn&apos;t exist
      </h1>
      <p className="text-[14px] mb-6" style={{ color: "var(--color-ink-muted)" }}>
        Check the spelling or browse the canon.
      </p>
      <Link href="/books" className="btn">
        Go to books
      </Link>
    </div>
  );
}
