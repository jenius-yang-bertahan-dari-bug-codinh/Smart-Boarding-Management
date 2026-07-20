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
import AdminNavbar from '@/components/AdminNavbar';

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
  LOW:       'bg-slate-200   text-slate-600 dark:text-slate-400 dark:text-slate-500',
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
  const [reqPriority, setReqPriority] = useState<Priority>('LOW');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqMember.trim() || !reqSummary.trim()) { showToast('Fill all fields.'); return; }
    
    const newReq = {
      id: `#MT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(),
      member: reqMember,
      unit: 'Unknown Unit',
      type: reqType,
      summary: reqSummary,
      priority: reqPriority,
      technician: null,
      status: 'New'
    };

    setRequests([newReq, ...requests]);
    showToast(`${reqType} request filed for ${reqMember}!`);
    setNewModal(false);
    setReqMember('');
    setReqSummary('');
    setReqPriority('LOW');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Member', 'Unit', 'Type', 'Summary', 'Priority', 'Status'];
    const rows = filtered.map(r => [
      r.id, r.date, r.member, r.unit, r.type, `"${r.summary.replace(/"/g, '""')}"`, r.priority, r.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "maintenance_requests.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('CSV Exported!');
  };

  const handleAssignTechnician = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Assigned', technician: 'Alex (Tech)' } : r));
    showToast(`Assigned technician for ${id}`);
    setSelectedRow(null);
  };

  const handleMarkInProgress = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'In Progress' } : r));
    showToast(`${id} is now In Progress`);
    setSelectedRow(null);
  };

  const handleMarkResolved = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
    showToast(`${id} marked Resolved!`);
    setSelectedRow(null);
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm(`Are you sure you want to delete request ${id}?`)) {
      setRequests(requests.filter(r => r.id !== id));
      showToast(`${id} deleted successfully.`);
      setSelectedRow(null);
    }
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col selection:bg-blue-500 selection:text-white">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-slate-900 border-l-4 border-l-blue-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl px-4 py-3 max-w-xs flex items-center gap-3">
          <Check className="w-4 h-4 text-blue-900 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-grow">{toast}</p>
          <button type="button" onClick={() => setToast(null)} className="cursor-pointer"><X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /></button>
        </div>
      )}

      {/* ── New Request Modal ── */}
      {newModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={modalRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">New Request</h3>
              <button type="button" onClick={() => setNewModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleNewRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Request Type</label>
                <div className="flex gap-2">
                  {(['Maintenance', 'Complaint'] as RequestType[]).map((t) => (
                    <button key={t} type="button" onClick={() => setReqType(t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${reqType === t ? 'bg-blue-900 text-white border-blue-900' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Member / Unit</label>
                <input type="text" required value={reqMember} onChange={(e) => setReqMember(e.target.value)} placeholder="e.g. Marcus Thompson / Unit 402-B" className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Issue Summary</label>
                <textarea required value={reqSummary} onChange={(e) => setReqSummary(e.target.value)} placeholder="Describe the issue..." rows={3} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                <select value={reqPriority} onChange={(e) => setReqPriority(e.target.value as Priority)} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  {['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setNewModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950">Cancel</button>
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
          <aside className="relative w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <span className="text-xs font-extrabold text-blue-900">{selectedRow.id}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Request Details</h3>
              </div>
              <button type="button" onClick={() => setSelectedRow(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${PRIORITY_STYLES[selectedRow.priority]}`}>{selectedRow.priority}</span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[selectedRow.status]}`}>{selectedRow.status}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{selectedRow.summary}</p>
              {selectedRow.photo_url && (
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Attached Photo</span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2">
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
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2">
                <button type="button" onClick={() => handleAssignTechnician(selectedRow.id)} className="w-full bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">Assign Technician</button>
                <button type="button" onClick={() => handleMarkInProgress(selectedRow.id)} className="w-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">Mark In Progress</button>
                <button type="button" onClick={() => handleMarkResolved(selectedRow.id)} className="w-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">Mark Resolved</button>
                <button type="button" onClick={() => handleDeleteRequest(selectedRow.id)} className="w-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all mt-4">Delete Request</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ══════ NAV BAR ══════ */}
      <AdminNavbar activeTab="Maintenance" />

      {/* ══════ MAIN ══════ */}
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">Maintenance &amp; Complaints</h1>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 text-sm font-medium">Manage property health and resident satisfaction requests.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => setNewModal(true)} className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-all">
              <Plus className="w-4 h-4 stroke-[2.5]" /> New Request
            </button>
            <button type="button" onClick={handleExportCSV} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs">
              <Download className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" /> Export CSV
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1: Total Open */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Open</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white">24</span>
              <span className="text-xs font-bold text-rose-500">+3 today</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>

          {/* Card 2: Emergency Issues */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Emergency Issues</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <OctagonAlert className="w-4 h-4 text-rose-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-rose-600">04</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Critical focus</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px] font-bold text-rose-500">Requires immediate action</span>
            </div>
          </div>

          {/* Card 3: Avg. Resolution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Avg. Resolution</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Timer className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">4.2h</span>
              <span className="text-xs font-bold text-orange-500">-15% from last week</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-3">
              Performance: <span className="text-blue-700 font-bold">Excellent</span>
            </p>
          </div>

          {/* Card 4: Assigned Today */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Assigned Today</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white">12</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">8 active technicians</span>
            </div>
            {/* Overlapping mini avatars */}
            <div className="flex items-center gap-0">
              {MINI_AVATARS.map((src, i) => (
                <img key={i} src={src} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover -ml-1 first:ml-0 shadow-xs" />
              ))}
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-[9px] font-extrabold flex items-center justify-center border-2 border-white -ml-1 shadow-xs">+5</span>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3 shadow-xs">
          {/* Search */}
          <div className="relative flex-grow min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <input type="text" value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} placeholder="Search ID or Member..."
              className="w-full bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400 dark:text-slate-500" />
          </div>

          {/* Segmented toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 gap-0.5">
            {(['All Requests', 'Maintenance', 'Complaint'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === t ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Priority dropdown */}
          <div className="relative" ref={priorityRef}>
            <button type="button" onClick={() => setPriorityOpen((o) => !o)}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-all">
              {priorityFilter} <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </button>
            {priorityOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-30 p-1">
                {['Priority: All', 'Priority: EMERGENCY', 'Priority: HIGH', 'Priority: MEDIUM', 'Priority: LOW'].map((o) => (
                  <button key={o} type="button" onClick={() => { setPriorityFilter(o); setPriorityOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${priorityFilter === o ? 'bg-blue-50 text-blue-900' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status dropdown */}
          <div className="relative" ref={statusRef}>
            <button type="button" onClick={() => setStatusOpen((o) => !o)}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-all">
              {statusFilter} <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </button>
            {statusOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-30 p-1">
                {['Status: All', 'Status: New', 'Status: In Progress', 'Status: Assigned', 'Status: Resolved'].map((o) => (
                  <button key={o} type="button" onClick={() => { setStatusFilter(o); setStatusOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${statusFilter === o ? 'bg-blue-50 text-blue-900' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>


        </div>

        {/* ── Data Table ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  {['Request ID', 'Date', 'Member / Unit', 'Category', 'Summary', 'Priority', 'Technician', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-14 text-sm text-slate-400 dark:text-slate-500 font-semibold">No requests match your filters.</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSelectedRow(r)} className="hover:bg-slate-50/70 transition-colors cursor-pointer group">

                    {/* ID */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-extrabold text-blue-900">{r.id}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 whitespace-nowrap">{r.date}</span>
                    </td>

                    {/* Member / Unit */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight whitespace-nowrap">{r.member}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{r.unit}</p>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {r.type === 'Maintenance'
                          ? <Wrench className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          : <MessageSquareWarning className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        }
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 whitespace-nowrap">{r.type}</span>
                      </div>
                    </td>

                    {/* Summary */}
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 truncate">{r.summary}</p>
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
                            <img src={r.techAvatar} alt={r.technician} className="w-6 h-6 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.technician}</span>
                          </div>
                        )
                        : <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">Unassigned</span>
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
          <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Showing 1–10 of 124 requests</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${page === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer'}`}>
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${page === n ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>
                  {n}
                </button>
              ))}
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold px-1">…</span>
              <button type="button" onClick={() => setPage(12)}
                className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${page === 12 ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>
                12
              </button>
              <button type="button" onClick={() => setPage((p) => Math.min(12, p + 1))} disabled={page === 12}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${page === 12 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer'}`}>
                <ChevronRight className="w-4 h-4 stroke-[2]" />
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
