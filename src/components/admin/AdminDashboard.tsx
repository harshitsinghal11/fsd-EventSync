'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Briefcase,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  List,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import type { AdminSession } from '@/lib/session';
import CreateEventPanel from '@/components/admin/CreateEventPanel';
import ManageEventsPanel from '@/components/admin/ManageEventsPanel';
import CreateOpportunityPanel from '@/components/admin/CreateOpportunityPanel';
import ManageOpportunitiesPanel from '@/components/admin/ManageOpportunitiesPanel';

type SectionId =
  | 'create-event'
  | 'manage-events'
  | 'create-opportunity'
  | 'manage-opportunities';

interface SidebarItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  group: string;
}

const SIDEBAR: SidebarItem[] = [
  { id: 'create-event', label: 'Create Event', icon: PlusCircle, group: 'Events' },
  { id: 'manage-events', label: 'Manage Events', icon: List, group: 'Events' },
  {
    id: 'create-opportunity',
    label: 'Create Opportunity',
    icon: PlusCircle,
    group: 'Opportunities',
  },
  {
    id: 'manage-opportunities',
    label: 'Manage Opportunities',
    icon: List,
    group: 'Opportunities',
  },
];

const GROUPS = ['Events', 'Opportunities'];

export default function AdminDashboard({ session }: { session: AdminSession }) {
  const [active, setActive] = useState<SectionId>('create-event');

  function renderPanel() {
    switch (active) {
      case 'create-event':
        return <CreateEventPanel />;
      case 'manage-events':
        return <ManageEventsPanel />;
      case 'create-opportunity':
        return <CreateOpportunityPanel />;
      case 'manage-opportunities':
        return <ManageOpportunitiesPanel />;
      default:
        return null;
    }
  }

  const activeItem = SIDEBAR.find((item) => item.id === active)!;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_30%)]">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white md:flex">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/30">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Admin
              </p>
              <p className="text-lg font-bold text-white">EventSync Control</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Manage events, publish opportunities, and keep the public listings fresh.
          </p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                {group === 'Events' ? (
                  <CalendarDays size={10} className="mr-1 inline" />
                ) : (
                  <Briefcase size={10} className="mr-1 inline" />
                )}
                {group}
              </p>
              <div className="space-y-1">
                {SIDEBAR.filter((item) => item.group === group).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={`w-full rounded-2xl px-3 py-3 text-left text-sm font-semibold transition-all ${
                      active === id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/25'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5">
                        <Icon size={15} />
                        {label}
                      </span>
                      {active === id && <ChevronRight size={13} />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col overflow-auto">
        <div className="shrink-0 border-b border-slate-200/80 bg-white/85 px-6 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <activeItem.icon size={18} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold leading-tight text-slate-950">
                  {activeItem.label}
                </h1>
                <p className="text-sm text-slate-500">{activeItem.group} workspace</p>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Active Session
                </p>
                <p className="text-sm font-semibold text-slate-800">{session.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {SIDEBAR.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  active === id
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
