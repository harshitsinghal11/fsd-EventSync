'use client';

import { type FormEvent, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Phone,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EVENT_CATEGORY_OPTIONS } from '@/lib/event-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Coordinator {
  id: string;
  name: string;
  phone: string;
}

interface FormState {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  duration: string;
  category: string;
  perks: string;
  registration_link: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  duration: '',
  category: '',
  perks: '',
  registration_link: '',
};

const textareaClassName =
  'w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

const selectClassName =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

function createCoordinator(): Coordinator {
  return { id: crypto.randomUUID(), name: '', phone: '' };
}

function PanelField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function CreateEventPanel() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof FormState) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setSuccess(false);
      setError(null);
      setWarning(null);
    };
  }

  function addCoordinator() {
    setCoordinators((current) => [...current, createCoordinator()]);
  }

  function updateCoordinator(id: string, field: 'name' | 'phone', value: string) {
    setCoordinators((current) =>
      current.map((coordinator) =>
        coordinator.id === id ? { ...coordinator, [field]: value } : coordinator
      )
    );
  }

  function removeCoordinator(id: string) {
    setCoordinators((current) => current.filter((coordinator) => coordinator.id !== id));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setWarning(null);

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          perks: form.perks
            ? form.perks.split(',').map((value) => value.trim()).filter(Boolean)
            : [],
          registration_link: form.registration_link.trim() || null,
          coordinators: coordinators
            .filter((coordinator) => coordinator.name.trim())
            .map(({ name, phone }) => ({ name, phone })),
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Failed to create event.');
      }

      if (json.warning) {
        setWarning(json.warning);
      }

      setSuccess(true);
      setForm(EMPTY_FORM);
      setCoordinators([]);
    } catch (submissionError) {
      setError(String(submissionError).replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white/90 px-6 py-5 shadow-[0_22px_45px_-28px_rgba(15,23,42,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Events</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Create a new event</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Publish a polished listing with the details students need, plus a working registration link.
        </p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={16} className="shrink-0" />
              Event created successfully.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {warning && (
          <motion.div
            key="warning"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-5 overflow-hidden"
          >
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              Coordinator sync warning: {warning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-5 overflow-hidden"
          >
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <section className="w-full flex-1 space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] md:p-7">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">
                Event Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                This information appears on the event listing and detail page.
              </p>
            </div>

            <PanelField label="Title *" htmlFor="ev-title">
              <Input
                id="ev-title"
                value={form.title}
                onChange={setField('title')}
                placeholder="e.g. Tech Hackathon 2026"
                required
              />
            </PanelField>

            <PanelField label="Description" htmlFor="ev-desc">
              <textarea
                id="ev-desc"
                value={form.description}
                onChange={setField('description')}
                rows={5}
                placeholder="Describe the event..."
                className={textareaClassName}
              />
            </PanelField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PanelField label="Date *" htmlFor="ev-date">
                <Input id="ev-date" type="date" value={form.date} onChange={setField('date')} required />
              </PanelField>
              <PanelField label="Time" htmlFor="ev-time">
                <Input id="ev-time" type="time" value={form.time} onChange={setField('time')} />
              </PanelField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PanelField label="Venue" htmlFor="ev-venue">
                <Input
                  id="ev-venue"
                  value={form.venue}
                  onChange={setField('venue')}
                  placeholder="e.g. Main Auditorium"
                />
              </PanelField>
              <PanelField label="Duration" htmlFor="ev-duration">
                <Input
                  id="ev-duration"
                  value={form.duration}
                  onChange={setField('duration')}
                  placeholder="e.g. 3 hours"
                />
              </PanelField>
            </div>

            <PanelField label="Category" htmlFor="ev-category">
              <select
                id="ev-category"
                value={form.category}
                onChange={setField('category')}
                className={selectClassName}
              >
                <option value="">Select category</option>
                {EVENT_CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </PanelField>

            <PanelField label="Perks" htmlFor="ev-perks">
              <Input
                id="ev-perks"
                value={form.perks}
                onChange={setField('perks')}
                placeholder="Comma-separated, e.g. Certificate, Cash Prize, Goodies"
              />
              <p className="text-xs text-slate-400">Separate multiple perks with commas.</p>
            </PanelField>

            <PanelField label="Registration Link" htmlFor="ev-reg-link">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-xs font-medium text-slate-400">
                  URL
                </span>
                <Input
                  id="ev-reg-link"
                  type="url"
                  value={form.registration_link}
                  onChange={setField('registration_link')}
                  placeholder="https://forms.google.com/..."
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-slate-400">
                Optional - link to the registration form or portal.
              </p>
            </PanelField>
          </section>

          <section className="w-full flex-1 space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] md:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">
                  Coordinators
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Optional contacts students can reach for questions.
                </p>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={addCoordinator}>
                <UserPlus size={14} />
                Add Coordinator
              </Button>
            </div>

            {coordinators.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 py-8 text-center">
                <User size={22} className="mx-auto mb-2 text-slate-700" />
                <p className="text-sm text-slate-400">No coordinators added yet.</p>
                <button
                  type="button"
                  onClick={addCoordinator}
                  className="mt-1 text-sm font-semibold text-blue-600 hover:underline"
                >
                  Add one
                </button>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {coordinators.map((coordinator, index) => (
                  <motion.div
                    key={coordinator.id}
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 shadow-sm">
                        {index + 1}
                      </div>

                      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-600">
                            <User size={11} className="mr-1 inline" />
                            Name *
                          </Label>
                          <Input
                            value={coordinator.name}
                            onChange={(event) =>
                              updateCoordinator(coordinator.id, 'name', event.target.value)
                            }
                            placeholder="Full name"
                            required={coordinators.some((item) => item.name.trim())}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-600">
                            <Phone size={11} className="mr-1 inline" />
                            Phone
                          </Label>
                          <Input
                            value={coordinator.phone}
                            onChange={(event) =>
                              updateCoordinator(coordinator.id, 'phone', event.target.value)
                            }
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCoordinator(coordinator.id)}
                        className="mt-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remove coordinator"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </section>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl text-base font-bold shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-500 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Creating event...
            </>
          ) : (
            'Create Event'
          )}
        </Button>
      </form>
    </div>
  );
}
