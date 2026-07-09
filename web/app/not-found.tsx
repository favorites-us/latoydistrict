import Link from "next/link";
import { Header, Footer } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <>
      <Header locale="en" altPath="/" />
      <main>
        <div className="container prose">
          <h1>Page not found</h1>
          <p className="lede">
            That listing or page doesn&apos;t exist (stores do come and go in the district).
          </p>
          <p>
            <Link href="/">← Back to the directory</Link>
          </p>
        </div>
      </main>
      <Footer locale="en" />
    </>
  );
}
