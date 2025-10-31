import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TextVenture - AI Dungeon Crawler",
  description: "A procedurally generated dungeon crawler powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
