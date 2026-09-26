import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Nexora Studio | High-Performance SMB Web Systems & Growth Architecture",
  description: "Sub-second Next.js web platforms engineered for North American small and medium businesses. 14-day guaranteed turnaround, 100% code ownership, and measurable conversion lift.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} h-full antialiased`}>
      <body className="font-outfit" suppressHydrationWarning>{children}</body>
    </html>
  );
}
