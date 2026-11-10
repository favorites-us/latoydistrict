import type { Metadata } from "next";
import Script from "next/script";
import { SITE_URL, stores } from "@/lib/stores";
import { BuyerProvider } from "@/components/BuyerProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LA Toy District Directory — Wholesale Toys in Downtown Los Angeles",
    template: "%s | LA Toy District",
  },
  description:
    "Explore toy, party and gift business listings in Downtown LA. Compare published buying details, save suppliers and plan your visit.",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_CLIENT = "ca-pub-4866951344575541";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link rel="preload" href="/fonts/26d4368bf94c0ec4-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head>
      <body>
        <BuyerProvider knownSlugs={stores.map((store) => store.slug)}>{children}</BuyerProvider>
        <Script
          id="adsbygoogle-init"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
