"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input, Textarea } from "./ui/input";
import { Button } from "./ui/button";
import { track } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";
import type { StorePhoto } from "@/lib/photos";

export default function PhotoReport({ photo, locale, onRemoved }: { photo: StorePhoto; locale: Locale; onRemoved?: () => void }) {
  const es = locale === "es";
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [hidden, setHidden] = useState(false);
  const resultRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (state === "ok") resultRef.current?.focus(); }, [state]);
  return <Dialog onOpenChange={(open) => { if (!open && hidden) onRemoved?.(); }}><DialogTrigger asChild><button type="button" className="min-h-10 text-xs text-primary underline underline-offset-4">{es ? "Solicitar eliminación de esta foto" : "Request removal of this photo"}</button></DialogTrigger><DialogContent closeLabel={es ? "Cerrar" : "Close"}>
    <DialogTitle className="pr-6 font-display text-3xl">{es ? "Solicitar eliminación de foto" : "Request photo removal"}</DialogTitle><DialogDescription className="mt-3 text-sm text-muted-foreground">{es ? "Si le pertenece la foto o representa al titular, envíe una solicitud. Retiramos la foto de nuestro sitio al procesar correctamente la solicitud." : "If you own the photo or represent its owner, send a request. We remove it from our site when the request is successfully processed."}</DialogDescription>
    <p ref={resultRef} role="status" tabIndex={-1} className={state === "ok" ? "mt-6 rounded-lg bg-secondary p-4 text-sm" : "sr-only"}>{state === "ok" ? (hidden ? (es ? "Foto retirada de nuestro sitio. No podemos borrar copias ya descargadas por terceros." : "The photo has been removed from our site. Copies already downloaded by others cannot be recalled.") : (es ? "Solicitud guardada. No pudimos retirar la foto automáticamente; escriba al correo de abajo para seguimiento." : "Your request is saved. Automatic removal did not complete; email the address below for follow-up.")) : ""}</p>
    {state !== "ok" && <form className="mt-6 grid gap-4" onSubmit={async (event) => {
      event.preventDefault(); setState("busy"); const data = Object.fromEntries(new FormData(event.currentTarget));
      try { const response = await fetch("/api/photo-reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, photo_id: photo.id, locale }) }); const body = await response.json(); if (!response.ok) throw new Error(); setHidden(body.hidden === true); setState("ok"); track("photo_removal_submit", { photo_id: photo.id }); }
      catch { setState("err"); }
    }}>
      <p className="text-xs text-muted-foreground">{photo.source_label} / {photo.id}</p>
      <label className="field-label">{es ? "Su nombre o negocio" : "Your name or business"}<Input name="name" required maxLength={120} autoComplete="organization" /></label>
      <label className="field-label">{es ? "Correo para seguimiento (opcional)" : "Email for follow-up (optional)"}<Input name="contact" type="email" maxLength={200} autoComplete="email" /></label>
      <label className="field-label">{es ? "Motivo" : "Reason"}<Textarea name="reason" required minLength={10} maxLength={1500} /></label>
      <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="flex items-start gap-3 text-xs"><input name="rights_holder" type="checkbox" value="yes" required />{es ? "Soy titular de esta foto o estoy autorizado para representarlo." : "I own this photo or am authorized to represent its owner."}</label>
      <p className="text-xs text-muted-foreground">{es ? "Usamos estos datos para gestionar la solicitud. No se publican ni se añaden a listas comerciales." : "These details are used to handle your request. They are not published or added to marketing lists."}</p>
      <Button disabled={state === "busy"} type="submit">{state === "busy" ? (es ? "Procesando…" : "Processing…") : (es ? "Solicitar eliminación" : "Request removal")}</Button>
      {state === "err" && <p role="alert" className="text-sm text-red-700">{es ? "No se pudo procesar la solicitud. Use el correo de abajo." : "The request could not be processed. Please use the email below."}</p>}
    </form>}
    <p className="mt-5 break-words text-xs"><a className="text-primary underline" href={`mailto:hello@toydistrictlosangeles.com?subject=${encodeURIComponent(`Photo removal: ${photo.id}`)}`}>hello@toydistrictlosangeles.com</a></p>
  </DialogContent></Dialog>;
}
