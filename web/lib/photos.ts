import manifest from "@/data/photos.json";
export type StorePhoto = (typeof manifest.photos)[number];
export const photos = manifest.photos;
export function photosForStore(slug: string): StorePhoto[] { return photos.filter((photo) => photo.store_slug === slug && photo.status === "published"); }
export function photoForStore(slug: string): StorePhoto | undefined { return photosForStore(slug)[0]; }
export function photoById(id: string): StorePhoto | undefined { return photos.find((photo) => photo.id === id); }
