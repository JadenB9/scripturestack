import { ImageResponse } from "next/og";
import { OG_SIZE, ogCard } from "@/lib/og";

// Site-wide share card (home page and any page without its own).
export const alt = "ScriptureStack — The Bible, compiled for curious minds";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    ogCard({
      kicker: "scripturestack.j4den.com",
      title: "ScriptureStack",
      subtitle: "The Bible, compiled for curious minds.",
      footer: "Read · Search by meaning · Atlas · Timeline · Manuscripts",
    }),
    { ...size }
  );
}
