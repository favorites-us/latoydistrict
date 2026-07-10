"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

// Per-store request form. Posts to the shared /api/leads endpoint with the
// store attached, so early demand for a specific listing lands in one place
// for the operator to forward to the business.
export default function StoreInquiryForm({
  locale,
  storeSlug,
  storeName,
}: {
  locale: Locale;
  storeSlug: string;
  storeName: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale, store_slug: storeSlug, store_name: storeName }),
      });
      if (!res.ok) throw new Error(String(res.status));
      window.gtag?.("event", "store_inquiry", { store_slug: storeSlug });
      setState("ok");
      form.reset();
    } catch {
      setState("err");
    }
  }

  return (
    <div className="lead-box" id="ask-store">
      <h2>{t(locale, "inquiry_h2")}</h2>
      <p className="sub">{t(locale, "inquiry_sub")}</p>
      <form onSubmit={onSubmit}>
        <input name="name" required maxLength={120} placeholder={t(locale, "lead_name")} />
        <input name="contact" required maxLength={200} placeholder={t(locale, "lead_contact")} />
        <textarea name="items" required maxLength={2000} placeholder={t(locale, "inquiry_message")} />
        <button disabled={state === "busy"}>{t(locale, "inquiry_submit")}</button>
      </form>
      {state === "ok" ? <p className="lead-msg ok">{t(locale, "lead_ok")}</p> : null}
      {state === "err" ? (
        <p className="lead-msg err">
          {t(locale, "lead_err")} <a href="mailto:hello@latoydistrict.com">hello@latoydistrict.com</a>
        </p>
      ) : null}
    </div>
  );
}
