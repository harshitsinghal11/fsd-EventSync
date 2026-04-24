'use client'
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search, MapPin, Calendar, ChevronRight,
    Loader2, AlertCircle, CalendarDays, X,
} from 'lucide-react';
import {
    EVENT_CATEGORY_BACKGROUNDS,
    EVENT_CATEGORY_COLORS,
    EVENT_CATEGORY_OPTIONS,
    type EventCategory,
    normalizeEventCategory,
} from '@/lib/event-categories';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
    id: string;
    title: string;
    description?: string;
    date?: string;
    time?: string;
    venue?: string;
    category?: string;
    duration?: string;
}

type Category = 'All' | EventCategory;

const CATEGORIES: Category[] = ['All', ...EVENT_CATEGORY_OPTIONS];

// Date filter options
type DateFilter = 'all' | 'today' | 'this-week' | 'this-month' | 'upcoming';

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
    { value: 'all', label: 'Any date' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This week' },
    { value: 'this-month', label: 'This month' },
    { value: 'upcoming', label: 'Upcoming' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseEventDate(dateStr?: string): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
}

function matchesDateFilter(dateStr: string | undefined, filter: DateFilter): boolean {
    if (filter === 'all') return true;
    const d = parseEventDate(dateStr);
    if (!d) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (filter === 'today') return eventDay.getTime() === today.getTime();

    if (filter === 'this-week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return eventDay >= today && eventDay <= weekEnd;
    }

    if (filter === 'this-month') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }

    if (filter === 'upcoming') return eventDay >= today;

    return true;
}

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.35, delay: i * 0.06, ease: 'easeOut' as const },
    }),
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [activeCategory, setCategory] = useState<Category>('All');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');

    // ── Fetch ────────────────────────────────────────────────────────────────

    async function fetchEvents() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/events');
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Failed to load events.');
            setEvents(json.events ?? json ?? []);
        } catch (err) {
            setError(String(err).replace('Error: ', ''));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchEvents(); }, []);

    // ── Filter (client-side, reactive) ───────────────────────────────────────

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return events.filter((ev) => {
            const matchSearch =
                !q ||
                ev.title.toLowerCase().includes(q) ||
                (ev.venue ?? '').toLowerCase().includes(q);

            const matchCategory =
                activeCategory === 'All' ||
                normalizeEventCategory(ev.category) === activeCategory;

            const matchDate = matchesDateFilter(ev.date, dateFilter);

            return matchSearch && matchCategory && matchDate;
        });
    }, [events, search, activeCategory, dateFilter]);

    const hasActiveFilters = search !== '' || activeCategory !== 'All' || dateFilter !== 'all';

    function clearFilters() {
        setSearch('');
        setCategory('All');
        setDateFilter('all');
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <title>Campus Events – EventSync</title>
            <meta name="description" content="Browse all campus events including hackathons, cultural fests, career fairs, and more." />

            {/* Page Header */}
            <section className="bg-slate-900 py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
                            Discover &amp; Attend
                        </p>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Campus Events
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl">
                            From hackathons to cultural fests — find events that match your interests.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Filter bar ── */}
            <section className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 space-y-3">

                    {/* Row 1: search + date */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                            <input
                                type="text"
                                placeholder="Search by title or venue…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Date filter */}
                        <div className="flex gap-2 flex-wrap">
                            {DATE_FILTERS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setDateFilter(value)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${dateFilter === value
                                        ? 'bg-blue-950 text-white shadow-md shadow-blue-600/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Row 2: category tabs + clear */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-2 flex-wrap">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat
                                        ? 'bg-blue-800 text-white shadow-md shadow-blue-600/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {hasActiveFilters && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap shrink-0"
                                >
                                    <X size={12} /> Clear all
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* ── Results ── */}
            <section className="py-12 bg-slate-50 min-h-[60vh]">
                <div className="container mx-auto px-4">

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
                            <Loader2 size={20} className="animate-spin" /> Loading events…
                        </div>
                    ) : error ? (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 max-w-lg mx-auto">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Failed to load events</p>
                                <p className="text-sm mt-0.5">{error}</p>
                                <button onClick={fetchEvents} className="text-sm font-semibold underline mt-2">
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-24">
                            <CalendarDays size={36} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500 font-semibold text-lg">No events match your filters</p>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or clearing the filters.</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-slate-500 mb-6">
                                {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="ml-3 text-xs font-semibold text-primary hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map((event, i) => {
                                    const category = normalizeEventCategory(event.category);

                                    return (
                                        <motion.div
                                            key={event.id}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true }}
                                            custom={i}
                                            variants={fadeUp}
                                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group border border-slate-100"
                                        >
                                            {/* Card banner */}
                                            <div
                                                className={`h-40 bg-gradient-to-br ${EVENT_CATEGORY_BACKGROUNDS[category ?? ''] ?? 'from-slate-700 to-slate-900'
                                                    } relative`}
                                            >
                                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
                                                {category && (
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${EVENT_CATEGORY_COLORS[category] ?? 'bg-slate-100 text-slate-600'}`}>
                                                            {category}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card body */}
                                            <div className="p-5">
                                                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                                    {event.title}
                                                </h3>

                                                {event.date && (
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
                                                        <Calendar size={13} className="shrink-0" />
                                                        <span>{event.date}</span>
                                                    </div>
                                                )}

                                                {event.venue && (
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                                                        <MapPin size={13} className="shrink-0" />
                                                        <span className="line-clamp-1">{event.venue}</span>
                                                    </div>
                                                )}

                                                {event.description && (
                                                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                                        {event.description}
                                                    </p>
                                                )}

                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:gap-2 transition-all"
                                                >
                                                    View Details <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </>
    );
}

