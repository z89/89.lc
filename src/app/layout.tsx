import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
import { TanstackProvider } from "./providers/tanstackProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "89.lc - URL Shortener & Logger",
  description: "89.lc is a free URL shortener and logger that allows you to shorten any URL and track it's metadata",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`flex h-full w-full justify-center items-center bg-slate-100 p-10 ${inter.className} `}>
        <TanstackProvider>{children}</TanstackProvider>
        <Analytics />
      </body>
    </html>
  );
}
