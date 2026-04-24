'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminSession } from '@/lib/session';

/**
 * Client-side route guard for pages that require an admin session.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        const json = (await response.json()) as { session?: AdminSession };

        if (cancelled) {
          return;
        }

        if (response.ok && json.session) {
          setSession(json.session);
        } else {
          setSession(null);
          router.replace('/auth/login');
        }
      } catch {
        if (!cancelled) {
          setSession(null);
          router.replace('/auth/login');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !session) {
    return null;
  }

  return <>{children}</>;
}
