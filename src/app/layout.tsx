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
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
