"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNavbar from '@/components/AdminNavbar';
import {
  BookOpen,
  Shield,
  Home,
  Users,
  CreditCard,
  Wrench,
  Settings,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────
   Guide Data
───────────────────────────────────── */
const guide = [
  {
    id: 'system-overview',
    icon: Shield,
    gradient: 'from-indigo-500 to-violet-600',
    gradientLight: 'from-indigo-50 to-violet-50',
    gradientDark: 'from-indigo-950/60 to-violet-950/60',
    accent: '#6366f1',
    accentLight: '#e0e7ff',
    title: 'System Overview',
    emoji: '🏠',
    summary: 'Understand what Papikost does and how all the parts fit together.',
    steps: [
      {
        title: 'What is Papikost?',
        body: 'Papikost is a Smart Boarding Management system for boarding houses (kos-kosan). It helps you manage rooms, residents, billing, and maintenance — all in one place.',
      },
      {
        title: 'How to get started',
        body: 'Log in as Admin → you will land on the Dashboard. From there you can see all key numbers: occupancy, revenue, and pending tasks.',
      },
      {
        title: 'Quick Actions panel',
        body: 'The dashboard has a "Quick Actions" panel on the right side. Use it to add a resident, generate invoices, or broadcast an announcement in just one click.',
        tip: 'Quick Actions are the fastest way to handle routine tasks. Always check this panel first.',
      },
    ],
  },
  {
    id: 'rooms',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-600',
    gradientLight: 'from-emerald-50 to-teal-50',
    gradientDark: 'from-emerald-950/60 to-teal-950/60',
    accent: '#10b981',
    accentLight: '#d1fae5',
    title: 'Managing Rooms',
    emoji: '🛏️',
    summary: 'Add rooms, change their status, and track availability.',
    steps: [
      {
        title: 'Go to Rooms',
        body: 'Click "Rooms" in the top navigation bar. You will see all rooms listed with their current status (Available, Occupied, or Maintenance).',
      },
      {
        title: 'Add a New Room',
        body: 'Click the "Add Room" button. Fill in: Room Number, Floor, Room Type (Standard / Deluxe / Suite), Capacity, and Monthly Price. Click Save when done.',
      },
      {
        title: 'Room Status Guide',
        body: null,
        list: [
          { label: 'Available', desc: 'Empty and ready to be booked by a new resident.' },
          { label: 'Occupied', desc: 'A resident is currently living here. Cannot accept new bookings.' },
          { label: 'Maintenance', desc: 'Under repair or inspection. Blocked from all new bookings.' },
        ],
        warning: 'Always set a room to Maintenance before any repair work starts so no accidental bookings occur.',
      },
    ],
  },
  {
    id: 'residents',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-600',
    gradientLight: 'from-blue-50 to-cyan-50',
    gradientDark: 'from-blue-950/60 to-cyan-950/60',
    accent: '#3b82f6',
    accentLight: '#dbeafe',
    title: 'Resident Management',
    emoji: '👥',
    summary: 'Onboard new residents, manage contracts, and handle move-outs.',
    steps: [
      {
        title: 'Open Members',
        body: 'Go to "Members" in the nav bar — or click "Add Resident" from the Dashboard Quick Actions panel. Both lead to the same place.',
      },
      {
        title: 'Fill in Resident Details',
        body: 'Enter: Full Name, Email, Phone Number, National ID (KTP / Identity Card), Check-in Date, and Contract Duration in months.',
      },
      {
        title: 'Assign a Room',
        body: 'Choose an Available room from the dropdown. Once saved, the room status automatically changes to Occupied and is locked from other bookings.',
      },
      {
        title: 'What happens next (automatic)',
        body: 'After saving, the system will automatically: generate the first invoice, send a welcome email to the resident, and issue a smart lock access PIN.',
        tip: 'The smart lock PIN is automatically revoked on the checkout date at 12:00 PM — no manual action needed.',
      },
    ],
  },
  {
    id: 'billing',
    icon: CreditCard,
    gradient: 'from-amber-500 to-orange-500',
    gradientLight: 'from-amber-50 to-orange-50',
    gradientDark: 'from-amber-950/60 to-orange-950/60',
    accent: '#f59e0b',
    accentLight: '#fef3c7',
    title: 'Billing & Invoices',
    emoji: '💳',
    summary: 'Invoices are automatic. Your main job is to verify payments.',
    steps: [
      {
        title: 'How invoices are generated',
        body: 'The system auto-creates invoices 5 days before each monthly due date. Each invoice includes rent, utilities (if metered), and any add-ons.',
      },
      {
        title: 'How residents pay',
        body: 'Residents receive the invoice by email and can upload payment proof through their resident portal. You do not need to chase them manually.',
      },
      {
        title: 'How to verify a payment',
        body: 'Open "Billing" in the nav bar → filter by "Pending" status → click the invoice → click "Verify" to mark it as Paid. Done.',
        warning: 'Always verify payment proofs within 24 hours. Proofs older than 3 days trigger an automatic reminder to the admin.',
      },
      {
        title: 'Invoice status meanings',
        body: null,
        list: [
          { label: 'Unpaid', desc: 'Invoice sent. No payment uploaded yet.' },
          { label: 'Pending', desc: 'Resident uploaded proof — waiting for your verification.' },
          { label: 'Paid', desc: 'Payment confirmed and recorded.' },
          { label: 'Overdue', desc: 'Past the due date with no payment received.' },
        ],
      },
    ],
  },
  {
    id: 'maintenance',
    icon: Wrench,
    gradient: 'from-rose-500 to-pink-600',
    gradientLight: 'from-rose-50 to-pink-50',
    gradientDark: 'from-rose-950/60 to-pink-950/60',
    accent: '#f43f5e',
    accentLight: '#ffe4e6',
    title: 'Maintenance Tickets',
    emoji: '🔧',
    summary: 'Handle repair requests submitted by residents through their portal.',
    steps: [
      {
        title: 'How tickets arrive',
        body: 'Residents submit issues (broken AC, plumbing, electrical, etc.) via the resident portal. Each submission creates a ticket visible in your Maintenance tab.',
      },
      {
        title: 'Open and review the ticket',
        body: 'Go to "Maintenance" in the nav → click any ticket to see the full description, photos (if any), and the room it was reported from.',
      },
      {
        title: 'Set to "In Progress"',
        body: 'Once you assign someone to fix the issue, update the status to In Progress. This automatically notifies the resident their request is being handled.',
      },
      {
        title: 'Mark as Resolved',
        body: 'After the repair is done, click "Resolve" and add a short note about what was fixed. The resident receives an automatic completion notification.',
        tip: 'Critical or High priority tickets older than 48 hours appear highlighted in red on the Dashboard — do not miss them.',
      },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    gradient: 'from-slate-500 to-slate-700',
    gradientLight: 'from-slate-50 to-slate-100',
    gradientDark: 'from-slate-900/80 to-slate-800/80',
    accent: '#64748b',
    accentLight: '#f1f5f9',
    title: 'System Settings',
    emoji: '⚙️',
    summary: 'Configure billing rules, notifications, and property details.',
    steps: [
      {
        title: 'Open Settings',
        body: 'Click the gear icon (⚙️) on the top-right of the navigation bar. You can also go directly to /admin/settings in the URL.',
      },
      {
        title: 'Billing Rules',
        body: 'Set the invoice generation lead time (default: 5 days), late fee percentage, and overdue grace period before a fee is applied.',
        warning: 'Changing billing rules only affects future invoices — existing invoices are never changed retroactively.',
      },
      {
        title: 'Notification Preferences',
        body: 'Choose which events trigger email or push notifications for you and your residents (e.g. new booking request, payment received, maintenance submitted).',
      },
      {
        title: 'Property Profile',
        body: 'Update your boarding house name, address, logo, and contact details. These appear on all invoices sent to residents, so keep them accurate.',
      },
    ],
  },
];

/* ─────────────────────────────────────
   Step Box Component
───────────────────────────────────── */
function StepBox({
  step,
  index,
  accent,
  accentLight,
}: {
  step: (typeof guide)[0]['steps'][0];
  index: number;
  accent: string;
  accentLight: string;
}) {
  return (
    <div className="relative flex gap-5 group">
      {/* Connector line */}
      <div className="flex flex-col items-center">
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md z-10 transition-transform group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        >
          {index + 1}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 pb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Card top accent strip */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />
          
          <div className="p-5">
            <p className="text-base font-bold text-slate-800 dark:text-white mb-2">{step.title}</p>
            
            {step.body && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.body}</p>
            )}

            {/* List items */}
            {(step as any).list && (
              <ul className="mt-3 space-y-2">
                {(step as any).list.map((item: { label: string; desc: string }) => (
                  <li key={item.label} className="flex items-start gap-3 p-2.5 rounded-xl" style={{ backgroundColor: accentLight + '60' }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      <strong className="font-bold">{item.label}</strong> — {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Tip */}
            {(step as any).tip && (
              <div className="mt-4 flex gap-3 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50">
                <Lightbulb className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-teal-800 dark:text-teal-300 leading-relaxed">
                  <strong>Pro tip: </strong>{(step as any).tip}
                </p>
              </div>
            )}

            {/* Warning */}
            {(step as any).warning && (
              <div className="mt-4 flex gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Important: </strong>{(step as any).warning}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Section Component
───────────────────────────────────── */
function GuideSection({ section, isLast }: { section: (typeof guide)[0]; isLast: boolean }) {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;

  return (
    <div id={section.id} className="scroll-mt-24">
      {/* Section Header Card */}
      <div
        className={`rounded-3xl bg-gradient-to-r ${section.gradientLight} dark:bg-none border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden`}
        style={{ background: undefined }}
      >
        <div className={`bg-gradient-to-r ${section.gradientLight} dark:from-slate-900 dark:to-slate-800 p-6`}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center gap-4 cursor-pointer"
          >
            {/* Icon block */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${section.gradient} shadow-lg`}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{section.emoji}</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {section.title}
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{section.summary}</p>
            </div>

            {/* Toggle + step count */}
            <div className="flex items-center gap-3 shrink-0">
              <span
                className="hidden sm:flex text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: section.accent + '20', color: section.accent }}
              >
                {section.steps.length} steps
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  open ? 'rotate-180' : ''
                }`}
                style={{ backgroundColor: section.accent + '20', color: section.accent }}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Steps */}
      {open && (
        <div className="pl-2 mb-2">
          {section.steps.map((step, i) => (
            <StepBox
              key={i}
              step={step}
              index={i}
              accent={section.accent}
              accentLight={section.accentLight}
            />
          ))}
        </div>
      )}

      {/* Divider between sections */}
      {!isLast && (
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   Page
───────────────────────────────────── */
export default function AdminGuide() {
  const [activeId, setActiveId] = useState('system-overview');

  useEffect(() => {
    const onScroll = () => {
      for (const s of [...guide].reverse()) {
        const el = document.getElementById(s.id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveId(s.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar activeTab="Dashboard" />

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-teal-500/15 rounded-full blur-[80px] pointer-events-none" />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-sm font-semibold text-indigo-300 mb-8">
            <Sparkles className="w-4 h-4" />
            Official Admin Documentation
          </div>

          {/* Main title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none mb-6">
            Admin
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-400">
              Guide
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed">
            Simple, step-by-step instructions for running your boarding house on Papikost.
          </p>

          {/* Topic pills */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {guide.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    borderColor: s.accent + '50',
                    color: s.accent,
                    backgroundColor: s.accent + '18',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {s.title}
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom curve */}
        <div className="relative h-16">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 64" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,0 1440,64 L1440,64 L0,64 Z" fill="rgb(248 250 252)" className="dark:fill-slate-950" />
          </svg>
        </div>
      </div>

      {/* ══════════ BODY ══════════ */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex gap-12">

          {/* ── Sticky sidebar ── */}
          <aside className="hidden xl:block w-52 shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-4 px-3">
                Contents
              </p>
              <nav className="space-y-1">
                {guide.map((s) => {
                  const Icon = s.icon;
                  const isActive = activeId === s.id;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={
                        isActive
                          ? { backgroundColor: s.accent + '15', color: s.accent }
                          : { color: '#94a3b8' }
                      }
                    >
                      {isActive && (
                        <div className="w-1 h-4 rounded-full shrink-0" style={{ backgroundColor: s.accent }} />
                      )}
                      {!isActive && <div className="w-1 h-4 rounded-full shrink-0 bg-transparent" />}
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </a>
                  );
                })}
              </nav>

            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {/* Back link */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors mb-10 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </Link>

            {/* Sections */}
            {guide.map((section, i) => (
              <GuideSection key={section.id} section={section} isLast={i === guide.length - 1} />
            ))}

            {/* Footer CTA */}
            <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-10 text-center shadow-2xl shadow-indigo-500/30">
              {/* glow */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">You're all set!</h3>
                <p className="text-indigo-200 text-base mb-8 max-w-sm mx-auto leading-relaxed">
                  You now know how to manage everything in Papikost. Head back to the dashboard and start working.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-black text-sm px-8 py-4 rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all shadow-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
