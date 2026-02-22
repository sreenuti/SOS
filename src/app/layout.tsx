import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UnderwaterBackground from "@/components/UnderwaterBackground";
import { MarineDebrisProvider } from "@/context/MarineDebrisContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Deep Ocean Environmental Dashboard",
  description: "Marine research monitoring — boat traffic, water quality, temperature, debris",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-ocean-bg" style={{ background: "#0a1628", color: "#f1f5f9" } as React.CSSProperties}>
      <body
        className={`${inter.variable} font-sans antialiased bg-ocean-bg text-ocean-text min-h-screen relative`}
        style={{ background: "#0a1628", color: "#f1f5f9", minHeight: "100vh" } as React.CSSProperties}
      >
        <MarineDebrisProvider>
          <UnderwaterBackground />
          <div className="relative z-10">{children}</div>
        </MarineDebrisProvider>
      </body>
    </html>
  );
}
