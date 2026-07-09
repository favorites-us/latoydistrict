"use client";

import { useEffect } from "react";

export default function StoreViewEvent({ slug }: { slug: string }) {
  useEffect(() => {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", "store_view", {
      store_slug: slug,
    });
  }, [slug]);
  return null;
}
