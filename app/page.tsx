'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight, CalendarDays, Briefcase, Users,
  Sparkles, ChevronRight, AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventRow {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
  category?: string;
}

interface OppRow {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  deadline?: string;
  contact_info?: string;
}

function parseCalendarDate(dateStr?: string): Date | null {
  if (!dateStr) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());

  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(dateStr);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function selectFeaturedEvents(allEvents: EventRow[]): EventRow[] {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return allEvents
    .filter((event) => {
      const eventDate = parseCalendarDate(event.date);
      return eventDate !== null && eventDate >= startOfToday;
    })
    .sort((a, b) => {
      const aDate = parseCalendarDate(a.date);
      const bDate = parseCalendarDate(b.date);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 3);
}

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

// ─── Color maps ───────────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  Tech: 'bg-blue-100 text-blue-700',
  Technical: 'bg-blue-100 text-blue-700',
  Academic: 'bg-green-100 text-green-700',
  Social: 'bg-pink-100 text-pink-700',
  Sports: 'bg-orange-100 text-orange-700',
  Cultural: 'bg-purple-100 text-purple-700',
  Workshop: 'bg-yellow-100 text-yellow-700',
  Other: 'bg-slate-100 text-slate-600',
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden animate-pulse">
      {tall && <div className="h-44 bg-slate-100" />}
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 bg-slate-100 rounded-full" />
        <div className="h-5 w-3/4 bg-slate-100 rounded-full" />
        <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
        <div className="h-3 w-full bg-slate-100 rounded-full" />
        <div className="h-3 w-5/6 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

// ─── Inline error banner ──────────────────────────────────────────────────────

function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="col-span-3 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">Failed to load</p>
        <p className="text-sm mt-0.5">{message}</p>
        <button onClick={onRetry} className="text-sm font-semibold underline mt-2">
          Retry
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  // Events state
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Opportunities state
  const [opps, setOpps] = useState<OppRow[]>([]);
  const [oppsLoading, setOppsLoading] = useState(true);
  const [oppsError, setOppsError] = useState<string | null>(null);

  // Stats derived from live data
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [totalOpps, setTotalOpps] = useState<number | null>(null);

  // ── Fetch events ────────────────────────────────────────────────────────────

  async function fetchEvents() {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const res = await fetch('/api/events');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load events.');
      const all: EventRow[] = json.events ?? [];
      setTotalEvents(all.length);
      // Highlight the next 3 upcoming events on the homepage.
      setEvents(selectFeaturedEvents(all));
    } catch (err) {
      setEventsError(String(err).replace('Error: ', ''));
    } finally {
      setEventsLoading(false);
    }
  }

  // ── Fetch opportunities ─────────────────────────────────────────────────────

  async function fetchOpps() {
    setOppsLoading(true);
    setOppsError(null);
    try {
      const res = await fetch('/api/opportunities');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load opportunities.');
      const all: OppRow[] = json.data ?? [];
      setTotalOpps(all.length);
      // Show up to 3 soonest deadlines
      setOpps(all.slice(0, 3));
    } catch (err) {
      setOppsError(String(err).replace('Error: ', ''));
    } finally {
      setOppsLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    fetchOpps();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function formatDate(dateStr?: string) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  function isDeadlineSoon(deadline?: string) {
    if (!deadline) return false;
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <title>EventSync – Campus Event Hub</title>
      <meta
        name="description"
        content="Discover campus events, opportunities, and connections that matter at your university."
      />

      {/* ── Hero ── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial="hidden" animate="visible" custom={0} variants={fadeUp}
              className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles size={14} className="text-accent" />
              <span className="text-sm font-semibold text-white/80">
  Your Campus, Your Community
</span>
            </motion.div>

            <motion.h1
              initial="hidden" animate="visible" custom={1} variants={fadeUp}
              className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6"
            >
              Campus{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Event Hub
              </span>

            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" custom={2} variants={fadeUp}
              className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed"
            >
              Discover events, opportunities, and more at your campus. Stay connected, get involved, and make the most of your student life.
            </motion.p>

            <motion.div
              initial="hidden" animate="visible" custom={3} variants={fadeUp}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-blue-600 hover:brightness-110 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/40 focus:ring-4 focus:ring-blue-600/30 outline-none transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                Explore Events <ArrowRight size={18} />
              </Link>
              <Link
                href="/opportunity"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all duration-200"
              >
                View Opportunities
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats (live counts) ── */}
      <section className="bg-[#1447E6]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 gap-6 text-center">
            {/* Events count */}
            <div className="flex flex-col items-center gap-1">
              <CalendarDays size={20} className="text-white/70 mb-1" />
              {eventsLoading ? (
                <div className="h-9 w-16 bg-white/20 rounded-lg animate-pulse mx-auto" />
              ) : (
                <span className="text-3xl md:text-4xl font-extrabold text-white">
                  {totalEvents !== null ? `${totalEvents}+` : '—'}
                </span>
              )}
              <span className="text-sm font-medium text-white/70">Events</span>
            </div>

            {/* Opportunities count */}
            <div className="flex flex-col items-center gap-1">
              <Briefcase size={20} className="text-white/70 mb-1" />
              {oppsLoading ? (
                <div className="h-9 w-16 bg-white/20 rounded-lg animate-pulse mx-auto" />
              ) : (
                <span className="text-3xl md:text-4xl font-extrabold text-white">
                  {totalOpps !== null ? `${totalOpps}+` : '—'}
                </span>
              )}
              <span className="text-sm font-medium text-white/70">Opportunities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Events ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Featured Events</h2>
            </div>
            <Link
              href="/events"
              className="hidden md:flex items-center gap-1 text-black font-semibold text-sm hover:gap-2 transition-all"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {eventsLoading ? (
              [0, 1, 2].map((i) => <SkeletonCard key={i} tall />)
            ) : eventsError ? (
              <SectionError message={eventsError} onRetry={fetchEvents} />
            ) : events.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-slate-400">
                <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-semibold">
                  {totalEvents && totalEvents > 0 ? 'No upcoming events right now' : 'No events yet'}
                </p>
                <p className="text-sm mt-1">
                  {totalEvents && totalEvents > 0
                    ? 'Browse the events page for older listings while new events are added.'
                    : 'Check back soon for upcoming campus events.'}
                </p>
              </div>
            ) : (
              events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  {/* Card image area */}
                  <div className="h-44 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20" />
                    <div className="absolute bottom-3 left-3">
                      {event.category && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[event.category] ?? 'bg-slate-100 text-slate-600'
                            }`}
                        >
                          {event.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-1">
                      {formatDate(event.date)}{event.venue ? ` · ${event.venue}` : ''}
                    </p>
                    {event.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4">{event.description}</p>
                    )}
                    <Link
                      href={`/events/${event.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:gap-2 transition-all"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 md:hidden text-center">
            <Link href="/events" className="inline-flex items-center gap-1 text-primary font-semibold text-sm">
              View all events <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Top Opportunities ── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Top Opportunities</h2>
            </div>
            <Link
              href="/opportunity"
              className="hidden md:flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {oppsLoading ? (
              [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            ) : oppsError ? (
              <SectionError message={oppsError} onRetry={fetchOpps} />
            ) : opps.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-slate-400">
                <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No opportunities yet</p>
                <p className="text-sm mt-1">Check back soon for new openings.</p>
              </div>
            ) : (
              opps.map((opp, i) => (
                <motion.div
                  key={opp.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      Opportunity
                    </span>
                    {isDeadlineSoon(opp.deadline) && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                        Closing soon
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {opp.title}
                  </h3>
                  {opp.organization && (
                    <p className="text-sm text-slate-500 mb-1">{opp.organization}</p>
                  )}
                  {opp.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">{opp.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Deadline: {formatDate(opp.deadline)}
                    </span>
                    <Link
                      href={`/opportunity/${opp.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                    >
                      Learn More <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 md:hidden text-center">
            <Link href="/opportunity" className="inline-flex items-center gap-1 text-primary font-semibold text-sm">
              View all opportunities <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
