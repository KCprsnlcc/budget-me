"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div data-lenis-prevent className="bg-slate-50 text-slate-600 h-screen flex overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-700">
        {}
        <Sidebar />

      {}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-white">
        <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        {}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
          {children}
        </div>
      </main>

      {}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      </div>
    </>
  );
}
