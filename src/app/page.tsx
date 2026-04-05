export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <div className="border border-card-border bg-card-bg">
          <div className="flex items-center justify-between border-b border-card-border px-4 py-2 text-xs text-prompt">
            <span>~/scripturestack</span>
            <span className="flex items-center gap-2">
              <span className="pulse-dot h-2 w-2 rounded-full bg-teal inline-block" />
              in development
            </span>
          </div>

          <div className="px-6 py-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Scripture Stack
              </h1>
              <p className="mt-2 text-accent">
                a new way to study the Word
              </p>
            </div>

            <div className="space-y-1 text-sm text-accent">
              <div><span className="text-prompt">$</span> boot scripturestack</div>
              <div className="text-prompt">&rsaquo; loading stack...</div>
              <div className="text-prompt">&rsaquo; next.js + react &middot; tailwind &middot; drizzle + postgres/pgvector</div>
              <div className="text-prompt">&rsaquo; d3 &middot; recharts &middot; mapbox gl &middot; huggingface ml</div>
              <div className="text-teal">&rsaquo; ready. building features<span className="cursor" /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Stat label="stage" value="planning" />
              <Stat label="stack" value="live" />
              <Stat label="eta" value="soon" />
            </div>

            <div className="pt-4">
              <a
                href="https://j4den.com"
                className="inline-block text-sm text-accent hover:text-teal transition-colors"
              >
                &larr; back to j4den.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-card-border px-3 py-2">
      <div className="text-xs text-prompt uppercase tracking-wide">{label}</div>
      <div className="text-sm text-accent-light mt-1">{value}</div>
    </div>
  );
}
