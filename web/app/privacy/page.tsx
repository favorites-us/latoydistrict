import InfoPage from "@/components/pages/InfoPage";
import { siteInfo } from "@/lib/content/site-info";
import { altMeta } from "@/lib/meta";

const content = siteInfo.privacy.en;
export const metadata = altMeta("/privacy", "en", content.title, content.description);

export default function Page() {
  return <InfoPage page="privacy" locale="en" />;
}
