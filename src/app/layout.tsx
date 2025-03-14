import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PrivyAuthProvider } from '@/components/auth/privy-provider';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Ethnica - Support Your Tribe & Grow Local Economies",
  description: "Discover and support businesses that align with your values and demographics.",
  keywords: ["local business", "shop local", "ethnic business", "diverse economy", "community support"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fontSans.variable} antialiased bg-background min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyAuthProvider>
            {children}
          </PrivyAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
