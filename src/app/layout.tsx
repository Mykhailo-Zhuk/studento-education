import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduOrchestrate – Навчальний Простір",
  description: "AI-Driven Learning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
