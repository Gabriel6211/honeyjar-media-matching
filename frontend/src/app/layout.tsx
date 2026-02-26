import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HoneyJar Media Matching",
  description: "Find the right reporters for your story brief",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen flex-col bg-white">
          <header className="border-b border-zinc-100 px-6 py-4">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-500">
                H
              </div>
              <div>
                <h1 className="text-sm font-semibold text-zinc-800">
                  HoneyJar
                </h1>
                <p className="text-xs text-zinc-400">
                  Media Matching
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
