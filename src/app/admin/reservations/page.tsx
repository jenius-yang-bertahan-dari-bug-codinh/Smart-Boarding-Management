// @ts-nocheck
"use client";
import { getAdminReservations, updateReservationStatus, createReservation } from '@/app/actions/reservations';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings, Search, ChevronLeft, ChevronRight,
  Plus, Filter, Download, MoreVertical, Check, X,
  Calendar, ArrowUpRight, Eye, UserCheck,
} from 'lucide-react';
import Logo from '@/components/Logo';

/* ─── types ─── */
type ResvStatus = 'Confirmed' | 'Pending' | 'Cancelled';

interface Reservation {
  id: string;
  tenant: string;
  initials: string;
  color: string;
  room: string;
  term: string;
  amount: string;
  status: ResvStatus;
}

/* ─── static data ─── */
// RESERVATIONS fetched dynamically

const STATUS_STYLES: Record<ResvStatus, string> = {
  Confirmed:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Pending:    'bg-orange-50  text-orange-600  border border-orange-200',
  Cancelled:  'bg-rose-50    text-rose-600    border border-rose-200',
};

/* ─── October 2024 calendar data ─── */
// Oct 2024: starts Tuesday (index 2)
const OCT_WEEKS = [
  [ {d:29,prev:true},{d:30,prev:true},{d:1},{d:2},{d:3},{d:4},{d:5} ],
  [ {d:6},{d:7},{d:8},{d:9},{d:10},{d:11},{d:12} ],
  [ {d:13},{d:14},{d:15},{d:16},{d:17},{d:18},{d:19} ],
  [ {d:20},{d:21},{d:22},{d:23},{d:24},{d:25},{d:26} ],
  [ {d:27},{d:28},{d:29},{d:30},{d:31},{d:null as unknown as number},{d:null as unknown as number} ],
] as { d: number | null; prev?: boolean }[][];

type CalEvent = { day: number; label: string; variant: 'blue' | 'orange' | 'red' };
const CAL_EVENTS: CalEvent[] = [
  { day: 1,  label: 'Check-in: R-102',   variant: 'blue'   },
  { day: 4,  label: 'Check-out: R-305',  variant: 'orange' },
  { day: 6,  label: 'Check-in: R-101',   variant: 'blue'   },
  { day: 6,  label: 'Late check-in',     variant: 'red'    },
];

/* ══════════════════════════════════════════════════════════ */
export default function ReservationsPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getAdminReservations().then(res => {
      if(res.success && res.data) {
        if (res.rooms) {
          setAvailableRooms(res.rooms);
          if (res.rooms.length > 0) setBRoom(res.rooms[0].room_number);
        }
        setReservations(res.data);
        const pending = res.data.filter((r: any) => r.status === 'Pending').map((r: any) => ({
          id: r.id,
          rawId: r.rawId,
          name: r.tenant,
          initials: r.initials,
          color: r.color,
          unit: r.room,
          price: r.amount,
          date: r.term,
          approved: false
        }));
        setApprovals(pending);
      }
      setIsLoading(false);
    });
  }, []);


  const [activeTab, setActiveTab] = useState('Reservations');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ start: '2024-10-01', end: '2024-10-31' });
  const [statusFilter, setStatusFilter] = useState('All');

  const showToast = (msg: string) => { setToast({ msg }); setTimeout(() => setToast(null), 3200); };

  const handleUpdateStatus = async (rawId: number, status: string) => {
    const res = await updateReservationStatus(rawId, status);
    if(res.success) {
      showToast('Status updated successfully!');
      getAdminReservations().then(r => {
        if(r.success && r.data) setReservations(r.data);
      });
    } else {
      showToast('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    if (!reservations.length) {
      showToast('No reservations to export');
      return;
    }
    const headers = ['Reservation ID', 'Tenant Name', 'Room #', 'Lease Term', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...reservations.map(r => 
        [r.id, `"${r.tenant}"`, `"${r.room}"`, `"${r.term}"`, `"${r.amount}"`, r.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservations_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exporting CSV...');
  };

  const filteredReservations = reservations.filter(r => statusFilter === 'All' || r.status === statusFilter);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleCreateBooking = async (formData: FormData) => {
    const res = await createReservation(formData);
    if(res.success) {
      showToast('Booking created successfully!');
      setBookingModal(false);
      getAdminReservations().then(r => {
        if(r.success && r.data) {
          if (r.rooms) setAvailableRooms(r.rooms);
          setReservations(r.data);
          const pending = r.data.filter((rItem: any) => rItem.status === 'Pending').map((rItem: any) => ({
            id: rItem.id,
            rawId: rItem.rawId,
            name: rItem.tenant,
            initials: rItem.initials,
            color: rItem.color,
            unit: rItem.room,
            price: rItem.amount,
            date: rItem.term,
            approved: false
          }));
          setApprovals(pending);
        }
      });
    } else {
      showToast('Failed to create booking: ' + res.error);
    }
  };

  const handleApprove = async (id: number) => {
    // This is called from the Pending Approvals sidebar
    // We reuse handleUpdateStatus to properly update the DB
    await handleUpdateStatus(id, 'active');
  };

  const NAV_TABS = ['Dashboard', 'Properties', 'Reservations', 'Billing', 'Members', 'Maintenance'];
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if      (tab === 'Dashboard')    router.push('/admin');
    else if (tab === 'Properties')   router.push('/admin/properties');
    else if (tab === 'Billing')      router.push('/admin/billing');
    else if (tab === 'Members')      router.push('/admin/members');
    else if (tab === 'Maintenance')  router.push('/admin/maintenance');
    else showToast(`Viewing ${tab}`);
  };

  /* close booking modal on outside click */
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setBookingModal(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* booking form state */
  const [bTenant, setBTenant] = useState('');
  const [bRoom,   setBRoom]   = useState('101');

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-blue-500 selection:text-white">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-l-4 border-l-blue-900 border border-slate-100 shadow-xl rounded-2xl px-4 py-3 max-w-xs flex items-center gap-3">
          <Check className="w-4 h-4 text-blue-900 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 flex-grow">{toast.msg}</p>
          <button type="button" onClick={() => setToast(null)}><X className="w-3.5 h-3.5 text-slate-400" /></button>
        </div>
      )}

      {/* ── New Booking Modal ── */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">New Booking</h3>
              <button type="button" onClick={() => setBookingModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form action={handleCreateBooking}>
                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tenant Name</label>
                  <input type="text" name="tenantName" value={bTenant} onChange={(e) => setBTenant(e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900 placeholder:text-slate-300" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Room</label>
                  <select name="roomId" value={bRoom} onChange={(e) => setBRoom(e.target.value)} className="w-full border border-slate-200 focus:border-blue-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {availableRooms.map(r => (
                      <option key={r.id} value={r.room_number}>Room {r.room_number} - {r.type}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Check-in</label>
                    <input type="date" name="checkIn" defaultValue="2024-10-01" required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Check-out</label>
                    <input type="date" name="checkOut" defaultValue="2024-10-31" required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900" />
                  </div>
                </div>
              <div className="flex gap-3 pt-6 justify-end">
                <button type="button" onClick={() => setBookingModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 cursor-pointer rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-orange-500/15">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ NAV BAR ══════ */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 shadow-xs z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Logo size={28} />
            <span className="text-base font-extrabold text-blue-900 tracking-tight whitespace-nowrap">SmartStay</span>
          </Link>

          {/* Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button key={tab} type="button" onClick={() => handleTabClick(tab)}
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => showToast('Searching reservations…')} className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl cursor-pointer">
              <Search className="w-5 h-5 stroke-[2]" />
            </button>
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
      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reservations Management</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Oversee bookings, track occupancy, and manage check-ins.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Date range selector */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-xs">
              <Calendar className="w-4 h-4 text-slate-400 ml-2" />
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                className="text-slate-700 font-semibold text-sm bg-transparent border-none focus:outline-none cursor-pointer w-[120px]"
              />
              <span className="text-slate-300 font-medium">–</span>
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                className="text-slate-700 font-semibold text-sm bg-transparent border-none focus:outline-none cursor-pointer w-[120px]"
              />
            </div>

            {/* New Booking */}
            <button type="button" onClick={() => setBookingModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/15 cursor-pointer transition-all">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Booking
            </button>
          </div>
        </div>

        {/* ── Middle: Calendar + Pending Approvals ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Check-in Schedule Calendar */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Check-in Schedule</h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => showToast('Previous month')} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-sm font-bold text-slate-700">October 2024</span>
                <button type="button" onClick={() => showToast('Next month')} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-hidden rounded-xl border border-slate-100">
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-2 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{d}</div>
                ))}
              </div>

              {/* Weeks */}
              {OCT_WEEKS.map((week, wi) => (
                <div key={wi} className={`grid grid-cols-7 ${wi < OCT_WEEKS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  {week.map((cell, ci) => {
                    const isToday  = cell.d === 6 && !cell.prev;
                    const events   = cell.d !== null && !cell.prev ? CAL_EVENTS.filter((e) => e.day === cell.d) : [];
                    return (
                      <div
                        key={ci}
                        className={`min-h-[72px] p-1.5 border-r border-slate-100 last:border-r-0 relative ${
                          cell.prev || cell.d === null ? 'bg-slate-50/40' : 'bg-white hover:bg-blue-50/20 transition-colors cursor-pointer'
                        } ${isToday ? 'bg-blue-50/30' : ''}`}
                      >
                        {/* Date number */}
                        {cell.d !== null && (
                          <span className={`text-[11px] font-bold block mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-blue-900 text-white'
                              : cell.prev
                              ? 'text-slate-300'
                              : 'text-slate-500'
                          }`}>
                            {cell.d}
                          </span>
                        )}
                        {/* Events */}
                        <div className="space-y-0.5">
                          {events.map((ev, ei) => (
                            <div
                              key={ei}
                              title={ev.label}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate ${
                                ev.variant === 'blue'   ? 'bg-blue-500 text-white' :
                                ev.variant === 'orange' ? 'bg-orange-400 text-white' :
                                                          'bg-rose-500 text-white'
                              }`}
                            >
                              {ev.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4">
              {[
                { color: 'bg-blue-500',   label: 'Check-in'      },
                { color: 'bg-orange-400', label: 'Check-out'     },
                { color: 'bg-rose-500',   label: 'Late Check-in' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                  <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl shadow-xs p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Pending Approvals</h2>
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                {approvals.filter((a) => !a.approved).length} New
              </span>
            </div>

            <div className="space-y-4 flex-grow">
              {approvals.map((a) => (
                <div key={a.id} className={`border rounded-2xl p-4 transition-all ${a.approved ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-white'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${a.color} text-white text-sm font-extrabold flex items-center justify-center shrink-0 shadow-sm`}>
                      {a.initials}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">{a.name}</p>
                        {a.approved
                          ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Approved</span>
                          : <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">New Request</span>
                        }
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{a.unit} &bull; {a.price}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Requested: {a.date}</p>
                    </div>
                  </div>
                  {!a.approved && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleUpdateStatus(a.rawId, 'active')} className="flex-1 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button type="button" onClick={() => showToast(`Viewing details for ${a.name}…`)} className="flex-1 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        Details
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* View All */}
            <div className="text-center mt-5 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => showToast('Opening all reservation requests…')} className="text-blue-700 hover:text-blue-900 text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 mx-auto">
                View All Requests
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* ── All Reservations Table ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-900">All Reservations</h2>
            <div className="flex items-center gap-2">
              <div className="relative inline-flex">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="appearance-none pl-8 pr-8 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-bold rounded-xl cursor-pointer focus:outline-none transition-all">
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronRight className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
              </div>
              <button type="button" onClick={handleExportCSV} className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-all">
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Reservation ID', 'Tenant Name', 'Room #', 'Lease Term', 'Amount', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-blue-900">{r.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${r.color} text-white text-[10px] font-extrabold flex items-center justify-center shrink-0`}>{r.initials}</div>
                        <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{r.tenant}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{r.room}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{r.term}</td>
                    <td className="px-5 py-4 text-sm font-extrabold text-slate-800">{r.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[r.status]}`}>
                        • {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {r.status === 'Pending' && (
                          <>
                            <button type="button" onClick={() => handleUpdateStatus(r.rawId, 'active')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-all" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleUpdateStatus(r.rawId, 'cancelled')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {r.status === 'Confirmed' && (
                          <button type="button" onClick={() => handleUpdateStatus(r.rawId, 'cancelled')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => showToast(`Viewing details for ${r.tenant}…`)} className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg cursor-pointer transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer / pagination */}
          <div className="border-t border-slate-100 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400">Showing {paginatedReservations.length} of {filteredReservations.length} reservations</p>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${page === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'}`}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const n = i + 1;
                return (
                  <button key={n} type="button" onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${page === n ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>{n}</button>
                )
              })}
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${page === totalPages || totalPages === 0 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'}`}>
                Next
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* ══════ GLOBAL FOOTER ══════ */}
      <footer className="bg-white border-t border-slate-100 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={22} />
            <span className="text-sm font-extrabold text-blue-900">SmartStay</span>
          </Link>

          <p className="text-xs text-slate-400 font-medium text-center">
            &copy; 2024 SmartStay Management System. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {['Support', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map((link) => (
              <a key={link} href="#" onClick={(e) => { e.preventDefault(); showToast(`Opening ${link}…`); }} className="text-xs font-semibold text-slate-500 hover:text-blue-900 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
