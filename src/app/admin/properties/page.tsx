"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Settings,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Pencil,
  ArrowLeftRight,
  UserMinus,
  UserPlus,
  Copy,
  RotateCcw,
  History,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Plus,
} from 'lucide-react';
import Logo from '@/components/Logo';

/* ─────────────────────────── types ─────────────────────────── */
type StatusType = 'Active Member' | 'Empty Room' | 'Past Member';

interface Member {
  initials: string;
  name: string;
  email: string;
  leaseStart: string;
}

interface Room {
  id: string;
  roomNo: string;
  floor: string;
  type: string;
  price: string;
  member: Member | null;
  status: StatusType;
  color: string; // avatar bg color
}

/* ─────────────────────────── data ─────────────────────────── */
const INITIAL_ROOMS: Room[] = [
  {
    id: '1',
    roomNo: '101',
    floor: 'Floor 1',
    type: 'Deluxe Suite',
    price: '$1,200',
    member: { initials: 'JS', name: 'Jonathan Smith', email: 'jsmith@email.com', leaseStart: 'Jan 12, 2024' },
    status: 'Active Member',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    roomNo: '205',
    floor: 'Floor 2',
    type: 'Single Studio',
    price: '$850',
    member: null,
    status: 'Empty Room',
    color: '',
  },
  {
    id: '3',
    roomNo: '104',
    floor: 'Floor 1',
    type: 'Deluxe Suite',
    price: '$1,200',
    member: { initials: 'MB', name: 'Maria Black', email: 'm.black@work.com', leaseStart: 'Nov 05, 2022' },
    status: 'Past Member',
    color: 'bg-teal-500',
  },
  {
    id: '4',
    roomNo: '302',
    floor: 'Floor 3',
    type: 'Shared Dorm',
    price: '$550',
    member: { initials: 'LC', name: 'Liam Carter', email: 'liam.c@social.net', leaseStart: 'Mar 22, 2024' },
    status: 'Active Member',
    color: 'bg-indigo-500',
  },
];

/* ─────────────────────────── helpers ─────────────────────────── */
const STATUS_STYLES: Record<StatusType, string> = {
  'Active Member': 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  'Empty Room':    'bg-slate-100  text-slate-500  border border-slate-200/60',
  'Past Member':   'bg-orange-50  text-orange-600 border border-orange-200/60',
};

/* ═══════════════════════════ page ═══════════════════════════ */
export default function RoomsAndMembersPage() {
  const router = useRouter();

  /* nav state */
  const [activeTab, setActiveTab] = useState<string>('Properties');

  /* search / filter */
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter]   = useState('All Floors');
  const [typeFilter, setTypeFilter]     = useState('Room Type');
  const [statusFilter, setStatusFilter] = useState('Occupancy Status');
  const [floorOpen, setFloorOpen]   = useState(false);
  const [typeOpen, setTypeOpen]     = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const floorRef  = useRef<HTMLDivElement>(null);
  const typeRef   = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  /* pagination */
  const [page, setPage] = useState(1);

  /* add-new dropdown */
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  /* toast */
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* add resident modal */
  const [addModal, setAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoom, setNewRoom] = useState('101');

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (floorRef.current  && !floorRef.current.contains(e.target as Node))  setFloorOpen(false);
      if (typeRef.current   && !typeRef.current.contains(e.target as Node))   setTypeOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
      if (addRef.current    && !addRef.current.contains(e.target as Node))    setAddOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* filtered rows */
  const filtered = INITIAL_ROOMS.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.roomNo.includes(q) ||
      r.member?.name.toLowerCase().includes(q) ||
      r.member?.email.toLowerCase().includes(q);
    const matchFloor  = floorFilter  === 'All Floors'        || r.floor   === floorFilter;
    const matchType   = typeFilter   === 'Room Type'          || r.type    === typeFilter;
    const matchStatus = statusFilter === 'Occupancy Status'   || r.status  === statusFilter;
    return matchSearch && matchFloor && matchType && matchStatus;
  });

  const NAV_TABS = ['Dashboard', 'Properties', 'Reservations', 'Billing', 'Members', 'Maintenance'];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if      (tab === 'Dashboard')    router.push('/admin');
    else if (tab === 'Reservations') router.push('/admin/reservations');
    else if (tab === 'Billing')      router.push('/admin/billing');
    else if (tab === 'Members')      router.push('/admin/members');
    else if (tab === 'Maintenance')  router.push('/admin/maintenance');
    else showToast(`Viewing ${tab}`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-blue-500 selection:text-white">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-100 shadow-xl rounded-2xl p-4 max-w-xs flex items-center gap-3 border-l-4 border-l-blue-900 animate-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-blue-900 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 flex-grow">{toast.msg}</p>
          <button type="button" onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ── Add Resident Modal ── */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Resident</h3>
              <button type="button" onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!newName.trim()) { showToast('Please enter a name.', 'error'); return; } showToast(`${newName} added to Room ${newRoom}!`); setAddModal(false); setNewName(''); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Resident Full Name</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter full name" className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign Room</label>
                <select value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  <option value="101">Room 101 – Deluxe Suite ($1,200)</option>
                  <option value="205">Room 205 – Single Studio ($850)</option>
                  <option value="104">Room 104 – Deluxe Suite ($1,200)</option>
                  <option value="302">Room 302 – Shared Dorm ($550)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 cursor-pointer rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer transition-all">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ NAV BAR ══════════════════ */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 shadow-xs z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Logo size={28} />
            <span className="text-base font-extrabold text-blue-900 tracking-tight whitespace-nowrap">SmartStay Admin</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer relative ${
                    isActive
                      ? 'text-blue-900 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-blue-900 after:rounded-full'
                      : 'text-slate-500 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => showToast('3 unread notifications', 'info')} className="relative p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl cursor-pointer transition-all">
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
            <button type="button" onClick={() => showToast('Opening system settings…', 'info')} className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl cursor-pointer transition-all">
              <Settings className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <span className="text-sm font-bold text-slate-700 hidden lg:block">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════ MAIN ══════════════════ */}
      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rooms &amp; Members</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium max-w-xl">
              Manage occupancy, room details, and tenant records across all properties.
            </p>
          </div>

          {/* Add New dropdown */}
          <div className="relative shrink-0" ref={addRef}>
            <button
              type="button"
              onClick={() => setAddOpen((o) => !o)}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/15 transition-all cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add New
              <ChevronDown className="w-4 h-4 stroke-[2]" />
            </button>
            {addOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-lg p-1.5 z-30">
                {[
                  { label: 'Add New Room',      icon: Plus },
                  { label: 'Add New Resident',  icon: UserPlus },
                  { label: 'Generate Report',   icon: Copy },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setAddOpen(false);
                      if (label === 'Add New Resident') { setAddModal(true); }
                      else showToast(`${label}…`, 'info');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-900 hover:bg-slate-50 rounded-xl cursor-pointer transition-all"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Search & Filter Card ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4 mb-5 flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-grow min-w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member name, room number, or email..."
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-blue-900 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all"
            />
          </div>

          {/* Floor dropdown */}
          <DropdownFilter
            ref={floorRef}
            label={floorFilter}
            open={floorOpen}
            setOpen={setFloorOpen}
            options={['All Floors', 'Floor 1', 'Floor 2', 'Floor 3']}
            onSelect={(v) => { setFloorFilter(v); setFloorOpen(false); }}
          />

          {/* Type dropdown */}
          <DropdownFilter
            ref={typeRef}
            label={typeFilter}
            open={typeOpen}
            setOpen={setTypeOpen}
            options={['Room Type', 'Deluxe Suite', 'Single Studio', 'Shared Dorm']}
            onSelect={(v) => { setTypeFilter(v); setTypeOpen(false); }}
          />

          {/* Status dropdown */}
          <DropdownFilter
            ref={statusRef}
            label={statusFilter}
            open={statusOpen}
            setOpen={setStatusOpen}
            options={['Occupancy Status', 'Active Member', 'Empty Room', 'Past Member']}
            onSelect={(v) => { setStatusFilter(v); setStatusOpen(false); }}
          />

          {/* More Filters */}
          <button
            type="button"
            onClick={() => showToast('Opening advanced filters panel…', 'info')}
            className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ml-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            More Filters
          </button>
        </div>

        {/* ── Data Table Card ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              {/* Head */}
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Room No.', 'Floor', 'Room Type', 'Price', 'Member Name', 'Contact Info', 'Lease Start', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-14 text-sm text-slate-400 font-semibold">
                      No rooms match your filters.
                    </td>
                  </tr>
                )}

                {filtered.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/60 transition-colors group">

                    {/* Room No */}
                    <td className="px-5 py-4 font-extrabold text-slate-800 text-sm">{room.roomNo}</td>

                    {/* Floor */}
                    <td className="px-5 py-4 text-slate-500 text-sm font-medium">{room.floor}</td>

                    {/* Type */}
                    <td className="px-5 py-4 text-slate-700 text-sm font-semibold">{room.type}</td>

                    {/* Price */}
                    <td className="px-5 py-4 text-slate-800 text-sm font-extrabold">{room.price}</td>

                    {/* Member Name */}
                    <td className="px-5 py-4">
                      {room.member ? (
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${room.color} text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-sm`}>
                            {room.member.initials}
                          </div>
                          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{room.member.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-lg leading-none">—</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 text-slate-500 text-sm font-medium">
                      {room.member?.email ?? <span className="text-slate-300 font-bold text-lg leading-none">—</span>}
                    </td>

                    {/* Lease Start */}
                    <td className="px-5 py-4 text-slate-500 text-sm font-medium whitespace-nowrap">
                      {room.member?.leaseStart ?? <span className="text-slate-300 font-bold text-lg leading-none">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[room.status]}`}>
                        {room.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {room.status === 'Active Member' && (
                          <>
                            <ActionBtn icon={Pencil}         tip="Edit room"           onClick={() => showToast(`Editing Room ${room.roomNo}…`, 'info')} />
                            <ActionBtn icon={ArrowLeftRight} tip="Transfer member"     onClick={() => showToast(`Transferring ${room.member?.name}…`, 'info')} />
                            <ActionBtn icon={UserMinus}      tip="Remove member"       onClick={() => showToast(`Removing ${room.member?.name}…`, 'info')} color="text-rose-400 hover:text-rose-600 hover:bg-rose-50" />
                          </>
                        )}
                        {room.status === 'Empty Room' && (
                          <>
                            <ActionBtn icon={Pencil}   tip="Edit room"     onClick={() => showToast(`Editing Room ${room.roomNo}…`, 'info')} />
                            <ActionBtn icon={Copy}     tip="Duplicate"     onClick={() => showToast(`Duplicating Room ${room.roomNo}…`, 'info')} />
                            <ActionBtn icon={UserPlus} tip="Assign member" onClick={() => setAddModal(true)} color="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" />
                          </>
                        )}
                        {room.status === 'Past Member' && (
                          <>
                            <ActionBtn icon={History}    tip="View history" onClick={() => showToast(`Opening history for Room ${room.roomNo}…`, 'info')} />
                            <ActionBtn icon={RotateCcw}  tip="Reinstate"    onClick={() => showToast(`Reinstating ${room.member?.name}…`, 'info')} color="text-orange-400 hover:text-orange-600 hover:bg-orange-50" />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Table Footer / Pagination ── */}
          <div className="border-t border-slate-100 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400">
              Showing 1–10 of 248 entries
            </p>
            <div className="flex items-center gap-1.5">
              <PagBtn icon={ChevronLeft}  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    page === n
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {n}
                </button>
              ))}
              <PagBtn icon={ChevronRight} onClick={() => setPage((p) => Math.min(3, p + 1))} disabled={page === 3} />
            </div>
          </div>
        </div>
      </main>

      {/* ══════════════════ PAGE FOOTER ══════════════════ */}
      <footer className="bg-white border-t border-slate-100 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="font-extrabold text-slate-700">SmartStay Management Systems</p>

          <div className="flex items-center gap-5">
            {['Support', 'Privacy Policy', 'Terms of Service', 'API Docs'].map((link) => (
              <a key={link} href="#" onClick={(e) => { e.preventDefault(); showToast(`Opening ${link}…`, 'info'); }} className="font-semibold text-slate-500 hover:text-blue-900 transition-colors">
                {link}
              </a>
            ))}
          </div>

          <p className="text-slate-400 font-medium text-right">
            &copy; 2024 SmartStay Management Systems. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

/* ─────────────────────────── small sub-components ─────────────────────────── */

interface DropdownFilterProps {
  label: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  options: string[];
  onSelect: (v: string) => void;
}

const DropdownFilter = React.forwardRef<HTMLDivElement, DropdownFilterProps>(
  ({ label, open, setOpen, options, onSelect }, ref) => (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
      >
        {label}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-30 p-1">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg font-medium transition-all cursor-pointer ${
                label === opt ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
);
DropdownFilter.displayName = 'DropdownFilter';

interface ActionBtnProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  tip: string;
  onClick: () => void;
  color?: string;
}

function ActionBtn({ icon: Icon, tip, onClick, color = 'text-slate-400 hover:text-blue-900 hover:bg-blue-50' }: ActionBtnProps) {
  return (
    <button
      type="button"
      title={tip}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all cursor-pointer ${color}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

interface PagBtnProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  disabled?: boolean;
}

function PagBtn({ icon: Icon, onClick, disabled }: PagBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        disabled ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 cursor-pointer'
      }`}
    >
      <Icon className="w-4 h-4 stroke-[2]" />
    </button>
  );
}
