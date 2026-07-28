// @ts-nocheck
"use client";
import { getAdminReservations, updateReservationStatus, createReservation } from '@/app/actions/reservations';
import { forceCheckout } from '@/app/actions/members';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings, Search, ChevronLeft, ChevronRight,
  Plus, Filter, Download, MoreVertical, Check, X,
  Calendar, ArrowUpRight, Eye, UserCheck, RefreshCcw,
} from 'lucide-react';
import Logo from '@/components/Logo';
import AdminNavbar from '@/components/AdminNavbar';

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



type CalEvent = { day: number; label: string; variant: 'blue' | 'orange' | 'red' };


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
          approved: false,
          type: 'registration'
        }));
        // Add checkout requests
        const checkouts = (res.checkoutRequests || []).map((c: any) => ({
          ...c,
          approved: false,
          type: 'checkout'
        }));
        setApprovals([...checkouts, ...pending]); // checkouts appear first
      }
      setIsLoading(false);
    });
  }, []);


  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);

  const [statusFilter, setStatusFilter] = useState('All');

  // Calendar State and Logic
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Oct 2024 as default to match existing data
  const dynamicEvents = React.useMemo(() => {
    const events: CalEvent[] = [];
    reservations.forEach((r: any) => {
      if (r.status === 'Cancelled') return;

      if (r.rawCheckinDate) {
        const dIn = new Date(r.rawCheckinDate);
        if (dIn.getMonth() === currentMonth.getMonth() && dIn.getFullYear() === currentMonth.getFullYear()) {
          events.push({
            day: dIn.getDate(),
            label: `Check-in: ${r.room.replace('Room ', 'R-')}`,
            variant: 'blue'
          });
        }
      }

      if (r.rawDueDate) {
        const dOut = new Date(r.rawDueDate);
        if (dOut.getMonth() === currentMonth.getMonth() && dOut.getFullYear() === currentMonth.getFullYear()) {
          events.push({
            day: dOut.getDate(),
            label: `Payment Due: ${r.room.replace('Room ', 'R-')}`,
            variant: 'orange'
          });
        }
      }
    });
    return events;
  }, [reservations, currentMonth]);
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getCalendarWeeks = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const prevLastDay = new Date(year, month, 0).getDate();
    
    let days: { d: number | null, prev?: boolean, next?: boolean }[] = [];
    
    // Previous month padding
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ d: prevLastDay - i, prev: true });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ d: i });
    }
    
    // Next month padding
    let nextDays = 1;
    while (days.length % 7 !== 0) {
      days.push({ d: nextDays++, next: true });
    }
    
    // Ensure exactly 5 or 6 weeks depending on the length
    while (days.length < 35) {
      days.push({ d: nextDays++, next: true });
    }
    
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };
  const calendarWeeks = getCalendarWeeks(currentMonth);

  const showToast = (msg: string) => { setToast({ msg }); setTimeout(() => setToast(null), 3200); };

  const handleUpdateStatus = async (rawId: number, status: string) => {
    const res = await updateReservationStatus(rawId, status);
    if(res.success) {
      showToast('Status updated successfully!');
      getAdminReservations().then(r => {
        if(r.success && r.data) {
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
      showToast('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    if (!reservations.length) {
      showToast('No reservations to export');
      return;
    }
    const headers = ['Reservation ID', 'Tenant Name', 'Room #', 'Check-in', 'Check-out', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...reservations.map(r => 
        [r.id, `"${r.tenant}"`, `"${r.room}"`, `"${r.checkinDate}"`, `"${r.checkoutDate}"`, `"${r.amount}"`, r.status].join(',')
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

  const handleExportExcel = async () => {
    if (!reservations.length) {
      showToast('No reservations to export');
      return;
    }
    const XLSX = await import('xlsx');
    const data = reservations.map(r => ({
      'Reservation ID': r.id,
      'Tenant Name': r.tenant,
      'Room #': r.room,
      'Check-in': r.checkinDate,
      'Check-out': r.checkoutDate,
      'Amount': r.amount,
      'Status': r.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservations');
    XLSX.writeFile(workbook, `reservations_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Exporting Excel...');
  };

  const filteredReservations = reservations.filter(r => statusFilter === 'All' || r.status === statusFilter);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate dates
    if (!bCheckIn || !bCheckOut) {
      showToast('Please select both check-in and check-out dates.');
      return;
    }
    if (new Date(bCheckOut) <= new Date(bCheckIn)) {
      showToast('Check-out date must be after check-in date.');
      return;
    }
    const form = e.currentTarget;
    const formData = new FormData(form);
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

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if      (tab === 'Dashboard')    router.push('/admin');
    else if (tab === 'Properties')   router.push('/admin/properties');
    else if (tab === 'Billing')      router.push('/admin/billing');
    else if (tab === 'Members')      router.push('/admin/members');
    else if (tab === 'Maintenance')  router.push('/admin/maintenance');
    else if (tab === 'Landing Page') router.push('/admin/landing-page');
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
  const [bCheckIn,  setBCheckIn]  = useState('');
  const [bCheckOut, setBCheckOut] = useState('');

  /* details modal state */
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col selection:bg-blue-500 selection:text-white">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border-l-4 border-l-blue-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl px-4 py-3 max-w-xs flex items-center gap-3">
          <Check className="w-4 h-4 text-blue-900 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-grow">{toast.msg}</p>
          <button type="button" onClick={() => setToast(null)}><X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /></button>
        </div>
      )}

      {/* ── New Booking Modal ── */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={modalRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">New Booking</h3>
              <button type="button" onClick={() => setBookingModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
        <form onSubmit={handleCreateBooking}>
                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tenant Name</label>
                  <input type="text" name="tenantName" value={bTenant} onChange={(e) => setBTenant(e.target.value)} required className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900 placeholder:text-slate-300" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room</label>
                  <select name="roomId" value={bRoom} onChange={(e) => setBRoom(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {availableRooms.filter(r => r.status === 'Available').map(r => (
                      <option key={r.id} value={r.room_number}>Room {r.room_number} - {r.type}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Check-in</label>
                    <input
                      type="date"
                      name="checkIn"
                      required
                      value={bCheckIn}
                      onChange={(e) => {
                        setBCheckIn(e.target.value);
                        // Reset checkout if it's now invalid
                        if (bCheckOut && e.target.value >= bCheckOut) setBCheckOut('');
                      }}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Check-out</label>
                    <input
                      type="date"
                      name="checkOut"
                      required
                      value={bCheckOut}
                      min={bCheckIn ? (() => { const d = new Date(bCheckIn); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() : ''}
                      onChange={(e) => setBCheckOut(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-900"
                    />
                  </div>
                </div>
              <div className="flex gap-3 pt-6 justify-end">
                <button type="button" onClick={() => setBookingModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950">Cancel</button>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-orange-500/15">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {detailsModalOpen && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" onClick={(e) => { if(e.target === e.currentTarget) setDetailsModalOpen(false); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reservation Details</h3>
              <button type="button" onClick={() => setDetailsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tenant Name</label>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedReservation.name || selectedReservation.tenant}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Room</label>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedReservation.unit || selectedReservation.room}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lease Term</label>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedReservation.date || selectedReservation.term}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</label>
                <p className="text-sm font-extrabold text-blue-900">{selectedReservation.price || selectedReservation.amount}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {selectedReservation.approved ? 'Approved' : (selectedReservation.status || 'Pending Request')}
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="button" onClick={() => setDetailsModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ NAV BAR ══════ */}
      <AdminNavbar activeTab="Reservations" />

      {/* ══════ MAIN ══════ */}
      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reservations Management</h1>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 text-sm font-medium">Oversee bookings, track occupancy, and manage check-ins.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">


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
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Check-in Schedule</h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer text-slate-400 dark:text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer text-slate-400 dark:text-slate-500"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-2 text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{d}</div>
                ))}
              </div>

              {/* Weeks */}
              {calendarWeeks.map((week, wi) => (
                <div key={wi} className={`grid grid-cols-7 ${wi < calendarWeeks.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                  {week.map((cell, ci) => {
                    const today = new Date();
                    const isToday = !cell.prev && !cell.next && cell.d === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
                    // Map dynamic events for the current date cell
                    const events = (!cell.prev && !cell.next) 
                                     ? dynamicEvents.filter((e) => e.day === cell.d) 
                                     : [];
                    return (
                      <div
                        key={ci}
                        className={`min-h-[72px] p-1.5 border-r border-slate-100 dark:border-slate-800 last:border-r-0 relative ${
                          cell.prev || cell.next ? 'bg-slate-50/40' : 'bg-white dark:bg-slate-900 hover:bg-blue-50/20 transition-colors cursor-pointer'
                        } ${isToday ? 'bg-blue-50/30' : ''}`}
                      >
                        {/* Date number */}
                        {cell.d !== null && (
                          <span className={`text-[11px] font-bold block mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-blue-900 text-white'
                              : (cell.prev || cell.next)
                              ? 'text-slate-300'
                              : 'text-slate-500 dark:text-slate-400 dark:text-slate-500'
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
                { color: 'bg-orange-400', label: 'Payment Due'   },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Pending Approvals</h2>
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                {approvals.filter((a) => !a.approved).length} New
              </span>
            </div>

            <div className="space-y-4 flex-grow">
              {approvals.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-semibold">No pending approvals</div>
              )}
              {approvals.map((a) => (
                <div key={a.id} className={`border rounded-2xl p-4 transition-all ${
                  a.approved ? 'border-emerald-100 bg-emerald-50/30' :
                  a.type === 'checkout' ? 'border-rose-200 bg-rose-50/30' :
                  'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${a.color} text-white text-sm font-extrabold flex items-center justify-center shrink-0 shadow-sm`}>
                      {a.initials}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{a.name}</p>
                        {a.approved
                          ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Approved</span>
                          : a.type === 'checkout'
                            ? <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">🚪 Wants to Leave</span>
                            : <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">New Request</span>
                        }
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{a.unit} • {a.price}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        {a.type === 'checkout' ? `Due: ${a.date}` : `Requested: ${a.date}`}
                      </p>
                    </div>
                  </div>
                  {!a.approved && a.type === 'checkout' && (
                    <div className="flex gap-2">
                      <button type="button" onClick={async () => {
                        if (!window.confirm(`Proses check-out untuk ${a.name}? Kamar akan dibebaskan.`)) return;
                        const res = await forceCheckout(String(a.rawId));
                        if (res.success) {
                          setApprovals(prev => prev.filter(x => x.rawId !== a.rawId));
                        }
                      }} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        Process Check-Out
                      </button>
                      <button type="button" onClick={async () => {
                        // Cancel checkout request — restore to active
                        const { updateAdminMember } = await import('@/app/actions/members');
                        await updateAdminMember(String(a.rawId), { name: a.name, phone: '-', email: '', status: 'Active', room: '' });
                        setApprovals(prev => prev.filter(x => x.rawId !== a.rawId));
                      }} className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <X className="w-3.5 h-3.5" />
                        Cancel Request
                      </button>
                    </div>
                  )}
                  {!a.approved && a.type !== 'checkout' && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleUpdateStatus(a.rawId, 'active')} className="flex-1 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button type="button" onClick={() => handleUpdateStatus(a.rawId, 'cancelled')} className="flex-1 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-900/50 text-xs font-bold py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <X className="w-3.5 h-3.5" />
                        Refuse
                      </button>
                      <button type="button" title="Details" onClick={() => { setSelectedReservation(a); setDetailsModalOpen(true); }} className="flex-none px-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <Eye className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>


          </div>

        </div>

        {/* ── All Reservations Table ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">All Reservations</h2>
            <div className="flex items-center gap-2">
              <div className="relative inline-flex">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="appearance-none pl-8 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-bold rounded-xl cursor-pointer focus:outline-none transition-all">
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronRight className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none rotate-90" />
              </div>
              <button type="button" onClick={handleExportCSV} className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-all">
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
              <button type="button" onClick={handleExportExcel} className="flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-all">
                <Download className="w-3.5 h-3.5" />
                Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  {['Reservation ID', 'Tenant Name', 'Room #', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
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
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{r.tenant}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{r.room}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{r.checkinDate}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{r.checkoutDate}</td>
                    <td className="px-5 py-4 text-sm font-extrabold text-slate-800 dark:text-slate-200">{r.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[r.status]}`}>
                        • {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        r.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        r.paymentStatus === 'Unpaid' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                        'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}>
                        {r.paymentStatus}
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
                        {r.status === 'Cancelled' && (
                          <button type="button" onClick={() => handleUpdateStatus(r.rawId, 'pending')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-all" title="Uncancel (Restore to Pending)">
                            <RefreshCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => { setSelectedReservation(r); setDetailsModalOpen(true); }} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg cursor-pointer transition-all">
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
          <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Showing {paginatedReservations.length} of {filteredReservations.length} reservations</p>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${page === 1 ? 'border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 cursor-pointer'}`}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const n = i + 1;
                return (
                  <button key={n} type="button" onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${page === n ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>{n}</button>
                )
              })}
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${page === totalPages || totalPages === 0 ? 'border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 cursor-pointer'}`}>
                Next
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
