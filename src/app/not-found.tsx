import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-[440px] text-center">
        <div className="t-label mb-3">404</div>
        <h1 className="font-serif text-[36px] mb-3" style={{ color: "var(--color-ink)" }}>
          Nothing here
        </h1>
        <p className="text-[14px] mb-6" style={{ color: "var(--color-ink-muted)" }}>
          The page you were looking for doesn&apos;t exist. Head home, or jump into the text.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn">Home</Link>
          <Link href="/read/Genesis/1" className="btn btn-primary">Read Genesis 1</Link>
        </div>
      </div>
    </div>
  );
}
