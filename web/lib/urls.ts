import { formatText, type Locale } from "./i18n";

export function httpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password ? url.toString() : null;
  } catch { return null; }
}

/** Directory fields sometimes contain non-Yelp URLs; identify the actual host. */
export function directoryLinkLabel(value: string, locale: Locale): string | null {
  const href = httpUrl(value);
  if (!href) return null;
  const host = new URL(href).hostname.toLowerCase().replace(/^www\./, "");
  return host === "yelp.com" || host.endsWith(".yelp.com") ? "Yelp" : formatText(locale, "directory_link", { host });
}
