import { inter } from "@/ui/fonts";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: "GritCommit",
  description: "GritCommit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.className} antialiased flex h-svh flex-col`}>
        <main className="min-h-screen pt-8 relative flex-grow px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
          {children}
        </main>
      </body>
    </html>
  );
}
