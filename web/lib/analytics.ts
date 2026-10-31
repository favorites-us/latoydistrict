type BuyerEvent = "shortlist_add" | "shortlist_remove" | "compare_open" | "visit_print" | "quote_copy" | "directory_filter" | "photo_removal_submit" | "store_view" | "store_contact_click" | "lead_submit" | "store_inquiry";

// Buffer early events in the same queue consumed by gtag. Never include free
// text, names, email addresses, phone numbers or quote contents in this queue.
export function track(event: BuyerEvent, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_GA_ID) return;
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer ??= [];
  if (w.gtag) w.gtag("event", event, params);
  else {
    function queued(...args: unknown[]) { void args; w.dataLayer!.push(arguments); }
    queued("event", event, params);
  }
}
