'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Clock,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  deadline?: string;
  contact_info?: string;
  type?: string;
  stipend?: string;
  eligibility?: string;
  registration_link?: string | null;
  [key: string]: unknown;
}

interface FetchState {
  opportunity: Opportunity | null;
  loading: boolean;
  error: string | null;
}

const typeColors: Record<string, string> = {
  Research: 'bg-teal-100 text-teal-700',
  Leadership: 'bg-indigo-100 text-indigo-700',
  Volunteer: 'bg-rose-100 text-rose-700',
  Internship: 'bg-amber-100 text-amber-700',
};

const typeBg: Record<string, string> = {
  Research: 'from-teal-700 to-teal-950',
  Leadership: 'from-indigo-700 to-indigo-950',
  Volunteer: 'from-rose-700 to-rose-950',
  Internship: 'from-amber-700 to-amber-950',
};

function parseContactInfo(raw: string): {
  icon: React.ElementType;
  label: string;
  href: string | null;
} {
  const trimmed = raw.trim();
  if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(trimmed)) {
    return { icon: Mail, label: trimmed, href: `mailto:${trimmed}` };
  }
  if (/^[+\d][\d\s\-().]{6,}$/.test(trimmed)) {
    return { icon: Phone, label: trimmed, href: `tel:${trimmed.replace(/\s/g, '')}` };
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return { icon: ExternalLink, label: trimmed, href: trimmed };
  }
  return { icon: MessageSquare, label: trimmed, href: null };
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ''}`} />;
}

function LoadingSkeleton() {
  return (
    <>
      <section className="bg-slate-800 py-20">
        <div className="container mx-auto space-y-4 px-4">
          <Skeleton className="h-4 w-36 bg-slate-700" />
          <Skeleton className="h-6 w-24 bg-slate-700" />
          <Skeleton className="h-12 w-2/3 bg-slate-700" />
          <Skeleton className="h-5 w-48 bg-slate-700" />
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-4 h-12 w-36" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-52 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="flex min-h-[60vh] items-center bg-slate-50 py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Could not load opportunity</h2>
        <p className="mx-auto mb-6 max-w-sm text-slate-500">{message}</p>
        <Link
          href="/opportunity"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-all hover:bg-primary/90"
        >
          <ArrowLeft size={16} /> Back to Opportunities
        </Link>
      </div>
    </section>
  );
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<FetchState>({
    opportunity: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setState({ opportunity: null, loading: true, error: null });

      try {
        const res = await fetch(`/api/opportunities/${id}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }

        if (!cancelled) {
          setState({ opportunity: json.opportunity, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ opportunity: null, loading: false, error: String(error) });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { opportunity, loading, error } = state;

  if (loading) return <LoadingSkeleton />;
  if (error || !opportunity) {
    return <ErrorState message={error ?? 'Opportunity not found.'} />;
  }

  const heroBg = typeBg[opportunity.type ?? ''] ?? 'from-slate-800 to-slate-950';
  const typeBadge = typeColors[opportunity.type ?? ''] ?? 'bg-slate-100 text-slate-700';
  const contact = opportunity.contact_info
    ? parseContactInfo(String(opportunity.contact_info))
    : null;
  const registrationLink =
    typeof opportunity.registration_link === 'string'
      ? opportunity.registration_link.trim()
      : '';
  const action = registrationLink
    ? { href: registrationLink, label: 'Apply Now' }
    : contact?.href
      ? {
          href: contact.href,
          label:
            contact.href.startsWith('mailto:') || contact.href.startsWith('tel:')
              ? 'Contact Organizer'
              : 'Open Contact',
        }
      : null;

  const sidebarItems = [
    { icon: Building2, label: 'Organization', value: opportunity.organization },
    { icon: Clock, label: 'Deadline', value: opportunity.deadline },
  ].filter((item) => Boolean(item.value));

  return (
    <>
      <title>{opportunity.title} - EventSync</title>
      <meta
        name="description"
        content={opportunity.description ?? `Details for ${opportunity.title}`}
      />

      <section className={`relative overflow-hidden bg-gradient-to-br ${heroBg} py-20`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,white,transparent)] opacity-10" />
        <div className="container relative z-10 mx-auto px-4">
          <Link
            href="/opportunity"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            {opportunity.type && (
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${typeBadge}`}>
                {opportunity.type}
              </span>
            )}
            {opportunity.stipend && (
              <span className="rounded-full bg-green-900/40 px-3 py-1.5 text-xs font-semibold text-green-300">
                {String(opportunity.stipend)}
              </span>
            )}
          </div>

          <h1 className="mb-3 max-w-2xl text-4xl font-extrabold leading-tight text-white md:text-5xl">
            {opportunity.title}
          </h1>

          {opportunity.organization && (
            <p className="flex items-center gap-2 text-lg text-white/70">
              <Building2 size={16} className="shrink-0" />
              {String(opportunity.organization)}
            </p>
          )}
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {opportunity.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
                >
                  <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                    About This Opportunity
                  </h2>
                  <div className="space-y-4">
                    {String(opportunity.description)
                      .split('\n\n')
                      .map((paragraph, index) => (
                        <p key={index} className="leading-relaxed text-slate-600">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </motion.div>
              )}

              {contact && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                  className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
                >
                  <h2 className="mb-5 text-xl font-extrabold text-slate-900">Contact</h2>
                  <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <contact.icon size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="mb-0.5 text-xs font-medium text-slate-400">Reach out via</p>
                      {contact.href ? (
                        <a
                          href={contact.href}
                          target={contact.href.startsWith('http') ? '_blank' : undefined}
                          rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="break-all text-sm font-semibold text-primary hover:underline"
                        >
                          {contact.label}
                        </a>
                      ) : (
                        <p className="break-all text-sm font-semibold text-slate-800">
                          {contact.label}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2 pt-2">
                {action ? (
                  <a
                    href={action.href}
                    target={action.href.startsWith('http') ? '_blank' : undefined}
                    rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-10 py-3.5 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/30 md:w-auto"
                  >
                    {action.label}
                  </a>
                ) : (
                  <>
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-slate-300 px-10 py-3.5 font-bold text-slate-600 md:w-auto"
                    >
                      Application Unavailable
                    </button>
                    <p className="text-sm text-slate-500">
                      No application or contact link has been added for this opportunity yet.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {sidebarItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-5 text-lg font-bold text-slate-900">Details</h3>
                  <div className="space-y-4">
                    {sidebarItems.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400">{label}</p>
                          <p className="text-sm font-semibold text-slate-800">{String(value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {opportunity.deadline && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 }}
                  className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Application Deadline</p>
                    <p className="mt-0.5 text-sm font-semibold text-amber-700">
                      {String(opportunity.deadline)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Submit your application before this date.
                    </p>
                  </div>
                </motion.div>
              )}

              {opportunity.eligibility && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.24 }}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-3 text-base font-bold text-slate-900">Eligibility</h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {String(opportunity.eligibility)}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
