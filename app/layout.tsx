import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Leer Nederlands — Learn Dutch",
  description: "A rule-based Dutch language learning platform with grammar analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <Navbar />
        <main className="page-wrapper">{children}</main>
      </body>
    </html>
  );
}
