import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Powered Railway Traffic Control System",
  description: "Maximizing section throughput using AI-powered precise train traffic control for Indian Railways",
  keywords: ["AI", "Railway", "Traffic Control", "Indian Railways", "Train Management", "Transportation"],
  authors: [{ name: "AI Railway Team" }],
  openGraph: {
    title: "AI-Powered Railway Traffic Control System",
    description: "Revolutionary AI system for optimizing railway traffic flow and maximizing throughput",
    url: "https://railway-ai.example.com",
    siteName: "AI Railway Control",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Railway Traffic Control System",
    description: "Revolutionary AI system for optimizing railway traffic flow",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
