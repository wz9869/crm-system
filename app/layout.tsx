import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Lite - Customer Grading System",
  description: "CRM Lite for motorized shades sales team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
