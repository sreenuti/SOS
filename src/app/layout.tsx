import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className="bg-ocean-bg">
      <body
        className={`${inter.variable} font-sans antialiased bg-ocean-bg text-ocean-text min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
