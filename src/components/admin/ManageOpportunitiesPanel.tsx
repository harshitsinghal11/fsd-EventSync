'use client';

import { useEffect, useState, FormEvent } from 'react';
import {
  Pencil, Trash2, Loader2, AlertCircle,
  Briefcase, RefreshCw, X, CheckCircle2, Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OppRow {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  deadline?: string;
  contact_info?: string;
  type?: string;
  eligibility?: string;
  registration_link?: string;
}

interface EditForm {
  title: string;
  description: string;
  organization: string;
  deadline: string;
  contact_info: string;
  type: string;
  eligibility: string;
  registration_link: string;
}

const EMPTY_EDIT: EditForm = {
  title: '', description: '', organization: '',
  deadline: '', contact_info: '', type: '', eligibility: '',
  registration_link: '',
};

const TYPE_COLORS: Record<string, string> = {
  Research:   'bg-teal-100 text-teal-700',
  Internship: 'bg-amber-100 text-amber-700',
  Leadership: 'bg-indigo-100 text-indigo-700',
  Volunteer:  'bg-rose-100 text-rose-700',
  Other:      'bg-slate-100 text-slate-600',
};

const textareaClassName =
  'w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

const selectClassName =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManageOpportunitiesPanel() {
  const [opps, setOpps]         = useState<OppRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit drawer
  const [editId, setEditId]               = useState<string | null>(null);
  const [editForm, setEditForm]           = useState<EditForm>(EMPTY_EDIT);
  const [editFetching, setEditFetching]   = useState(false);
  const [editLoading, setEditLoading]     = useState(false);
  const [editSuccess, setEditSuccess]     = useState(false);
  const [editError, setEditError]         = useState<string | null>(null);

  // ── Load list ──────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/opportunities');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load opportunities.');
      // Public GET returns { data: [...] }
      setOpps(json.data ?? json.opportunities ?? json ?? []);
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
      const res  = await fetch(`/api/admin/opportunities/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Delete failed.');
      setOpps((prev) => prev.filter((o) => o.id !== id));
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
      const res  = await fetch(`/api/opportunities/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load opportunity.');

      const op: OppRow = json.opportunity;
      setEditForm({
        title:        op.title        ?? '',
        description:  op.description  ?? '',
        organization: op.organization ?? '',
        deadline:     op.deadline     ?? '',
        contact_info: op.contact_info ?? '',
        type:         op.type         ?? '',
        eligibility:  op.eligibility  ?? '',
        registration_link: op.registration_link ?? '',
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

  // ── Edit field helper ──────────────────────────────────────────────────────

  function setField(field: keyof EditForm) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setEditForm((f) => ({ ...f, [field]: e.target.value }));
      setEditSuccess(false);
      setEditError(null);
    };
  }

  // ── Submit edit ────────────────────────────────────────────────────────────

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditLoading(true);
    setEditSuccess(false);
    setEditError(null);

    try {
      const res = await fetch(`/api/admin/opportunities/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          registration_link: editForm.registration_link.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Update failed.');

      // Reflect changes in the table immediately
      setOpps((prev) =>
        prev.map((op) =>
          op.id === editId
            ? {
                ...op,
                title:        editForm.title,
                organization: editForm.organization,
                deadline:     editForm.deadline,
                type:         editForm.type,
              }
            : op,
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
      <Loader2 size={18} className="animate-spin" /> Loading opportunities…
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 max-w-lg">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">Failed to load opportunities</p>
        <p className="text-sm mt-0.5">{error}</p>
        <button onClick={load} className="text-sm font-semibold underline mt-2">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl items-start gap-6">

      {/* ── Opportunities table ── */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${editId ? 'hidden xl:block' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 text-sm">
            {opps.length} opportunit{opps.length !== 1 ? 'ies' : 'y'}
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {opps.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
            <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No opportunities yet</p>
            <p className="text-sm mt-1">Create your first opportunity using the sidebar.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Organization</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Deadline</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Type</th>
                  <th className="px-5 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {opps.map((op) => (
                  <tr
                    key={op.id}
                    className={`transition-colors ${
                      editId === op.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                        {op.title}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-sm text-slate-500 truncate max-w-[140px]">
                        {op.organization ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-500 whitespace-nowrap">
                        {op.deadline ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {op.type ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[op.type] ?? 'bg-slate-100 text-slate-600'}`}>
                          {op.type}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {/* Edit toggle */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-8 w-8 p-0 transition-colors ${
                            editId === op.id
                              ? 'text-primary bg-primary/10'
                              : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                          }`}
                          onClick={() => editId === op.id ? closeDrawer() : openEdit(op.id)}
                          title={editId === op.id ? 'Close editor' : 'Edit opportunity'}
                        >
                          {editId === op.id ? <X size={14} /> : <Pencil size={14} />}
                        </Button>
                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(op.id, op.title)}
                          disabled={deleting === op.id}
                          title="Delete opportunity"
                        >
                          {deleting === op.id
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
                  <span className="text-sm font-bold text-slate-800">Edit Opportunity</span>
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
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                      <div className="h-9 bg-slate-100 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <form
                  onSubmit={handleEditSubmit}
                  className="p-5 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto"
                >
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
                          <CheckCircle2 size={14} className="shrink-0" />
                          Updated — changes are live on the public page!
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

                  {/* Title */}
                  <DrawerField label="Title *" htmlFor="ed-op-title">
                    <Input
                      id="ed-op-title"
                      value={editForm.title}
                      onChange={setField('title')}
                      required
                      className="h-9 text-sm rounded-xl"
                    />
                  </DrawerField>

                  {/* Description */}
                  <DrawerField label="Description" htmlFor="ed-op-desc">
                    <textarea
                      id="ed-op-desc"
                      value={editForm.description}
                      onChange={setField('description')}
                      rows={3}
                      className={textareaClassName}
                    />
                  </DrawerField>

                  {/* Organization + Deadline */}
                  <div className="grid grid-cols-2 gap-3">
                    <DrawerField label="Organization" htmlFor="ed-op-org">
                      <Input
                        id="ed-op-org"
                        value={editForm.organization}
                        onChange={setField('organization')}
                        placeholder="Organization"
                        className="h-9 text-sm rounded-xl"
                      />
                    </DrawerField>
                    <DrawerField label="Deadline" htmlFor="ed-op-deadline">
                      <Input
                        id="ed-op-deadline"
                        type="date"
                        value={editForm.deadline}
                        onChange={setField('deadline')}
                        className="h-9 text-sm rounded-xl"
                      />
                    </DrawerField>
                  </div>

                  {/* Contact Info */}
                  <DrawerField label="Contact Info *" htmlFor="ed-op-contact">
                    <Input
                      id="ed-op-contact"
                      value={editForm.contact_info}
                      onChange={setField('contact_info')}
                      placeholder="Email, phone, or URL"
                      required
                      className="h-9 text-sm rounded-xl"
                    />
                  </DrawerField>

                  {/* Type */}
                  <DrawerField label="Type" htmlFor="ed-op-type">
                    <select
                      id="ed-op-type"
                      value={editForm.type}
                      onChange={setField('type')}
                      className={selectClassName}
                    >
                      <option value="">Select type</option>
                      {['Research', 'Internship', 'Leadership', 'Volunteer', 'Other'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </DrawerField>

                  {/* Eligibility */}
                  <DrawerField label="Eligibility" htmlFor="ed-op-eligibility">
                    <Input
                      id="ed-op-eligibility"
                      value={editForm.eligibility}
                      onChange={setField('eligibility')}
                      placeholder="e.g. 2nd year and above"
                      className="h-9 text-sm rounded-xl"
                    />
                  </DrawerField>

                  {/* Registration Link */}
                  <DrawerField label="Registration Link" htmlFor="ed-op-reg-link">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-medium pointer-events-none select-none">URL</span>
                      <Input
                        id="ed-op-reg-link"
                        type="url"
                        value={editForm.registration_link}
                        onChange={setField('registration_link')}
                        placeholder="https://forms.google.com/..."
                        className="h-9 text-sm rounded-xl pl-9"
                      />
                    </div>
                  </DrawerField>

                  {/* Save */}
                  <Button
                    type="submit"
                    disabled={editLoading}
                    className="w-full h-10 rounded-xl font-bold text-sm mt-2"
                  >
                    {editLoading ? (
                      <><Loader2 size={14} className="animate-spin mr-2" />Saving…</>
                    ) : (
                      <><Save size={14} className="mr-2" />Save Changes</>
                    )}
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

function DrawerField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-600">
        {label}
      </Label>
      {children}
    </div>
  );
}

