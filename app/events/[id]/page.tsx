'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Gift,
  MapPin,
  Phone,
  Timer,
  User,
} from 'lucide-react';
import {
  EVENT_CATEGORY_BACKGROUNDS,
  EVENT_CATEGORY_COLORS,
  normalizeEventCategory,
} from '@/lib/event-categories';

interface SupabaseEvent {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
  duration?: string;
  perks?: string | string[];
  category?: string;
  registration_link?: string | null;
  [key: string]: unknown;
}

interface Coordinator {
  id: string;
  event_id: string;
  name: string;
  phone?: string;
  [key: string]: unknown;
}

interface FetchState {
  event: SupabaseEvent | null;
  coordinators: Coordinator[];
  loading: boolean;
  error: string | null;
}

function parsePerks(raw: string | string[] | undefined | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return raw
    .split(/[,\n]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ''}`} />;
}

function LoadingSkeleton() {
  return (
    <>
      <section className="bg-slate-800 py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="mb-8 h-4 w-28 bg-slate-700" />
          <Skeleton className="mb-4 h-6 w-24 bg-slate-700" />
          <Skeleton className="mb-3 h-12 w-2/3 bg-slate-700" />
          <Skeleton className="h-5 w-1/2 bg-slate-700" />
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-40 w-full" />
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
        <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Could not load event</h2>
        <p className="mx-auto mb-6 max-w-sm text-slate-500">{message}</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-all hover:bg-primary/90"
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>
      </div>
    </section>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<FetchState>({
    event: null,
    coordinators: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setState({ event: null, coordinators: [], loading: true, error: null });

      try {
        const res = await fetch(`/api/events/${id}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }

        if (!cancelled) {
          setState({
            event: json.event,
            coordinators: json.coordinators ?? [],
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            event: null,
            coordinators: [],
            loading: false,
            error: String(error),
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { event, coordinators, loading, error } = state;

  if (loading) return <LoadingSkeleton />;
  if (error || !event) return <ErrorState message={error ?? 'Event not found.'} />;

  const perks = parsePerks(event.perks as string | string[] | undefined);
  const category = normalizeEventCategory(event.category);
  const heroBg = EVENT_CATEGORY_BACKGROUNDS[category ?? ''] ?? 'from-slate-800 to-slate-950';
  const categoryBadge = EVENT_CATEGORY_COLORS[category ?? ''] ?? 'bg-slate-100 text-slate-700';
  const registrationLink =
    typeof event.registration_link === 'string' ? event.registration_link.trim() : '';

  const detailItems = [
    { icon: Calendar, label: 'Date', value: event.date },
    { icon: Clock, label: 'Time', value: event.time },
    { icon: MapPin, label: 'Venue', value: event.venue },
    { icon: Timer, label: 'Duration', value: event.duration },
  ].filter((item) => Boolean(item.value));

  return (
    <>
      <title>{event.title} - EventSync</title>
      <meta name="description" content={event.description ?? `Details for ${event.title}`} />

      <section className={`relative overflow-hidden bg-gradient-to-br ${heroBg} py-20`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,white,transparent)] opacity-10" />
        <div className="container relative z-10 mx-auto px-4">
          <Link
            href="/events"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Events
          </Link>

          {category && (
            <div className="mb-4">
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${categoryBadge}`}>
                {category}
              </span>
            </div>
          )}

          <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-tight text-white md:text-5xl">
            {event.title}
          </h1>

          {event.description && (
            <p className="max-w-xl text-lg leading-relaxed text-white/70">{event.description}</p>
          )}
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {event.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
                >
                  <h2 className="mb-5 text-2xl font-extrabold text-slate-900">About This Event</h2>
                  <div className="space-y-4">
                    {event.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="leading-relaxed text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}

              {perks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                  className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                      <Gift size={15} className="text-amber-600" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">Perks</h2>
                  </div>
                  <ul className="space-y-2.5">
                    {perks.map((perk, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span className="text-sm leading-relaxed text-slate-600">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.16 }}
                className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <User size={15} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">Coordinators</h2>
                </div>

                {coordinators.length === 0 ? (
                  <p className="text-sm text-slate-400">No coordinators listed for this event.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {coordinators.map((coordinator, index) => (
                      <motion.div
                        key={coordinator.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.06, duration: 0.35 }}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-bold text-primary">
                            {coordinator.name?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {coordinator.name}
                          </p>
                          {coordinator.phone ? (
                            <a
                              href={`tel:${coordinator.phone}`}
                              className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Phone size={11} />
                              {coordinator.phone}
                            </a>
                          ) : (
                            <p className="mt-0.5 text-xs text-slate-400">No phone listed</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              <div className="space-y-2 pt-2">
                {registrationLink ? (
                  <a
                    href={registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-10 py-3.5 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/30 md:w-auto"
                  >
                    Register Now
                  </a>
                ) : (
                  <>
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-slate-300 px-10 py-3.5 font-bold text-slate-600 md:w-auto"
                    >
                      Registration Unavailable
                    </button>
                    <p className="text-sm text-slate-500">
                      No registration link has been added for this event yet.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {detailItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-5 text-lg font-bold text-slate-900">Event Details</h3>
                  <div className="space-y-4">
                    {detailItems.map(({ icon: Icon, label, value }) => (
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

              {coordinators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 }}
                  className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <User size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {coordinators.length} Coordinator{coordinators.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-slate-500">Available for queries</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
