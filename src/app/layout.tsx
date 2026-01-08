import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BEAUTIFY | Your Beauty Journey Begins Here",
  description: "Discover exclusive beauty collections, personalized recommendations, and fast delivery with BEAUTIFY - your trusted beauty e-commerce platform.",
  keywords: ["beauty", "cosmetics", "skincare", "makeup", "beauty products"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: "'Inter', var(--font-geist-sans), system-ui, sans-serif" }}
        suppressHydrationWarning
      >
        <Header />
        {children}
      </body>
    </html>
  );
}

