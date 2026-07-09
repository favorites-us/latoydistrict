"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function LeadForm({ locale }: { locale: Locale }) {
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
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      window.gtag?.("event", "lead_submit", { buyer_type: data.buyer_type });
      setState("ok");
      form.reset();
    } catch {
      setState("err");
    }
  }

  return (
    <div className="lead-box" id="get-quotes">
      <h2>{t(locale, "lead_h2")}</h2>
      <p className="sub">{t(locale, "lead_sub")}</p>
      <form onSubmit={onSubmit}>
        <input name="name" required maxLength={120} placeholder={t(locale, "lead_name")} />
        <input name="contact" required maxLength={200} placeholder={t(locale, "lead_contact")} />
        <select name="buyer_type" defaultValue="">
          <option value="" disabled>
            {t(locale, "lead_type")}
          </option>
          <option value="party_planner">{t(locale, "lead_type_party")}</option>
          <option value="store_owner">{t(locale, "lead_type_store")}</option>
          <option value="reseller">{t(locale, "lead_type_reseller")}</option>
          <option value="other">{t(locale, "lead_type_other")}</option>
        </select>
        <textarea name="items" required maxLength={2000} placeholder={t(locale, "lead_items")} />
        <button disabled={state === "busy"}>{t(locale, "lead_submit")}</button>
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
