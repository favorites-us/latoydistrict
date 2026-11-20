import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { altMeta } from "@/lib/meta";
import { t } from "@/lib/i18n";

const homeMeta = altMeta(
  "/",
  "en",
  "LA Toy District: Wholesale Toys in Downtown Los Angeles",
  t("en", "tagline"),
);

export const metadata: Metadata = { ...homeMeta, title: { absolute: "LA Toy District: Wholesale Toys in Downtown Los Angeles" } };

export default function Page() {
  return <HomePage locale="en" />;
}
