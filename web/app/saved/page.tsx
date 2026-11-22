import SavedPage from "@/components/pages/SavedPage";
import { storeMeta } from "@/lib/meta";
export const metadata = { ...storeMeta("/saved", "en", "Saved suppliers", "Save, compare and plan your Toy District buying trip."), robots: { index: false, follow: true } };
export default function Page() { return <SavedPage locale="en" />; }
