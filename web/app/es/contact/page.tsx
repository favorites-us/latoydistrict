import InfoPage from "@/components/pages/InfoPage";
import { siteInfo } from "@/lib/content/site-info";
import { altMeta } from "@/lib/meta";

const content = siteInfo.contact.es;
export const metadata = altMeta("/contact", "es", content.title, content.description);

export default function Page() {
  return <InfoPage page="contact" locale="es" />;
}
