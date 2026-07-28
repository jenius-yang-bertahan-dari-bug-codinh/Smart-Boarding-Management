// @ts-nocheck
"use client";
import { getAdminBilling, generateInvoices, markInvoiceAsPaid, getAllMembers } from '@/app/actions/billing';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings, Search, ChevronDown, Plus,
  Wallet, ClipboardList, AlertTriangle, TrendingUp,
  Wifi, FileText, Mail, Filter, Download,
  ChevronLeft, ChevronRight, Check, X, Shield, Pencil, Link as LinkIcon, Printer
} from 'lucide-react';
import Logo from '@/components/Logo';
import AdminNavbar from '@/components/AdminNavbar';

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
  const [metrics, setMetrics] = useState<any>(null);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [trendFilter, setTrendFilter] = useState('6_months');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const refreshData = (tFilter = trendFilter) => {
    getAdminBilling(tFilter).then(res => {
      if(res.success && res.data) {
        setinvoices(res.data.invoices);
        setTrendBars(res.data.trendBars);
        setMetrics(res.data.metrics);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    refreshData(trendFilter);
    getAllMembers().then(res => {
      if(res.success && res.data) setMembersList(res.data);
    });
  }, []);

  // Check payment status from Midtrans API and refresh data
  const checkPaymentStatus = useCallback(async () => {
    const pendingWithGateway = invoices.filter(
      (p: any) => (p.status === 'Unpaid' || p.status === 'Overdue') && p.gatewayReference
    );
    if (pendingWithGateway.length === 0) return;

    try {
      const res = await fetch('/api/payments/admin-check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: pendingWithGateway.map((p: any) => p.rawId)
        })
      });
      const data = await res.json();
      if (data.updated && data.updated.length > 0) {
        refreshData(); // Refresh table if there are changes
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  }, [invoices, trendFilter]);

  // Auto-check payment status when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      checkPaymentStatus();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkPaymentStatus]);



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

  const handleTrendSelect = (label: string, value: string) => {
    setTrendLabel(label);
    setTrendFilter(value);
    setTrendOpen(false);
    setIsLoading(true);
    refreshData(value);
  };

  /* create invoice modal */
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invMemberId, setInvMemberId] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [startMonth, setStartMonth] = useState(() => new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  /* edit invoice modal */
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editInvIdStr, setEditInvIdStr] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editMemberId, setEditMemberId] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState('Pending');
  const [editBillingMonth, setEditBillingMonth] = useState('');
  const editModalRef = useRef<HTMLDivElement>(null);

  /* audit modal */
  const [auditModal, setAuditModal] = useState(false);
  const auditRef = useRef<HTMLDivElement>(null);

  /* search and pagination */
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  /* hovered bar */
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  /* close dropdowns / modal on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (trendRef.current && !trendRef.current.contains(e.target as Node)) setTrendOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setInvoiceModal(false);
      if (auditRef.current && !auditRef.current.contains(e.target as Node)) setAuditModal(false);
      if (editModalRef.current && !editModalRef.current.contains(e.target as Node)) setEditModal(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const itemsPerPage = 10;
  const filteredInvoices = invoices.filter(inv => {
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchSearch = !searchQuery || inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || inv.member.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const startIdx = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endIdx = Math.min(page * itemsPerPage, totalItems);

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

      {/* ── Generate Invoices Modal ── */}
      {invoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={modalRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Generate Contract Invoices</h3>
              <button type="button" onClick={() => setInvoiceModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              if (!invMemberId || !invAmount || !startMonth) { showToast('Please fill all required fields.'); return; } 
              setIsSubmitting(true);
              const res = await generateInvoices(Number(invMemberId), parseFloat(invAmount), startMonth, durationMonths, description);
              setIsSubmitting(false);
              if (res.success) {
                showToast(`Generated ${durationMonths} invoice(s) successfully!`); 
                setInvoiceModal(false); 
                setInvMemberId(''); 
                setInvAmount(''); 
                setDescription('');
                setDurationMonths(1);
                refreshData();
              } else {
                showToast('Error generating invoices');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Member</label>
                <select required value={invMemberId} onChange={(e) => setInvMemberId(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  <option value="" disabled>Choose a member...</option>
                  {membersList.map(m => <option key={m.id} value={m.id}>{m.name} {m.room ? `(Room ${m.room.room_number})` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Rent (Rp)</label>
                  <input type="number" step="0.01" required value={invAmount} onChange={(e) => setInvAmount(e.target.value)} placeholder="e.g. 1500000" className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Duration (Months)</label>
                  <input type="number" min="1" max="60" required value={durationMonths} onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
                  <input type="date" required value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (Optional)</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Sewa Bulan Agustus" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setInvoiceModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-orange-500/15 disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Invoice Modal ── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={editModalRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">View Invoice {editInvIdStr}</h3>
              <button type="button" onClick={() => setEditModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Recipient (Member)</label>
                <select disabled value={editMemberId} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed">
                  <option value="" disabled>Choose a member...</option>
                  {membersList.map(m => <option key={m.id} value={m.id}>{m.name} {m.room ? `(Room ${m.room.room_number})` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Amount (Rp)</label>
                  <input type="text" readOnly value={editAmount} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <input type="text" readOnly value={editStatus} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                  <input type="text" readOnly value={editDueDate} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">For Month</label>
                  <input type="text" readOnly value={editBillingMonth} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setEditModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold px-5 py-2 rounded-xl text-sm transition-colors cursor-pointer w-full sm:w-auto">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── System Audit Modal ── */}
      {auditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={auditRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                System Health & Audit Log
              </h3>
              <button type="button" onClick={() => setAuditModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">All systems operational</p>
                  <p className="text-xs font-medium text-emerald-700/80 dark:text-emerald-500/80 mt-1">No anomalies detected in the last 24 hours. Data sync is active.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Activity Logs</h4>
                
                {[
                  { id: 1, time: '10 mins ago', msg: 'Admin John requested billing metric refresh.', type: 'info' },
                  { id: 2, time: '2 hours ago', msg: 'System backed up securely to AWS S3.', type: 'success' },
                  { id: 3, time: '5 hours ago', msg: 'Smart Lock Hub #42 reconnected successfully.', type: 'warning' },
                  { id: 4, time: '1 day ago', msg: 'Monthly invoices batch processed for 124 units.', type: 'success' },
                  { id: 5, time: '1 day ago', msg: 'Failed login attempt detected from IP 192.168.1.14 (Blocked).', type: 'error' },
                ].map(log => (
                  <div key={log.id} className="flex items-start gap-4 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0 w-20">{log.time}</span>
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        log.type === 'success' ? 'bg-emerald-500' :
                        log.type === 'warning' ? 'bg-amber-500' :
                        log.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
                      }`} />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{log.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-4 shrink-0 flex justify-end">
              <button type="button" onClick={() => setAuditModal(false)} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl cursor-pointer transition-all shadow-md">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ NAV BAR ══════ */}
      <AdminNavbar activeTab="Billing" />

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
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{metrics?.monthlyIncome || 'Rp 0'}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-600">Calculated from paid invoices</span>
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
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{metrics?.pendingInvoicesSum || 'Rp 0'}</p>
            <p className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500">{metrics?.pendingInvoicesCount || 0} invoices awaiting payment</p>
          </div>

          {/* Card 3: Overdue Payments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overdue Payments</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{metrics?.overduePaymentsSum || 'Rp 0'}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-rose-600">{metrics?.overduePaymentsCount || 0} payments overdue</span>
            </div>
          </div>

        </div>

        {/* ── Middle Section: Trends + System Health ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Payment Trends */}
          <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
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
                    {[
                      { label: 'Last 6 Months', value: '6_months' },
                      { label: 'This Year', value: 'this_year' }
                    ].map((opt) => (
                      <button key={opt.value} type="button" onClick={() => handleTrendSelect(opt.label, opt.value)}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${trendLabel === opt.label ? 'bg-blue-50 text-blue-900' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950'}`}>
                        {opt.label}
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
                      {bar.month}: {bar.rawValue}
                    </div>
                  )}
                  <div
                    className={`w-full max-w-10 rounded-t-xl transition-all duration-300 cursor-pointer ${
                      bar.active
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
        </div>

        {/* ── Recent invoices Table ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white hidden sm:block">Recent invoices</h2>
            <div className="flex flex-1 sm:flex-none justify-end items-center gap-2">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search invoices..." className="w-full sm:w-44 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400 dark:text-slate-500" />
              </div>
              <div className="relative" ref={filterRef}>
                <button type="button" onClick={() => setFilterOpen(o => !o)}
                  className={`p-2 border rounded-xl cursor-pointer transition-all ${filterOpen || statusFilter !== 'All' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-500 dark:text-slate-400'}`}>
                  <Filter className="w-4 h-4" />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-30 p-1">
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filter Status</div>
                    {['All', 'Paid', 'Unpaid', 'Overdue'].map(st => (
                      <button key={st} type="button" onClick={() => { setStatusFilter(st); setFilterOpen(false); setPage(1); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${statusFilter === st ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => {
                if (!invoices.length) {
                  showToast('No invoices to export');
                  return;
                }
                const headers = ['Invoice ID', 'Member', 'Amount', 'For Month', 'Due Date', 'Status'];
                const csvContent = [
                  headers.join(','),
                  ...invoices.map((inv: any) => 
                    [inv.id, `"${inv.member}"`, `"${inv.amount}"`, `"${inv.billingMonth}"`, `"${inv.dueDate}"`, inv.status].join(',')
                  )
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `invoice_report_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast('Exporting CSV...');
              }}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded-xl cursor-pointer transition-all">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  {['Invoice #', 'Member', 'Amount', 'For Month', 'Due Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {paginatedInvoices.map((inv) => (
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

                    {/* For Month */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{inv.billingMonth}</span>
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
                        {(inv.status === 'Unpaid' || inv.status === 'Overdue') && (
                          <button type="button" title="Approve Payment" onClick={async () => {
                            showToast(`Approving invoice ${inv.id}...`);
                            const { markInvoiceAsPaid } = await import('@/app/actions/billing');
                            const res = await markInvoiceAsPaid(inv.rawId);
                            if (res.success) { showToast(`${inv.id} marked as Paid!`); refreshData(); }
                          }}
                            className="p-1.5 text-emerald-500 hover:text-white hover:bg-emerald-500 rounded-lg cursor-pointer transition-all">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(inv.status === 'Unpaid' || inv.status === 'Overdue') && (
                          <button type="button" title="Generate/Copy Payment Link" onClick={async () => {
                            if (inv.gatewayReference) {
                              // Parse redirect URL from gateway_reference (format: "order_id|redirect_url" or legacy URL)
                              const parts = inv.gatewayReference.split('|');
                              const url = parts.length > 1 ? parts[1] : parts[0];
                              navigator.clipboard.writeText(url);
                              showToast('Payment link copied to clipboard!');
                              return;
                            }
                            showToast(`Generating link for ${inv.id}...`);
                            const { generatePaymentLink } = await import('@/app/actions/midtrans');
                            const res = await generatePaymentLink(inv.rawId);
                            if (res.success && res.redirect_url) {
                              navigator.clipboard.writeText(res.redirect_url);
                              showToast('Midtrans link generated and copied!');
                              refreshData();
                            } else {
                              showToast('Failed to generate link', 'error');
                            }
                          }}
                            className="p-1.5 text-blue-500 hover:text-white hover:bg-blue-500 rounded-lg cursor-pointer transition-all">
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {inv.status === 'Paid' && (
                          <a href={`/receipt/${inv.rawId}`} target="_blank" rel="noopener noreferrer" title="Download Receipt" className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-all">
                            <Printer className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button type="button" title="View Details" onClick={() => {
                          setEditId(inv.rawId);
                          setEditInvIdStr(inv.id);
                          setEditAmount(inv.amount.replace('Rp ', '').replace(/\./g, '').replace(',', ''));
                          setEditStatus(inv.status);
                          setEditDueDate(inv.dueDate);
                          setEditBillingMonth(inv.billingMonth);
                          
                          // match member name to member id
                          const mem = membersList.find(m => m.name === inv.member);
                          setEditMemberId(mem ? mem.id.toString() : '');
                          
                          setEditModal(true);
                        }}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg cursor-pointer transition-all">
                          <FileText className="w-3.5 h-3.5" />
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
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Showing {startIdx}–{endIdx} of {totalItems} invoices</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  page === 1
                    ? 'border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed bg-transparent'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 cursor-pointer'
                }`}>
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  page >= totalPages
                    ? 'border border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed bg-transparent'
                    : 'bg-blue-900 hover:bg-blue-950 text-white cursor-pointer shadow-sm'
                }`}>
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
          <div>
            <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Papikost</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              &copy; 2024 Papikost Management System. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-5">
            {['Contact Us'].map((link) => (
              <a key={link} href="#" onClick={(e) => { e.preventDefault(); showToast(`Opening ${link}…`); }}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-blue-900 transition-colors hover:underline underline-offset-2">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
