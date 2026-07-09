import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { altMeta } from "@/lib/meta";
import { t } from "@/lib/i18n";

export const metadata: Metadata = altMeta(
  "/",
  "en",
  "LA Toy District Directory — Wholesale Toys in Downtown Los Angeles",
  t("en", "tagline"),
);

export default function Page() {
  return <HomePage locale="en" />;
}
