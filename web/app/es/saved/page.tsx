import SavedPage from "@/components/pages/SavedPage";
import { altMeta } from "@/lib/meta";
export const metadata = { ...altMeta("/saved", "es", "Proveedores guardados", "Guarde, compare y prepare su visita de compras al Toy District."), robots: { index: false, follow: true } };
export default function Page() { return <SavedPage locale="es" />; }
