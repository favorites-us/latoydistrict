import InfoPage from "@/components/pages/InfoPage";
import { siteInfo } from "@/lib/content/site-info";
import { altMeta } from "@/lib/meta";

const content = siteInfo.about.es;
export const metadata = altMeta("/about", "es", content.title, content.description);

export default function Page() {
  return <InfoPage page="about" locale="es" />;
}
