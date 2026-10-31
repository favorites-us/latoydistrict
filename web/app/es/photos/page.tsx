import PhotosPage from "@/components/pages/PhotosPage";
import { altMeta } from "@/lib/meta";
export const metadata = altMeta("/photos", "es", "Fotos y solicitudes de eliminación", "Fuentes de imágenes y solicitudes de eliminación del directorio LA Toy District.");
export default function Page() { return <PhotosPage locale="es" />; }
