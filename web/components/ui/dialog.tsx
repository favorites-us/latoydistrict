"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({ children, className, closeLabel = "Close", ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { closeLabel?: string }) {
  return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-foreground/45 backdrop-blur-sm" />
    <DialogPrimitive.Content className={cn("fixed top-1/2 left-1/2 z-80 max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8", className)} {...props}>
      {children}
      <DialogPrimitive.Close aria-label={closeLabel} className="absolute top-3 right-3 grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary"><X className="size-5" /></DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
}
