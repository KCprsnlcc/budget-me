"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { LANDING_NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 border-b border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo variant="landing" size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 ml-4">
            {LANDING_NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" size="default">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="default">Start your budget</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-slate-900 cursor-pointer p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
          {LANDING_NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-slate-600 hover:text-slate-900 py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="w-full">Start your budget</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
