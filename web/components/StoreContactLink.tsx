"use client";

import type { ReactNode } from "react";

export default function StoreContactLink({ href, slug, method, children, external = false }: {
  href: string;
  slug: string;
  method: "phone" | "email" | "website" | "buying_source";
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "nofollow noopener noreferrer" : undefined}
      onClick={() => {
        (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.("event", "store_contact_click", {
          store_slug: slug,
          contact_method: method,
        });
      }}
    >
      {children}
    </a>
  );
}
