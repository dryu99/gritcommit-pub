import { ibmPlexMono } from "@/ui/fonts";
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
      <body
        className={`${ibmPlexMono.className} flex h-svh flex-col antialiased`}
      >
        {/* <header className="px-4 lg:px-6 h-14 py-4 flex items-center">
          <Link className="flex items-center justify-center" href="#">
            <h1 className={`${ibmPlexMono.className} ml-2 text-xl font-bold`}>
              GritCommit 🤝
            </h1>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="#"
            >
              Login
            </Link>
          </nav>
        </header> */}
        <main className="relative min-h-screen flex-grow px-4 pt-8 sm:px-6 md:px-12 lg:px-16 xl:px-24">
          {children}
        </main>
      </body>
    </html>
  );
}
