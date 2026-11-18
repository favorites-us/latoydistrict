import InfoPage from "@/components/pages/InfoPage";
import { siteInfo } from "@/lib/content/site-info";
import { altMeta } from "@/lib/meta";

const content = siteInfo.privacy.es;
export const metadata = altMeta("/privacy", "es", content.title, content.description);

export default function Page() {
  return <InfoPage page="privacy" locale="es" />;
}
