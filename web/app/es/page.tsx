import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { altMeta } from "@/lib/meta";
import { t } from "@/lib/i18n";

const homeMeta = altMeta(
  "/",
  "es",
  "Toy District de Los Ángeles: directorio de mayoristas",
  t("es", "tagline"),
);

export const metadata: Metadata = { ...homeMeta, title: { absolute: "Toy District de Los Ángeles: directorio de mayoristas" } };

export default function Page() {
  return <HomePage locale="es" />;
}
