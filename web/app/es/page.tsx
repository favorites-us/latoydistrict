import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { altMeta } from "@/lib/meta";
import { t } from "@/lib/i18n";

export const metadata: Metadata = altMeta(
  "/",
  "es",
  "Directorio del Toy District de Los Ángeles — Juguetes al por mayor en DTLA",
  t("es", "tagline"),
);

export default function Page() {
  return <HomePage locale="es" />;
}
