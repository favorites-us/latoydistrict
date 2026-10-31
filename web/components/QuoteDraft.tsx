"use client";

import { useRef, useState } from "react";
import { Copy, FilePenLine } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/input";
import { makeQuoteDraft } from "@/lib/buyer-tools";
import { track } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";

export default function QuoteDraft({ name, slug, locale }: { name: string; slug: string; locale: Locale }) {
  const es = locale === "es";
  const [values, setValues] = useState({ items: "", quantity: "", date: "" });
  const [status, setStatus] = useState("");
  const preview = useRef<HTMLTextAreaElement>(null);
  const draft = makeQuoteDraft(locale, name, values);
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline"><FilePenLine />{es ? "Preparar consulta" : "Draft an inquiry"}</Button></DialogTrigger>
    <DialogContent closeLabel={es ? "Cerrar" : "Close"}>
      <DialogTitle className="pr-8 font-display text-3xl font-semibold">{es ? "Prepare su consulta" : "A better first inquiry"}</DialogTitle>
      <DialogDescription className="mt-2 text-sm text-muted-foreground">{es ? `Para ${name}. Copie el texto y envíelo por su cuenta. No se guarda ni se envía desde aquí.` : `For ${name}. Copy the draft and send it yourself. Nothing is saved or sent from here.`}</DialogDescription>
      <div className="mt-6 grid gap-4">
        <label className="field-label">{es ? "Artículo, marca y SKU" : "Item, brand & SKU"}<Input value={values.items} maxLength={600} onChange={(e) => { setValues({ ...values, items: e.target.value }); setStatus(""); }} /></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="field-label">{es ? "Cantidad" : "Quantity"}<Input value={values.quantity} maxLength={100} onChange={(e) => { setValues({ ...values, quantity: e.target.value }); setStatus(""); }} placeholder={es ? "p. ej., 6 cajas" : "e.g. 6 cases"} /></label>
          <label className="field-label">{es ? "Fecha requerida" : "Needed by"}<Input type="date" value={values.date} onChange={(e) => { setValues({ ...values, date: e.target.value }); setStatus(""); }} /></label>
        </div>
        <label className="field-label">{es ? "Vista previa" : "Your draft"}<Textarea ref={preview} readOnly value={draft} className="min-h-56 text-sm leading-relaxed" /></label>
        <Button onClick={async () => {
          try { await navigator.clipboard.writeText(draft); setStatus(es ? "Copiado. Envíelo al negocio por su cuenta." : "Copied. Send it to the business using your preferred channel."); track("quote_copy", { store_slug: slug }); }
          catch { preview.current?.focus(); preview.current?.select(); setStatus(es ? "Seleccione y copie el texto manualmente." : "Select and copy the draft manually."); }
        }}><Copy />{es ? "Copiar consulta" : "Copy inquiry"}</Button>
        <p role="status" className="text-sm text-muted-foreground">{status}</p>
      </div>
    </DialogContent>
  </Dialog>;
}
