"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function StoreViewEvent({ slug }: { slug: string }) {
  useEffect(() => {
    track("store_view", {
      store_slug: slug,
    });
  }, [slug]);
  return null;
}
