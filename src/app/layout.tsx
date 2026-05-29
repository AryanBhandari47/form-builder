import { StorageHydration } from "@/modules/storage/StorageHydration";
import { StoreProvider } from "@/store/StoreProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ─────────────────────────────────────────────────────────────────────────────
// Font
// ─────────────────────────────────────────────────────────────────────────────

const inter = Inter({ subsets: ["latin"], display: "swap" });

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "FormCraft",
  description: "Production-grade form builder",
};

// ─────────────────────────────────────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full">
        <StoreProvider>
          <StorageHydration />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
