import type { Metadata } from "next";
import { MyRuntimeProvider } from "@/app/MyRuntimeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "MiniLibX Search",
  description: "AI-powered documentation search for MiniLibX graphics library",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-dvh">
      <body className="h-dvh font-sans">
        <MyRuntimeProvider>{children}</MyRuntimeProvider>
      </body>
    </html>
  );
}
