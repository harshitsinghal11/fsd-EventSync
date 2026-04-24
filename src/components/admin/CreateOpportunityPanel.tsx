'use client';

import { type FormEvent, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormState {
  title: string;
  description: string;
  organization: string;
  deadline: string;
  contact_info: string;
  type: string;
  eligibility: string;
  registration_link: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  organization: '',
  deadline: '',
  contact_info: '',
  type: '',
  eligibility: '',
  registration_link: '',
};

const textareaClassName =
  'w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

const selectClassName =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

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

export default function CreateOpportunityPanel() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof FormState) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setSuccess(false);
      setError(null);
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          registration_link: form.registration_link.trim() || null,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Failed to create opportunity.');
      }

      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (submissionError) {
      setError(String(submissionError).replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white/90 px-6 py-5 shadow-[0_22px_45px_-28px_rgba(15,23,42,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Opportunities
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Create a new opportunity</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Publish internships, research roles, volunteer openings, and other applications from one place.
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
              Opportunity created and published.
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
                Opportunity Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                These details are shown to students browsing the opportunity listings.
              </p>
            </div>

            <PanelField label="Title *" htmlFor="op-title">
              <Input
                id="op-title"
                value={form.title}
                onChange={setField('title')}
                placeholder="e.g. Research Assistant - AI Lab"
                required
              />
            </PanelField>

            <PanelField label="Description" htmlFor="op-desc">
              <textarea
                id="op-desc"
                value={form.description}
                onChange={setField('description')}
                rows={5}
                placeholder="Describe the opportunity, responsibilities, and what applicants can expect..."
                className={textareaClassName}
              />
            </PanelField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PanelField label="Organization" htmlFor="op-org">
                <Input
                  id="op-org"
                  value={form.organization}
                  onChange={setField('organization')}
                  placeholder="e.g. IIT Research Cell"
                />
              </PanelField>
              <PanelField label="Deadline" htmlFor="op-deadline">
                <Input
                  id="op-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={setField('deadline')}
                />
              </PanelField>
            </div>
          </section>

          <section className="w-full flex-1 space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] md:p-7">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">
                Application Settings
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Control how students contact you and where they apply.
              </p>
            </div>

            <PanelField label="Contact Info *" htmlFor="op-contact">
              <Input
                id="op-contact"
                value={form.contact_info}
                onChange={setField('contact_info')}
                placeholder="Email, phone number, or URL"
                required
              />
              <p className="text-xs text-slate-400">
                Shown on the detail page. Email, phone, or a link all work.
              </p>
            </PanelField>

            <PanelField label="Type" htmlFor="op-type">
              <select
                id="op-type"
                value={form.type}
                onChange={setField('type')}
                className={selectClassName}
              >
                <option value="">Select type</option>
                {['Research', 'Internship', 'Leadership', 'Volunteer', 'Other'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </PanelField>

            <PanelField label="Eligibility" htmlFor="op-eligibility">
              <Input
                id="op-eligibility"
                value={form.eligibility}
                onChange={setField('eligibility')}
                placeholder="e.g. 2nd year and above, CGPA >= 7.5"
              />
            </PanelField>

            <PanelField label="Registration Link" htmlFor="op-reg-link">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-xs font-medium text-slate-400">
                  URL
                </span>
                <Input
                  id="op-reg-link"
                  type="url"
                  value={form.registration_link}
                  onChange={setField('registration_link')}
                  placeholder="https://forms.google.com/..."
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-slate-400">
                Optional - link to the application form or portal.
              </p>
            </PanelField>
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
              Creating opportunity...
            </>
          ) : (
            'Create Opportunity'
          )}
        </Button>
      </form>
    </div>
  );
}
