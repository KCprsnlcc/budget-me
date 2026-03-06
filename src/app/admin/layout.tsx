"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { MobileSidebar } from "@/components/admin/mobile-sidebar";
import { Header } from "@/components/admin/header";
import { useAuth } from "@/components/auth/auth-context";
import { useRouter } from "next/navigation";
import { checkAdminRole } from "./_lib/admin-auth-service";
import { AlertTriangle } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function verifyAdmin() {
      if (authLoading) return;
      
      if (!user) {
        router.push("/");
        return;
      }

      const { isAdmin: adminStatus } = await checkAdminRole(user.id);
      
      if (!adminStatus) {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(adminStatus);
      setLoading(false);
    }

    verifyAdmin();
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-sm text-slate-600 mb-6">
            You do not have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-lenis-prevent className="bg-slate-50 text-slate-600 h-screen flex overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-700">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-white">
        <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
          {children}
        </div>
      </main>

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}
