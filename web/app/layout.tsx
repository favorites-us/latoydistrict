import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { SITE_URL, stores } from "@/lib/stores";
import { BuyerProvider } from "@/components/BuyerProvider";
import "./globals.css";
import { googleInitScript } from "@/lib/analytics-config";

const geist = localFont({ src: "./fonts/geist-latin.woff2", weight: "100 900", variable: "--font-geist", display: "swap" });

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
const ADSENSE_CLIENT = "ca-pub-9659602470766254";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <Script id="google-init" strategy="beforeInteractive">
          {googleInitScript(GA_ID)}
        </Script>
        <BuyerProvider knownSlugs={stores.map((store) => store.slug)}>{children}</BuyerProvider>
        <Script
          id="adsbygoogle-init"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {GA_ID ? (
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        ) : null}
      </body>
    </html>
  );
}
