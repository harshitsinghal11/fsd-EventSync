'use client';

import { useEffect, useState, FormEvent } from 'react';
import {
  Pencil, Trash2, Loader2, AlertCircle,
  CalendarDays, RefreshCw, X, UserPlus,
  CheckCircle2, Phone, User, Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EVENT_CATEGORY_OPTIONS } from '@/lib/event-categories';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventRow {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
  duration?: string;
  category?: string;
  perks?: string[] | string;
  registration_link?: string;
}

interface Coordinator {
  localId: string;
  name: string;
  phone: string;
}

interface EditForm {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  duration: string;
  category: string;
  perks: string;
  registration_link: string;
  coordinators: Coordinator[];
}

const EMPTY_EDIT: EditForm = {
  title: '', description: '', date: '', time: '',
  venue: '', duration: '', category: '', perks: '',
  registration_link: '',
  coordinators: [],
};

function newCoord(): Coordinator {
  return { localId: crypto.randomUUID(), name: '', phone: '' };
}

function perksToString(perks: string[] | string | undefined): string {
  if (!perks) return '';
  if (Array.isArray(perks)) return perks.join(', ');
  return perks;
}

const textareaClassName =
  'w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

const selectClassName =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

// ─── Main component ───────────────────────────────────────────────────────────

export default function ManageEventsPanel() {
  const [events, setEvents]     = useState<EventRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit drawer state
  const [editId, setEditId]         = useState<string | null>(null);
  const [editForm, setEditForm]     = useState<EditForm>(EMPTY_EDIT);
  const [editLoading, setEditLoading] = useState(false);
  const [editFetching, setEditFetching] = useState(false);
  const [editSuccess, setEditSuccess]   = useState(false);
  const [editError, setEditError]       = useState<string | null>(null);

  // ── Load list ──────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/events');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load events.');
      setEvents(json.events ?? json ?? []);
    } catch (err) {
      setError(String(err).replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Delete failed.');
      setEvents((prev) => prev.filter((e) => e.id !== id));
      if (editId === id) closeDrawer();
    } catch (err) {
      alert(String(err).replace('Error: ', ''));
    } finally {
      setDeleting(null);
    }
  }

  // ── Open edit drawer ───────────────────────────────────────────────────────

  async function openEdit(id: string) {
    setEditId(id);
    setEditFetching(true);
    setEditSuccess(false);
    setEditError(null);
    setEditForm(EMPTY_EDIT);

    try {
      const res  = await fetch(`/api/events/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load event.');

      const ev: EventRow = json.event;
      const coords: { name: string; phone?: string }[] = json.coordinators ?? [];

      setEditForm({
        title:       ev.title ?? '',
        description: ev.description ?? '',
        date:        ev.date ?? '',
        time:        ev.time ?? '',
        venue:       ev.venue ?? '',
        duration:    ev.duration ?? '',
        category:    ev.category ?? '',
        perks:       perksToString(ev.perks),
        registration_link: ev.registration_link ?? '',
        coordinators: coords.map((c) => ({
          localId: crypto.randomUUID(),
          name:    c.name ?? '',
          phone:   c.phone ?? '',
        })),
      });
    } catch (err) {
      setEditError(String(err).replace('Error: ', ''));
    } finally {
      setEditFetching(false);
    }
  }

  function closeDrawer() {
    setEditId(null);
    setEditForm(EMPTY_EDIT);
    setEditSuccess(false);
    setEditError(null);
  }

  // ── Edit form field helpers ────────────────────────────────────────────────

  function setField(field: keyof Omit<EditForm, 'coordinators'>) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setEditForm((f) => ({ ...f, [field]: e.target.value }));
      setEditSuccess(false);
      setEditError(null);
    };
  }

  function addCoord() {
    setEditForm((f) => ({ ...f, coordinators: [...f.coordinators, newCoord()] }));
  }

  function updateCoord(localId: string, field: 'name' | 'phone', value: string) {
    setEditForm((f) => ({
      ...f,
      coordinators: f.coordinators.map((c) =>
        c.localId === localId ? { ...c, [field]: value } : c,
      ),
    }));
  }

  function removeCoord(localId: string) {
    setEditForm((f) => ({
      ...f,
      coordinators: f.coordinators.filter((c) => c.localId !== localId),
    }));
  }

  // ── Submit edit ────────────────────────────────────────────────────────────

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditLoading(true);
    setEditSuccess(false);
    setEditError(null);

    try {
      const res = await fetch(`/api/admin/events/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          perks: editForm.perks
            ? editForm.perks.split(',').map((p) => p.trim()).filter(Boolean)
            : [],
          registration_link: editForm.registration_link.trim() || null,
          coordinators: editForm.coordinators
            .filter((c) => c.name.trim())
            .map(({ name, phone }) => ({ name, phone })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Update failed.');

      // Refresh the title in the list
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editId
            ? { ...ev, title: editForm.title, date: editForm.date, venue: editForm.venue }
            : ev,
        ),
      );

      setEditSuccess(true);
    } catch (err) {
      setEditError(String(err).replace('Error: ', ''));
    } finally {
      setEditLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-500 py-16 justify-center">
      <Loader2 size={18} className="animate-spin" /> Loading events…
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 max-w-lg">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">Failed to load events</p>
        <p className="text-sm mt-0.5">{error}</p>
        <button onClick={load} className="text-sm font-semibold underline mt-2">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl items-start gap-6">

      {/* ── Events table ── */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${editId ? 'hidden xl:block' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 text-sm">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {events.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No events yet</p>
            <p className="text-sm mt-1">Create your first event using the sidebar.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Venue</th>
                  <th className="px-5 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    className={`transition-colors ${editId === ev.id ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{ev.title}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-sm text-slate-500 whitespace-nowrap">{ev.date ?? '—'}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-500 truncate max-w-[140px]">{ev.venue ?? '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-8 w-8 p-0 transition-colors ${
                            editId === ev.id
                              ? 'text-primary bg-primary/10'
                              : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                          }`}
                          onClick={() => editId === ev.id ? closeDrawer() : openEdit(ev.id)}
                          title={editId === ev.id ? 'Close editor' : 'Edit event'}
                        >
                          {editId === ev.id ? <X size={14} /> : <Pencil size={14} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(ev.id, ev.title)}
                          disabled={deleting === ev.id}
                          title="Delete event"
                        >
                          {deleting === ev.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit drawer ── */}
      <AnimatePresence>
        {editId && (
          <motion.div
            key="edit-drawer"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.22, ease: 'easeOut' as const }}
            className="w-full shrink-0 xl:sticky xl:top-8 xl:w-[440px]"
          >
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Pencil size={14} className="text-primary" />
                  <span className="text-sm font-bold text-slate-800">Edit Event</span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Fetching skeleton */}
              {editFetching ? (
                <div className="p-5 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                      <div className="h-9 bg-slate-100 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">

                  {/* Feedback banners */}
                  <AnimatePresence>
                    {editSuccess && (
                      <motion.div
                        key="ok"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-2.5 text-sm font-medium">
                          <CheckCircle2 size={14} className="shrink-0" /> Updated successfully!
                        </div>
                      </motion.div>
                    )}
                    {editError && (
                      <motion.div
                        key="err"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-sm font-medium">
                          {editError}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Fields ── */}
                  <DrawerField label="Title *" htmlFor="ed-title">
                    <Input id="ed-title" value={editForm.title} onChange={setField('title')} required className="h-9 text-sm rounded-xl" />
                  </DrawerField>

                  <DrawerField label="Description" htmlFor="ed-desc">
                    <textarea
                      id="ed-desc"
                      value={editForm.description}
                      onChange={setField('description')}
                      rows={3}
                      className={textareaClassName}
                    />
                  </DrawerField>

                  <div className="grid grid-cols-2 gap-3">
                    <DrawerField label="Date" htmlFor="ed-date">
                      <Input id="ed-date" type="date" value={editForm.date} onChange={setField('date')} className="h-9 text-sm rounded-xl" />
                    </DrawerField>
                    <DrawerField label="Time" htmlFor="ed-time">
                      <Input id="ed-time" type="time" value={editForm.time} onChange={setField('time')} className="h-9 text-sm rounded-xl" />
                    </DrawerField>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DrawerField label="Venue" htmlFor="ed-venue">
                      <Input id="ed-venue" value={editForm.venue} onChange={setField('venue')} placeholder="Venue" className="h-9 text-sm rounded-xl" />
                    </DrawerField>
                    <DrawerField label="Duration" htmlFor="ed-duration">
                      <Input id="ed-duration" value={editForm.duration} onChange={setField('duration')} placeholder="e.g. 3 hours" className="h-9 text-sm rounded-xl" />
                    </DrawerField>
                  </div>

                  <DrawerField label="Category" htmlFor="ed-category">
                    <select
                      id="ed-category"
                      value={editForm.category}
                      onChange={setField('category')}
                      className={selectClassName}
                    >
                      <option value="">Select category</option>
                      {EVENT_CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </DrawerField>

                  <DrawerField label="Perks" htmlFor="ed-perks">
                    <Input id="ed-perks" value={editForm.perks} onChange={setField('perks')} placeholder="Comma-separated" className="h-9 text-sm rounded-xl" />
                  </DrawerField>

                  <DrawerField label="Registration Link" htmlFor="ed-reg-link">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-medium pointer-events-none select-none">URL</span>
                      <Input
                        id="ed-reg-link"
                        type="url"
                        value={editForm.registration_link}
                        onChange={setField('registration_link')}
                        placeholder="https://forms.google.com/..."
                        className="h-9 text-sm rounded-xl pl-9"
                      />
                    </div>
                  </DrawerField>

                  {/* ── Coordinators ── */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Coordinators</p>
                      <button
                        type="button"
                        onClick={addCoord}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <UserPlus size={12} /> Add
                      </button>
                    </div>

                    {editForm.coordinators.length === 0 ? (
                      <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-xl">
                        <p className="text-xs text-slate-400">No coordinators.</p>
                        <button type="button" onClick={addCoord} className="text-xs text-primary font-semibold mt-0.5 hover:underline">
                          Add one
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence initial={false}>
                          {editForm.coordinators.map((coord, idx) => (
                            <motion.div
                              key={coord.localId}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">
                                      <User size={9} /> Name
                                    </p>
                                    <Input
                                      value={coord.name}
                                      onChange={(e) => updateCoord(coord.localId, 'name', e.target.value)}
                                      placeholder="Full name"
                                      className="h-8 text-xs rounded-lg"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">
                                      <Phone size={9} /> Phone
                                    </p>
                                    <Input
                                      value={coord.phone}
                                      onChange={(e) => updateCoord(coord.localId, 'phone', e.target.value)}
                                      placeholder="Phone"
                                      className="h-8 text-xs rounded-lg"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCoord(coord.localId)}
                                  className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <Button
                    type="submit"
                    disabled={editLoading}
                    className="w-full h-10 rounded-xl font-bold text-sm mt-2"
                  >
                    {editLoading
                      ? <><Loader2 size={14} className="animate-spin mr-2" />Saving...</>
                      : <><Save size={14} className="mr-2" />Save Changes</>}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Drawer field wrapper ─────────────────────────────────────────────────────

function DrawerField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-600">{label}</Label>
      {children}
    </div>
  );
}

