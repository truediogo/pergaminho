import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../style/globals.css";
import { ThemeProvider } from "@/contexts/themeContext";
import { ModelProvider } from "@/contexts/modelContext";
import { HeaderWrapper } from "@/components/HeaderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pergaminho",
  description: "Chat with local AI models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen overflow-hidden`}>
        <ThemeProvider>
          <ModelProvider>
            <HeaderWrapper />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
