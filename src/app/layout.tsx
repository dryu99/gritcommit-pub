import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

export const nunito = Nunito({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "GritCommit",
  description: "The grittiest of commitment devices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.className} flex h-svh flex-col antialiased`}>
        <main className="relative flex-grow p-12">{children}</main>
      </body>
    </html>
  );
}
