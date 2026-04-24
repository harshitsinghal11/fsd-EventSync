'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowRight, CalendarDays, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminSession } from '@/lib/session';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialEmail = new URLSearchParams(window.location.search).get('email');
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = (await res.json()) as {
        error?: string;
        hint?: string;
        session?: AdminSession;
      };

      if (!res.ok || !json.session) {
        const message = json.hint ? `${json.error} - ${json.hint}` : json.error;
        setError(message ?? 'Login failed. Please try again.');
        return;
      }

      window.location.assign('/admin');
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <CalendarDays size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Login</h1>
            <p className="text-slate-500 text-sm mt-1">Access your EventSync dashboard</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-5"
              >
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email
              </Label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-9 h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-9 h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-bold text-base bg-[#1447E6] hover:bg-primary/90 shadow-md hover:shadow-primary/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Login <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-slate-600 mt-6">
            New user?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary hover:text-primary/80">
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
            Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
