import type { Metadata } from "next";
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
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
