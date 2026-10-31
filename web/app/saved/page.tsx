import SavedPage from "@/components/pages/SavedPage";
import { altMeta } from "@/lib/meta";
export const metadata = { ...altMeta("/saved", "en", "Saved suppliers", "Save, compare and plan your Toy District buying trip."), robots: { index: false, follow: true } };
export default function Page() { return <SavedPage locale="en" />; }
