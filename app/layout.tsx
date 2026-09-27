import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-outfit" suppressHydrationWarning>{children}</body>
    </html>
  );
}
