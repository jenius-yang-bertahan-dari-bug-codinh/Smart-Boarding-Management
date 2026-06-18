"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings, Search, Filter, ChevronDown,
  ChevronLeft, ChevronRight, Download, UserPlus,
  Check, X, ExternalLink,
} from 'lucide-react';
import Logo from '@/components/Logo';

/* ─── types ─── */
type MemberStatus = 'Active' | 'New' | 'Moving Out' | 'Inactive';

interface Member {
  id: string;
  stId: string;
  name: string;
  avatar: string;
  room: string;
  floor: string;
  email: string;
  phone: string;
  status: MemberStatus;
  joinDate: string;
}

/* ─── data ─── */
const ALL_MEMBERS: Member[] = [
  {
    id: '1', stId: '#ST-8821', name: 'Elena Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    room: 'Room 402B', floor: 'Floor 4',
    email: 'e.rodriguez@email.com', phone: '+1 (555) 012-3456',
    status: 'Active', joinDate: 'Jan 12, 2023',
  },
  {
    id: '2', stId: '#ST-9012', name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    room: 'Room 215', floor: 'Floor 2',
    email: 'm.chen@outlook.com', phone: '+1 (555) 987-6543',
    status: 'New', joinDate: 'Mar 05, 2024',
  },
  {
    id: '3', stId: '#ST-7554', name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    room: 'Room 108A', floor: 'Floor 1',
    email: 'sarah.j@webmail.com', phone: '+1 (555) 234-5678',
    status: 'Moving Out', joinDate: 'Aug 15, 2022',
  },
  {
    id: '4', stId: '#ST-8119', name: 'David Wilson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    room: 'Room 303', floor: 'Floor 3',
    email: 'd.wilson@corp.com', phone: '+1 (555) 345-6789',
    status: 'Active', joinDate: 'Oct 21, 2023',
  },
  {
    id: '5', stId: '#ST-6632', name: 'Maya Kapoor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    room: 'Room 501', floor: 'Floor 5',
    email: 'maya.kapoor@tech.io', phone: '+1 (555) 456-7890',
    status: 'Active', joinDate: 'Feb 14, 2024',
  },
];

const STATUS_STYLES: Record<MemberStatus, string> = {
  'Active':     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'New':        'bg-blue-50    text-blue-700    border border-blue-200',
  'Moving Out': 'bg-orange-50  text-orange-600  border border-orange-200',
  'Inactive':   'bg-slate-100  text-slate-500   border border-slate-200',
};

const STATUS_DOT: Record<MemberStatus, string> = {
  'Active':     'bg-emerald-500',
  'New':        'bg-blue-500',
  'Moving Out': 'bg-orange-500',
  'Inactive':   'bg-slate-400',
};

/* ══════════════════════════════════════════════════════ */
export default function MembersPage() {
  const router = useRouter();

  /* nav */
  const [activeTab, setActiveTab] = useState('Members');
  const NAV_TABS = ['Dashboard', 'Properties', 'Reservations', 'Billing', 'Members', 'Maintenance'];

  /* toast */
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  /* filters */
  const [floorFilter,  setFloorFilter]  = useState('All Floors');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [floorOpen,    setFloorOpen]    = useState(false);
  const [statusOpen,   setStatusOpen]   = useState(false);
  const floorRef  = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  /* pagination */
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [rowsOpen, setRowsOpen] = useState(false);
  const rowsRef = useRef<HTMLDivElement>(null);

  /* add resident modal */
  const [addModal, setAddModal]     = useState(false);
  const [newName, setNewName]       = useState('');
  const [newEmail, setNewEmail]     = useState('');
  const [newRoom, setNewRoom]       = useState('101');
  const modalRef = useRef<HTMLDivElement>(null);

  /* detail drawer */
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  /* close on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (floorRef.current  && !floorRef.current.contains(e.target as Node))  setFloorOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
      if (rowsRef.current   && !rowsRef.current.contains(e.target as Node))   setRowsOpen(false);
      if (modalRef.current  && !modalRef.current.contains(e.target as Node))  setAddModal(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* filtered members */
  const filtered = ALL_MEMBERS.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.room.toLowerCase().includes(q) || m.stId.toLowerCase().includes(q);
    const matchFloor  = floorFilter  === 'All Floors' || m.floor === floorFilter;
    const matchStatus = statusFilter === 'All Status'  || m.status === statusFilter;
    return matchQ && matchFloor && matchStatus;
  });

  const clearFilters = () => { setFloorFilter('All Floors'); setStatusFilter('All Status'); setSearchQuery(''); };
  const hasFilters   = floorFilter !== 'All Floors' || statusFilter !== 'All Status' || searchQuery !== '';

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if      (tab === 'Dashboard')    router.push('/admin');
    else if (tab === 'Properties')   router.push('/admin/properties');
    else if (tab === 'Reservations') router.push('/admin/reservations');
    else if (tab === 'Billing')      router.push('/admin/billing');
    else if (tab === 'Maintenance')  router.push('/admin/maintenance');
    else showToast(`Viewing ${tab}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-blue-500 selection:text-white">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-l-4 border-l-blue-900 border border-slate-100 shadow-xl rounded-2xl px-4 py-3 max-w-xs flex items-center gap-3">
          <Check className="w-4 h-4 text-blue-900 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 flex-grow">{toast}</p>
          <button type="button" onClick={() => setToast(null)} className="cursor-pointer"><X className="w-3.5 h-3.5 text-slate-400" /></button>
        </div>
      )}

      {/* ── Add Resident Modal ── */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Resident</h3>
              <button type="button" onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!newName.trim() || !newEmail.trim()) { showToast('Please fill all fields.'); return; } showToast(`${newName} added to ${newRoom}!`); setAddModal(false); setNewName(''); setNewEmail(''); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter full name" className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter email" className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign Room</label>
                <select value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  <option value="101">Room 101 – Deluxe Suite (Floor 1)</option>
                  <option value="215">Room 215 – Studio (Floor 2)</option>
                  <option value="303">Room 303 – Shared Dorm (Floor 3)</option>
                  <option value="402B">Room 402B – Executive (Floor 4)</option>
                  <option value="501">Room 501 – Penthouse (Floor 5)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 cursor-pointer rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-orange-500/15">Add Resident</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Member Detail Side Drawer ── */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setSelectedMember(null)} />
          <aside className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900">Member Details</h3>
              <button type="button" onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm" />
                <div>
                  <p className="text-base font-extrabold text-slate-900">{selectedMember.name}</p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{selectedMember.stId}</p>
                  <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[selectedMember.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selectedMember.status]}`} />
                    {selectedMember.status}
                  </span>
                </div>
              </div>
              {/* Details grid */}
              <div className="space-y-3">
                {[
                  { label: 'Room',       value: `${selectedMember.room}, ${selectedMember.floor}` },
                  { label: 'Email',      value: selectedMember.email },
                  { label: 'Phone',      value: selectedMember.phone },
                  { label: 'Join Date',  value: selectedMember.joinDate },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-semibold text-slate-700 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2">
                <button type="button" onClick={() => { setSelectedMember(null); showToast(`Opening full profile for ${selectedMember.name}…`); }} className="w-full bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">
                  Full Profile
                </button>
                <button type="button" onClick={() => { showToast(`Edit mode for ${selectedMember.name}`); }} className="w-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">
                  Edit Member
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ══════ NAV BAR ══════ */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 shadow-xs z-40">
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
                  className={`relative px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-blue-900 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-blue-900 after:rounded-full'
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
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-blue-900 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <button type="button" onClick={() => showToast('3 unread notifications')} className="relative p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl cursor-pointer">
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
            <button type="button" onClick={() => showToast('Opening system settings…')} className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl cursor-pointer">
              <Settings className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="border-l border-slate-200 pl-3">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* ══════ MAIN ══════ */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-5">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">Members Directory</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Manage all 142 residents across your properties.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => showToast('Exporting member data as CSV…')}
              className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs">
              <Download className="w-4 h-4 text-slate-500" />
              Export Member Data
            </button>
            <button type="button" onClick={() => setAddModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/15 cursor-pointer transition-all">
              <UserPlus className="w-4 h-4 stroke-[2.2]" />
              Add Resident
            </button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white border border-slate-200/60 rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3 shadow-xs">
          {/* Left: filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />

            {/* Floor dropdown */}
            <div className="relative" ref={floorRef}>
              <button type="button" onClick={() => setFloorOpen((o) => !o)}
                className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                {floorFilter} <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {floorOpen && (
                <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-lg z-30 p-1">
                  {['All Floors', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'].map((opt) => (
                    <button key={opt} type="button" onClick={() => { setFloorFilter(opt); setFloorOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${floorFilter === opt ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status dropdown */}
            <div className="relative" ref={statusRef}>
              <button type="button" onClick={() => setStatusOpen((o) => !o)}
                className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                {statusFilter} <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {statusOpen && (
                <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-lg z-30 p-1">
                  {['All Status', 'Active', 'New', 'Moving Out', 'Inactive'].map((opt) => (
                    <button key={opt} type="button" onClick={() => { setStatusFilter(opt); setStatusOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${statusFilter === opt ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer transition-colors hover:underline">
                Clear Filters
              </button>
            )}
          </div>

          {/* Right: count */}
          <p className="ml-auto text-xs font-semibold text-slate-400 whitespace-nowrap">
            Showing 1 – {Math.min(rowsPerPage, filtered.length)} of {filtered.length === ALL_MEMBERS.length ? '142' : filtered.length} members
          </p>
        </div>

        {/* ── Members Table ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Resident', 'Room', 'Contact', 'Status', 'Join Date', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50/80">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-sm text-slate-400 font-semibold">
                      No members match your search or filters.
                    </td>
                  </tr>
                )}
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors group">

                    {/* Resident */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-xs shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{m.name}</p>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">ID: {m.stId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-700 leading-tight">{m.room}</p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{m.floor}</p>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-slate-600 leading-tight">{m.email}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{m.phone}</p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${STATUS_STYLES[m.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[m.status]}`} />
                        {m.status === 'Active' ? '+ Active' : m.status}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">{m.joinDate}</span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 text-xs font-bold cursor-pointer transition-colors hover:underline underline-offset-2 group-hover:opacity-100"
                      >
                        View Details
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-slate-100 px-5 py-3.5 flex items-center justify-between gap-3">
            {/* Rows per page */}
            <div className="relative flex items-center gap-2" ref={rowsRef}>
              <span className="text-xs font-semibold text-slate-400">Rows per page:</span>
              <button type="button" onClick={() => setRowsOpen((o) => !o)}
                className="flex items-center gap-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all">
                {rowsPerPage} <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {rowsOpen && (
                <div className="absolute bottom-full left-14 mb-1 w-24 bg-white border border-slate-100 rounded-xl shadow-lg z-30 p-1">
                  {[5, 10, 20, 50].map((n) => (
                    <button key={n} type="button" onClick={() => { setRowsOpen(false); showToast(`Showing ${n} rows per page`); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${rowsPerPage === n ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {(page - 1) * rowsPerPage + 1} – {Math.min(page * rowsPerPage, 142)} of 142
              </span>
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className={`p-1.5 rounded-lg transition-all ${page === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 cursor-pointer'}`}>
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page * rowsPerPage >= 142}
                className={`p-1.5 rounded-lg transition-all ${page * rowsPerPage >= 142 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 cursor-pointer'}`}>
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
            <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">SmartStay</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              &copy; 2024 SmartStay Management System. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-5">
            {['Support', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map((link) => (
              <a key={link} href="#" onClick={(e) => { e.preventDefault(); showToast(`Opening ${link}…`); }}
                className="text-xs font-semibold text-slate-500 hover:text-blue-900 transition-colors hover:underline underline-offset-2">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
