import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/shared/app-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BudgetMe - Professional Financial Clarity",
  description:
    "The refined platform for professional financial clarity and growth. Track expenses, set goals, and build wealth with AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
