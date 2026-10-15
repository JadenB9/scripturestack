// Layout for the Open Graph share cards. Satori (next/og) renders this with
// its own flexbox engine, so everything is explicit flex and inline styles —
// no Tailwind, no CSS variables. The palette is the light parchment theme.

export const OG_SIZE = { width: 1200, height: 630 };

const PARCHMENT = "#F9F6EF";
const INK = "#1C1917";
const INK_MUTED = "#57534E";
const GOLD = "#92400E";
const BORDER = "#D6D3D1";

type Card = {
  kicker: string;
  title: string;
  subtitle: string;
  footer?: string;
};

export function ogCard({ kicker, title, subtitle, footer }: Card) {
  const titleSize = title.length > 18 ? 84 : 112;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PARCHMENT,
        color: INK,
        padding: "64px 72px",
        fontFamily: "serif",
      }}
    >
      {/* gold rule */}
      <div style={{ display: "flex", width: 56, height: 4, background: GOLD }} />

      <div
        style={{
          display: "flex",
          marginTop: 28,
          fontSize: 22,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: INK_MUTED,
          fontFamily: "sans-serif",
        }}
      >
        {kicker}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 10,
          fontSize: titleSize,
          lineHeight: 1.05,
          letterSpacing: -1,
        }}
      >
        {title}
      </div>

      {subtitle && (
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            lineHeight: 1.4,
            color: INK_MUTED,
            maxWidth: 1000,
          }}
        >
          {subtitle}
        </div>
      )}

      <div style={{ display: "flex", flexGrow: 1 }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${BORDER}`,
          paddingTop: 22,
          fontSize: 22,
          color: INK_MUTED,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex" }}>{footer ?? "scripturestack.j4den.com"}</div>
        <div style={{ display: "flex", color: GOLD }}>ScriptureStack</div>
      </div>
    </div>
  );
}
