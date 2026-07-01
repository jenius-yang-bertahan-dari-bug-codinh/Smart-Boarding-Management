// @ts-nocheck
"use client";
import { getAdminBilling } from '@/app/actions/billing';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings, Search, ChevronDown, Plus,
  Wallet, ClipboardList, AlertTriangle, TrendingUp,
  Wifi, FileText, Mail, Filter, Download,
  ChevronLeft, ChevronRight, Check, X, Shield,
} from 'lucide-react';
import Logo from '@/components/Logo';

/* ─── types ─── */
type InvStatus = 'Paid' | 'Unpaid' | 'Overdue';

interface Invoice {
  id: string;
  member: string;
  initials: string;
  avatar: string;
  amount: string;
  dueDate: string;
  dueDateRed?: boolean;
  status: InvStatus;
}

/* ─── data ─── */
// invoices fetched dynamically

const STATUS_STYLES: Record<InvStatus, string> = {
  Paid:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Unpaid:  'bg-amber-50   text-amber-600   border border-amber-200',
  Overdue: 'bg-rose-50    text-rose-600    border border-rose-200',
};

/* bar chart heights for 6-month trend (Jan–Jun) */
// trendBars fetched dynamically

/* ══════════════════════════════════════════════════════ */
export default function BillingPage() {
  const router = useRouter();

  const [invoices, setinvoices] = useState<any[]>([]);
  const [trendBars, setTrendBars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getAdminBilling().then(res => {
      if(res.success && res.data) {
        setinvoices(res.data.invoices);
        setTrendBars(res.data.trendBars);
      }
      setIsLoading(false);
    });
  }, []);



  /* nav */
  const [activeTab, setActiveTab] = useState('Billing');
  const NAV_TABS = ['Dashboard', 'Properties', 'Reservations', 'Billing', 'Members', 'Maintenance'];

  /* toast */
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  /* trend dropdown */
  const [trendOpen, setTrendOpen] = useState(false);
  const [trendLabel, setTrendLabel] = useState('Last 6 Months');
  const trendRef = useRef<HTMLDivElement>(null);

  /* create invoice modal */
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invMember, setInvMember] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  /* pagination */
  const [page, setPage] = useState(1);

  /* hovered bar */
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  /* close dropdowns / modal on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (trendRef.current && !trendRef.current.contains(e.target as Node)) setTrendOpen(false);
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setInvoiceModal(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if      (tab === 'Dashboard')    router.push('/admin');
    else if (tab === 'Properties')   router.push('/admin/properties');
    else if (tab === 'Reservations') router.push('/admin/reservations');
    else if (tab === 'Members')      router.push('/admin/members');
    else if (tab === 'Maintenance')  router.push('/admin/maintenance');
    else showToast(`Viewing ${tab}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col selection:bg-blue-500 selection:text-white">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border-l-4 border-l-blue-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl px-4 py-3 max-w-xs flex items-center gap-3">
          <Check className="w-4 h-4 text-blue-900 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-grow">{toast}</p>
          <button type="button" onClick={() => setToast(null)} className="cursor-pointer"><X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /></button>
        </div>
      )}

      {/* ── Create Invoice Modal ── */}
      {invoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={modalRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Invoice</h3>
              <button type="button" onClick={() => setInvoiceModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!invMember.trim() || !invAmount.trim()) { showToast('Please fill all fields.'); return; } showToast(`Invoice created for ${invMember} – ${invAmount}`); setInvoiceModal(false); setInvMember(''); setInvAmount(''); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Member Name</label>
                <input type="text" required value={invMember} onChange={(e) => setInvMember(e.target.value)} placeholder="Enter member name" className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Amount (USD)</label>
                <input type="text" required value={invAmount} onChange={(e) => setInvAmount(e.target.value)} placeholder="e.g. $1,200.00" className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                <input type="date" defaultValue="2024-10-31" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900" />
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setInvoiceModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950">Cancel</button>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-orange-500/15">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ NAV BAR ══════ */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Logo size={28} />
            <span className="text-base font-extrabold text-blue-900 tracking-tight whitespace-nowrap">SmartStay</span>
          </Link>

          {/* Center tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button key={tab} type="button" onClick={() => handleTabClick(tab)}
                  className={`relative px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer rounded-t-lg ${
                    isActive
                      ? 'text-blue-900 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-blue-900 after:rounded-full'
                      : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-blue-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 rounded-lg'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search bar */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <input type="text" placeholder="Search invoices..." onKeyDown={(e) => { if (e.key === 'Enter') showToast(`Searching for "${(e.target as HTMLInputElement).value}"…`); }} className="w-44 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400 dark:text-slate-500" />
            </div>
            <button type="button" onClick={() => showToast('3 unread notifications')} className="relative p-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-blue-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 rounded-xl cursor-pointer">
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
            <button type="button" onClick={() => window.location.href = '/admin/settings'} className="p-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-blue-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 rounded-xl cursor-pointer">
              <Settings className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* ══════ MAIN ══════ */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">Billing &amp; Financials</h1>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 text-sm font-medium">
              Manage your boarding house revenue, invoices, and payment tracking.
            </p>
          </div>
          <button type="button" onClick={() => setInvoiceModal(true)}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/15 cursor-pointer transition-all shrink-0 self-start sm:self-auto">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create Invoice
          </button>
        </div>

        {/* ── Metric Cards (3 columns) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Card 1: Monthly Income */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Income</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Wallet className="w-4.5 h-4.5 text-blue-700" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">$42,850.00</p>
            <div className="mt-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-600">+12.5% from last month</span>
            </div>
          </div>

          {/* Card 2: Pending invoices */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending invoices</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <ClipboardList className="w-4.5 h-4.5 text-blue-700" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">$8,240.00</p>
            <p className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500">14 invoices awaiting payment</p>
          </div>

          {/* Card 3: Overdue Payments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overdue Payments</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">$2,150.00</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-rose-600">5 payments overdue</span>
            </div>
          </div>

        </div>

        {/* ── Middle Section: Trends + System Health ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Payment Trends */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment Trends</h2>
              <div className="relative" ref={trendRef}>
                <button type="button" onClick={() => setTrendOpen((o) => !o)}
                  className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-all">
                  {trendLabel}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </button>
                {trendOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-30 p-1">
                    {['Last 3 Months', 'Last 6 Months', 'Last 12 Months', 'This Year'].map((opt) => (
                      <button key={opt} type="button" onClick={() => { setTrendLabel(opt); setTrendOpen(false); showToast(`Trends filtered: ${opt}`); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${trendLabel === opt ? 'bg-blue-50 text-blue-900' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bar chart area */}
            <div className="relative h-52 flex items-end justify-between gap-4 px-2 pt-4 border-b border-slate-100 dark:border-slate-800">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-0 pt-2 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-t border-dashed border-slate-100 dark:border-slate-800 w-full" />
                ))}
              </div>

              {trendBars.map((bar, idx) => (
                <div
                  key={bar.month}
                  className="flex-1 flex flex-col items-center group z-10"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {hoveredBar === idx && (
                    <div className="absolute -translate-y-10 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
                      {bar.month}: {['$18.2k','$24.5k','$19.8k','$31.0k','$27.4k','$42.9k'][idx]}
                    </div>
                  )}
                  <div
                    className={`w-full max-w-10 rounded-t-xl transition-all duration-300 cursor-pointer ${
                      bar.highlight
                        ? 'bg-blue-700 shadow-lg shadow-blue-700/20 group-hover:bg-blue-800'
                        : 'bg-slate-200 group-hover:bg-slate-300'
                    }`}
                    style={{ height: `${(bar.h / 100) * 180}px` }}
                  />
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between px-2 mt-3">
              {trendBars.map((bar) => (
                <div key={bar.month} className="flex-1 text-center">
                  <span className={`text-xs font-bold ${bar.highlight ? 'text-blue-700' : 'text-slate-400 dark:text-slate-500'}`}>
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">System Health</h2>

            {/* Occupancy Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500">Occupancy Rate</span>
                <span className="text-sm font-extrabold text-blue-900">92%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-900 h-2.5 rounded-full transition-all duration-700" style={{ width: '92%' }} />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1.5">46 of 50 units occupied</p>
            </div>

            {/* Smart Locks status */}
            <div className="bg-slate-50/80 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3.5 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Smart Locks Online</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">42 Active Hubs</p>
              </div>
              <div className="ml-auto w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4 text-blue-700" />
              </div>
            </div>

            {/* Security System */}
            <div className="bg-slate-50/80 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3.5 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Security System</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">All sensors normal</p>
              </div>
              <div className="ml-auto w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Audit button */}
            <button type="button" onClick={() => showToast('Opening detailed audit report…')}
              className="w-full border border-slate-200 dark:border-slate-700 hover:border-blue-900 bg-white dark:bg-slate-900 hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-blue-900 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">
              View Detailed Audit
            </button>
          </div>

        </div>

        {/* ── Recent invoices Table ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent invoices</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => showToast('Opening filter panel…')}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded-xl cursor-pointer transition-all">
                <Filter className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => showToast('Downloading invoice report…')}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded-xl cursor-pointer transition-all">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  {['Invoice #', 'Member', 'Amount', 'Due Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors group">

                    {/* Invoice ID */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-blue-900">{inv.id}</span>
                    </td>

                    {/* Member */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <img src={inv.avatar} alt={inv.member} className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{inv.member}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">{inv.amount}</span>
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${inv.dueDateRed ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500'}`}>
                        {inv.dueDate}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button type="button" title="View invoice" onClick={() => showToast(`Opening invoice ${inv.id}…`)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg cursor-pointer transition-all">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" title="Send email" onClick={() => showToast(`Email sent to ${inv.member}!`)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg cursor-pointer transition-all">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Showing 1–10 of 124 invoices</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  page === 1
                    ? 'border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 cursor-pointer'
                }`}>
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button type="button" onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-900 hover:bg-blue-950 text-white cursor-pointer transition-all shadow-sm">
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* ══════ GLOBAL FOOTER ══════ */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <div>
              <span className="text-sm font-extrabold text-blue-900 block leading-tight">SmartStay</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                &copy; 2024 SmartStay Management System. All rights reserved.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {['Support', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map((link) => (
              <a key={link} href="#" onClick={(e) => { e.preventDefault(); showToast(`Opening ${link}…`); }}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-blue-900 transition-colors underline-offset-2 hover:underline">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
