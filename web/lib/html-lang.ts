// The single root layout renders <html lang="en"> for every route. Spanish pages
// mark their header, main and footer with lang="es" in server HTML; these helpers
// also correct the document-level attribute in the browser. A second root layout
// would fix the server attribute too, but it breaks the styled 404 page in this
// Next.js version without an experimental flag.
export function langForPath(pathname: string): "en" | "es" {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
}

// Runs before hydration so assistive technology and the first paint see the right language.
export const htmlLangScript =
  "(function(){var p=location.pathname;if(p==='/es'||p.indexOf('/es/')===0)document.documentElement.lang='es';})();";
