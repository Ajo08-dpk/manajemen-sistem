import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pojok Citayam - Sistem Manajemen Restoran",
  description: "Sistem manajemen restoran modern Pojok Citayam di Citayam, Kota Depok dengan Next.js, TypeScript, dan Tailwind CSS",
  keywords: ["Pojok Citayam", "Restoran", "Citayam", "Depok", "Manajemen", "Next.js", "TypeScript", "Tailwind CSS", "POS"],
  authors: [{ name: "Pojok Citayam Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Pojok Citayam - Sistem Manajemen Restoran",
    description: "Sistem manajemen restoran modern Pojok Citayam di Citayam, Kota Depok untuk mengelola menu, pelanggan, dan pesanan",
    url: "https://pojokcitayam.example.com",
    siteName: "Pojok Citayam Restaurant Management",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pojok Citayam - Sistem Manajemen Restoran",
    description: "Sistem manajemen restoran modern di Citayam, Kota Depok",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
