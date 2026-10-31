import PhotosPage from "@/components/pages/PhotosPage";
import { altMeta } from "@/lib/meta";
export const metadata = altMeta("/photos", "en", "Photos & removal requests", "Image sources and photo removal requests for the LA Toy District directory.");
export default function Page() { return <PhotosPage locale="en" />; }
