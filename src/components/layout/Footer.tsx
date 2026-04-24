import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CalendarDays size={16} className="text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Event<span className="text-primary">Sync</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Your campus hub for discovering events, opportunities, and connections that matter.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Explore</h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/events', label: 'Events' },
                { href: '/opportunity', label: 'Opportunities' },
                { href: '/auth/login', label: 'Login' },
                { href: '/admin', label: 'Admin' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Account</h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/auth/login', label: 'Login' },
                { href: '/auth/signup', label: 'Sign Up' },
                { href: '/admin', label: 'Admin' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-500">© 2026 EventSync. All rights reserved.</p>
          <p className='text-sm text-slate-500'>Engineered By Harshit Singhal</p>
          <p className="text-sm text-slate-500">Built for campus event discovery.</p>
        </div>
      </div>
    </footer>
  );
}
