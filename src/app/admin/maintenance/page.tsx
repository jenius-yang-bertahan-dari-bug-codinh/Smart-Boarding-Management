// @ts-nocheck
"use client";
import { getAdminMaintenance } from '@/app/actions/maintenance';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings, Search, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Download, ClipboardList, OctagonAlert, Timer, Wrench,
  Filter, Zap, Check, X, MessageSquareWarning, CircleAlert,
} from 'lucide-react';
import Logo from '@/components/Logo';

/* ─── types ─── */
type RequestType = 'Maintenance' | 'Complaint';
type Priority    = 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
type ReqStatus   = 'New' | 'In Progress' | 'Assigned' | 'Resolved';

interface MaintenanceRequest {
  id: string;
  date: string;
  member: string;
  unit: string;
  type: RequestType;
  summary: string;
  priority: Priority;
  technician: string | null;
  techAvatar?: string;
  status: ReqStatus;
}

/* ─── data ─── */
// REQUESTS fetched dynamically

const PRIORITY_STYLES: Record<Priority, string> = {
  EMERGENCY: 'bg-rose-500    text-white',
  HIGH:      'bg-blue-800    text-white',
  MEDIUM:    'bg-orange-400  text-white',
  LOW:       'bg-slate-200   text-slate-600',
};

const STATUS_STYLES: Record<ReqStatus, string> = {
  'New':         'bg-rose-500   text-white',
  'In Progress': 'bg-orange-500 text-white',
  'Assigned':    'bg-blue-900   text-white',
  'Resolved':    'bg-sky-400    text-white',
};

const MINI_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&q=80',
];

/* ══════════════════════════════════════════════════════ */
export default function MaintenancePage() {
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getAdminMaintenance().then(res => {
      if(res.success && res.data) setRequests(res.data);
      setIsLoading(false);
    });
  }, []);



  /* nav */
  const [activeTab, setActiveTab] = useState('Maintenance');
  const NAV_TABS = ['Dashboard', 'Properties', 'Reservations', 'Billing', 'Members', 'Maintenance'];

  /* toast */
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  /* filter bar */
  const [typeFilter,     setTypeFilter]     = useState<'All Requests' | 'Maintenance' | 'Complaint'>('All Requests');
  const [priorityFilter, setPriorityFilter] = useState('Priority: All');
  const [statusFilter,   setStatusFilter]   = useState('Status: All');
  const [tableSearch,    setTableSearch]    = useState('');
  const [priorityOpen,   setPriorityOpen]   = useState(false);
  const [statusOpen,     setStatusOpen]     = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);
  const statusRef   = useRef<HTMLDivElement>(null);

  /* pagination */
  const [page, setPage] = useState(1);

  /* new request modal */
  const [newModal, setNewModal] = useState(false);
  const [reqType,  setReqType]  = useState<RequestType>('Maintenance');
  const [reqMember, setReqMember] = useState('');
  const [reqSummary, setReqSummary] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  /* row detail drawer */
  const [selectedRow, setSelectedRow] = useState<MaintenanceRequest | null>(null);

  /* close dropdowns on outside */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) setPriorityOpen(false);
      if (statusRef.current   && !statusRef.current.contains(e.target as Node))   setStatusOpen(false);
      if (modalRef.current    && !modalRef.current.contains(e.target as Node))     setNewModal(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* filtered rows */
  const filtered = requests.filter((r) => {
    const q = tableSearch.toLowerCase();
    const matchQ      = !q || r.id.toLowerCase().includes(q) || r.member.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q);
    const matchType   = typeFilter === 'All Requests' || r.type === typeFilter;
    const matchPri    = priorityFilter === 'Priority: All' || r.priority === priorityFilter.replace('Priority: ', '');
    const matchStatus = statusFilter   === 'Status: All'   || r.status   === statusFilter.replace('Status: ', '');
    return matchQ && matchType && matchPri && matchStatus;
  });

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if      (tab === 'Dashboard')    router.push('/admin');
    else if (tab === 'Properties')   router.push('/admin/properties');
    else if (tab === 'Reservations') router.push('/admin/reservations');
    else if (tab === 'Billing')      router.push('/admin/billing');
    else if (tab === 'Members')      router.push('/admin/members');
    else showToast(`Viewing ${tab}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-blue-500 selection:text-white">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-24 right-6 z-50 bg-white border-l-4 border-l-blue-900 border border-slate-100 shadow-xl rounded-2xl px-4 py-3 max-w-xs flex items-center gap-3">
          <Check className="w-4 h-4 text-blue-900 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 flex-grow">{toast}</p>
          <button type="button" onClick={() => setToast(null)} className="cursor-pointer"><X className="w-3.5 h-3.5 text-slate-400" /></button>
        </div>
      )}

      {/* ── New Request Modal ── */}
      {newModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">New Request</h3>
              <button type="button" onClick={() => setNewModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!reqMember.trim() || !reqSummary.trim()) { showToast('Fill all fields.'); return; } showToast(`${reqType} request filed for ${reqMember}!`); setNewModal(false); setReqMember(''); setReqSummary(''); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Request Type</label>
                <div className="flex gap-2">
                  {(['Maintenance', 'Complaint'] as RequestType[]).map((t) => (
                    <button key={t} type="button" onClick={() => setReqType(t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${reqType === t ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Member / Unit</label>
                <input type="text" required value={reqMember} onChange={(e) => setReqMember(e.target.value)} placeholder="e.g. Marcus Thompson / Unit 402-B" className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Summary</label>
                <textarea required value={reqSummary} onChange={(e) => setReqSummary(e.target.value)} placeholder="Describe the issue..." rows={3} className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
                <select className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  {['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setNewModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 cursor-pointer rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-sm">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setSelectedRow(null)} />
          <aside className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-extrabold text-blue-900">{selectedRow.id}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">Request Details</h3>
              </div>
              <button type="button" onClick={() => setSelectedRow(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${PRIORITY_STYLES[selectedRow.priority]}`}>{selectedRow.priority}</span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[selectedRow.status]}`}>{selectedRow.status}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">{selectedRow.summary}</p>
              {selectedRow.photo_url && (
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Attached Photo</span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
                    <img src={selectedRow.photo_url} alt="Attachment" className="w-full max-h-52 object-contain rounded-lg" />
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {[
                  { label: 'Date',       value: selectedRow.date },
                  { label: 'Member',     value: selectedRow.member },
                  { label: 'Unit',       value: selectedRow.unit },
                  { label: 'Type',       value: selectedRow.type },
                  { label: 'Technician', value: selectedRow.technician || 'Unassigned' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5 border-b border-slate-50">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2">
                <button type="button" onClick={() => { showToast(`Assigning technician for ${selectedRow.id}…`); setSelectedRow(null); }} className="w-full bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">Assign Technician</button>
                <button type="button" onClick={() => { showToast(`${selectedRow.id} marked Resolved!`); setSelectedRow(null); }} className="w-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">Mark Resolved</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ══════ NAV BAR ══════ */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 shadow-xs z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Stacked logo */}
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Logo size={26} />
            <div className="leading-tight">
              <span className="text-sm font-extrabold text-blue-900 block tracking-tight">SmartStay</span>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">Admin</span>
            </div>
          </Link>

          {/* Tabs */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button key={tab} type="button" onClick={() => handleTabClick(tab)}
                  className={`relative px-3 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-blue-900 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-blue-900 after:rounded-full'
                      : 'text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-lg'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search requests..." onKeyDown={(e) => { if (e.key === 'Enter') showToast(`Searching "${(e.target as HTMLInputElement).value}"…`); }} className="w-44 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-blue-900 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400" />
            </div>
            <button type="button" onClick={() => showToast('3 unread notifications')} className="relative p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl cursor-pointer">
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
            <button type="button" onClick={() => showToast('Opening settings…')} className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl cursor-pointer">
              <Settings className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="border-l border-slate-200 pl-3">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* ══════ MAIN ══════ */}
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">Maintenance &amp; Complaints</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage property health and resident satisfaction requests.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => setNewModal(true)} className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-all">
              <Plus className="w-4 h-4 stroke-[2.5]" /> New Request
            </button>
            <button type="button" onClick={() => showToast('Exporting requests as CSV…')} className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs">
              <Download className="w-4 h-4 text-slate-500" /> Export CSV
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1: Total Open */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Open</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-slate-900">24</span>
              <span className="text-xs font-bold text-rose-500">+3 today</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>

          {/* Card 2: Emergency Issues */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Emergency Issues</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <OctagonAlert className="w-4 h-4 text-rose-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-rose-600">04</span>
              <span className="text-xs font-semibold text-slate-400">Critical focus</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px] font-bold text-rose-500">Requires immediate action</span>
            </div>
          </div>

          {/* Card 3: Avg. Resolution */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Avg. Resolution</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Timer className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-slate-900">4.2h</span>
              <span className="text-xs font-bold text-orange-500">-15% from last week</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-3">
              Performance: <span className="text-blue-700 font-bold">Excellent</span>
            </p>
          </div>

          {/* Card 4: Assigned Today */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Assigned Today</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-slate-900">12</span>
              <span className="text-xs font-semibold text-slate-400">8 active technicians</span>
            </div>
            {/* Overlapping mini avatars */}
            <div className="flex items-center gap-0">
              {MINI_AVATARS.map((src, i) => (
                <img key={i} src={src} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover -ml-1 first:ml-0 shadow-xs" />
              ))}
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[9px] font-extrabold flex items-center justify-center border-2 border-white -ml-1 shadow-xs">+5</span>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white border border-slate-200/60 rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3 shadow-xs">
          {/* Search */}
          <div className="relative flex-grow min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} placeholder="Search ID or Member..."
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-blue-900 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400" />
          </div>

          {/* Segmented toggle */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5 gap-0.5">
            {(['All Requests', 'Maintenance', 'Complaint'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === t ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Priority dropdown */}
          <div className="relative" ref={priorityRef}>
            <button type="button" onClick={() => setPriorityOpen((o) => !o)}
              className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-all">
              {priorityFilter} <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {priorityOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-30 p-1">
                {['Priority: All', 'Priority: EMERGENCY', 'Priority: HIGH', 'Priority: MEDIUM', 'Priority: LOW'].map((o) => (
                  <button key={o} type="button" onClick={() => { setPriorityFilter(o); setPriorityOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${priorityFilter === o ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status dropdown */}
          <div className="relative" ref={statusRef}>
            <button type="button" onClick={() => setStatusOpen((o) => !o)}
              className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-all">
              {statusFilter} <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {statusOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-lg z-30 p-1">
                {['Status: All', 'Status: New', 'Status: In Progress', 'Status: Assigned', 'Status: Resolved'].map((o) => (
                  <button key={o} type="button" onClick={() => { setStatusFilter(o); setStatusOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${statusFilter === o ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter icon */}
          <button type="button" onClick={() => showToast('Opening advanced filter panel…')}
            className="p-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-500 rounded-lg cursor-pointer transition-all">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Data Table ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Request ID', 'Date', 'Member / Unit', 'Category', 'Summary', 'Priority', 'Technician', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-14 text-sm text-slate-400 font-semibold">No requests match your filters.</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSelectedRow(r)} className="hover:bg-slate-50/70 transition-colors cursor-pointer group">

                    {/* ID */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-extrabold text-blue-900">{r.id}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{r.date}</span>
                    </td>

                    {/* Member / Unit */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-slate-800 leading-tight whitespace-nowrap">{r.member}</p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{r.unit}</p>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {r.type === 'Maintenance'
                          ? <Wrench className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          : <MessageSquareWarning className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        }
                        <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{r.type}</span>
                      </div>
                    </td>

                    {/* Summary */}
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="text-xs font-medium text-slate-600 truncate">{r.summary}</p>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${PRIORITY_STYLES[r.priority]}`}>
                        {r.priority}
                      </span>
                    </td>

                    {/* Technician */}
                    <td className="px-4 py-4">
                      {r.technician && r.techAvatar
                        ? (
                          <div className="flex items-center gap-2">
                            <img src={r.techAvatar} alt={r.technician} className="w-6 h-6 rounded-full object-cover border border-slate-100" />
                            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{r.technician}</span>
                          </div>
                        )
                        : <span className="text-xs font-semibold text-slate-400 italic">Unassigned</span>
                      }
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-slate-100 px-5 py-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400">Showing 1–10 of 124 requests</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${page === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 cursor-pointer'}`}>
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${page === n ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                  {n}
                </button>
              ))}
              <span className="text-slate-400 text-xs font-bold px-1">…</span>
              <button type="button" onClick={() => setPage(12)}
                className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${page === 12 ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                12
              </button>
              <button type="button" onClick={() => setPage((p) => Math.min(12, p + 1))} disabled={page === 12}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${page === 12 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 cursor-pointer'}`}>
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ══════ GLOBAL FOOTER ══════ */}
      <footer className="bg-white border-t border-slate-100 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-blue-900">SmartStay Admin</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              &copy; 2024 SmartStay Management Systems. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-5">
            {['Support', 'Privacy Policy', 'Terms of Service'].map((link) => (
              <a key={link} href="#" onClick={(e) => { e.preventDefault(); showToast(`Opening ${link}…`); }}
                className="text-xs font-semibold text-slate-500 hover:text-blue-900 transition-colors hover:underline underline-offset-2">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Floating Action Button (FAB) ── */}
      <button
        type="button"
        onClick={() => setNewModal(true)}
        title="Quick new request"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        <Zap className="w-6 h-6 stroke-[2.2] fill-white" />
      </button>

    </div>
  );
}
