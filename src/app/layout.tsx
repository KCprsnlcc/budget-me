import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/shared/app-shell";
import { AuthProvider } from "@/components/auth/auth-context";
import { getUser, getSession } from "@/lib/supabase/auth";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Parallel fetch of user + session using Promise.all() (async-parallel)
  // Both use React.cache() for per-request deduplication (server-cache-react)
  const [user, session] = await Promise.all([getUser(), getSession()]);

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider initialUser={user} initialSession={session}>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
