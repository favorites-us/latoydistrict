import InfoPage from "@/components/pages/InfoPage";
import { siteInfo } from "@/lib/content/site-info";
import { altMeta } from "@/lib/meta";

const content = siteInfo.about.en;
export const metadata = altMeta("/about", "en", content.title, content.description);

export default function Page() {
  return <InfoPage page="about" locale="en" />;
}
