import { ImageResponse } from "next/og";
import { BLOCK_LABELS, fullAddress, storeBySlug, stores } from "@/lib/stores";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return stores.map((s) => ({ slug: s.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = storeBySlug.get(slug);
  const name = store?.name ?? "LA Toy District";
  const sub = store ? `${fullAddress(store)} · ${BLOCK_LABELS[store.block]}` : "";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#fffdf8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", color: "#d6452c", fontSize: 34, fontWeight: 700 }}>
          LA Toy District Directory
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: "#1e1a16", lineHeight: 1.1 }}>
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#6b625a" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6b625a" }}>
          Wholesale toys · Downtown Los Angeles · latoydistrict.com
        </div>
      </div>
    ),
    size,
  );
}
