import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kodeva",
    template: "%s | Kodeva",
  },
  description: "Discover stories, products, and ideas from Kodeva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <Providers>
          <main className="flex-1">{children}</main>
        </Providers>
        <SiteFooter />
      </body>
    </html>
  );
}
