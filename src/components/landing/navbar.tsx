"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { LANDING_NAV_LINKS } from "@/lib/constants";
import { useAuth } from "@/components/auth/auth-context";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const [loading, setLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  // Simulate loading state on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isUserMenuOpen]);

  // Show loading skeleton while checking auth
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <nav className="fixed w-full z-50 top-0 border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Skeleton width={120} height={32} borderRadius={8} />
              <div className="hidden lg:flex items-center gap-6 ml-4">
                <Skeleton width={60} height={16} />
                <Skeleton width={60} height={16} />
                <Skeleton width={60} height={16} />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Skeleton width={80} height={36} borderRadius={8} />
              <Skeleton width={120} height={36} borderRadius={8} />
            </div>
            <Skeleton width={32} height={32} borderRadius={8} className="lg:hidden" />
          </div>
        </nav>
      </SkeletonTheme>
    );
  }

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

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="default" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Dashboard
                </Button>
              </Link>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px] cursor-pointer"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <UserAvatar user={user} size="md" />
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-40 py-1">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={user} size="sm" />
                          <div className="text-left">
                            <div className="text-xs font-medium text-slate-700 truncate">
                              {user.user_metadata?.full_name || user.email || "User"}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          startSignOut(async () => {
                            await signOut();
                          });
                        }}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSigningOut ? (
                          <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                            <>
                              <Skeleton width={12} height={12} circle />
                              Signing out...
                            </>
                          </SkeletonTheme>
                        ) : (
                          <>
                            <LogOut size={14} />
                            Sign out
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="default">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="default">Start your budget</Button>
              </Link>
            </>
          )}
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
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                    Dashboard
                  </Button>
                </Link>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <UserAvatar user={user} size="sm" />
                    <div className="text-left flex-1">
                      <div className="text-xs font-medium text-slate-700 truncate">
                        {user.user_metadata?.full_name || user.email || "User"}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {user.email}
                      </div>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {/* Mobile Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg z-40 py-1">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={user} size="sm" />
                          <div className="text-left">
                            <div className="text-xs font-medium text-slate-700 truncate">
                              {user.user_metadata?.full_name || user.email || "User"}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setMobileOpen(false);
                          startSignOut(async () => {
                            await signOut();
                          });
                        }}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSigningOut ? (
                          <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                            <>
                              <Skeleton width={12} height={12} circle />
                              Signing out...
                            </>
                          </SkeletonTheme>
                        ) : (
                          <>
                            <LogOut size={14} />
                            Sign out
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Start your budget</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
