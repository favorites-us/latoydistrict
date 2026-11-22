"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { langForPath } from "@/lib/html-lang";

// Keeps <html lang> correct across client-side navigation between locales.
export function HtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = langForPath(pathname ?? "/");
  }, [pathname]);
  return null;
}
