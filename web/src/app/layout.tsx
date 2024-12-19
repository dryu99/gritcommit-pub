import { logout } from "@/lib/auth/auth.actions";
import { getSessionUser } from "@/lib/auth/auth.lib";
import { Link } from "@/ui/components/common/link";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();

  return (
    <html lang="en" data-theme="light">
      <body
        className={`${ibmPlexMono.className} flex h-svh flex-col antialiased`}
      >
        <header className="flex h-14 items-center px-4 py-4 lg:px-6">
          <nav className="font-bold">
            <Link href="/">
              <span className="mr-2">🤝</span>GritCommit
            </Link>
          </nav>
          {sessionUser && (
            <nav className="ml-auto flex gap-4 sm:gap-6">
              <button
                onClick={logout}
                className="text-xs underline-offset-4 hover:underline"
              >
                Logout
              </button>
            </nav>
          )}
        </header>
        <main className="relative min-h-screen flex-grow px-4 pt-8 sm:px-6 md:px-12 lg:px-16 xl:px-24">
          {children}
        </main>
      </body>
    </html>
  );
}
