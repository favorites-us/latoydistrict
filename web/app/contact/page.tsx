import InfoPage from "@/components/pages/InfoPage";
import { siteInfo } from "@/lib/content/site-info";
import { altMeta } from "@/lib/meta";

const content = siteInfo.contact.en;
export const metadata = altMeta("/contact", "en", content.title, content.description);

export default function Page() {
  return <InfoPage page="contact" locale="en" />;
}
