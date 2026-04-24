'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, CalendarDays, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AdminSession } from '@/lib/session';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const isAuthRoute = pathname.startsWith('/auth');

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/opportunity', label: 'Opportunities' },
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setSessionLoading(true);

      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        const json = (await response.json()) as { session?: AdminSession };

        if (!cancelled) {
          setSession(response.ok && json.session ? json.session : null);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setSessionLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.assign('/');
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm transition-transform group-hover:scale-105">
              <CalendarDays size={16} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Event<span className="text-primary">Sync</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-[#0F172B] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            {sessionLoading ? (
              <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-100" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/admin"
                  className="rounded-lg bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-800 shadow-sm transition-all duration-200 hover:bg-blue-200 active:scale-95"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 active:scale-95"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all duration-200 ${
                  isAuthRoute
                    ? 'bg-blue-900 shadow-md'
                    : 'bg-blue-800 shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95'
                }`}
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {sessionLoading ? null : session ? (
                <>
                  <Link
                    href="/admin"
                    className="mt-2 rounded-lg bg-blue-100 px-4 py-2.5 text-center text-sm font-semibold text-blue-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await handleLogout();
                    }}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
