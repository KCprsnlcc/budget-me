import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppShell } from "@/components/shared/app-shell";
import { AuthProvider } from "@/components/auth/auth-context";
import { getUser, getSession } from "@/lib/supabase/auth";
import { Toaster } from "@/components/ui/sonner";
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
  icons: {
    icon: [
      { url: "/meta/favicon.ico", sizes: "any" },
      { url: "/meta/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/meta/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/meta/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/meta/site.webmanifest",
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
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
