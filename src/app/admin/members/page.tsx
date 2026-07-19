// @ts-nocheck
"use client";
import { getAdminMembers, updateAdminMember, deleteAdminMember } from '@/app/actions/members';
import { getAdminRooms } from '@/app/actions/properties';
import { getMemberInvoices, generateMemberInvoice } from '@/app/actions/billing';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings, Search, Filter, ChevronDown,
  ChevronLeft, ChevronRight, Download, UserPlus,
  Check, X, ExternalLink,
} from 'lucide-react';
import Logo from '@/components/Logo';
import AdminNavbar from '@/components/AdminNavbar';

/* ─── types ─── */
type MemberStatus = 'Active' | 'Pending' | 'Past Member';

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
// Fetched dynamically

const STATUS_STYLES: Record<MemberStatus, string> = {
  'Active':       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Pending':      'bg-orange-50  text-orange-600  border border-orange-200',
  'Past Member':  'bg-slate-100 dark:bg-slate-800  text-slate-500 dark:text-slate-400 dark:text-slate-500   border border-slate-200 dark:border-slate-700',
};

const STATUS_DOT: Record<MemberStatus, string> = {
  'Active':       'bg-emerald-500',
  'Pending':      'bg-orange-500',
  'Past Member':  'bg-slate-400',
};

/* ══════════════════════════════════════════════════════ */
export default function MembersPage() {
  const router = useRouter();

  const [membersList, setMembersList] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminMembers(), getAdminRooms()]).then(([membersRes, roomsRes]) => {
      if(membersRes.success && membersRes.data) setMembersList(membersRes.data);
      if(roomsRes.success && roomsRes.data) setAllRooms(roomsRes.data);
      setIsLoading(false);
    });
  }, []);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    
    // Optimistic update
    setMembersList(membersList.map(m => m.id === selectedMember.id ? { ...m, ...editForm } : m));
    setSelectedMember({ ...selectedMember, ...editForm }); // update drawer view
    setEditModalOpen(false);
    
    // Backend update
    const res = await updateAdminMember(selectedMember.id, editForm);
    if (res.success) {
      showToast(`Updated profile for ${editForm.name}`);
    } else {
      showToast(`Failed to update profile for ${editForm.name}`, 'error');
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    if (window.confirm(`Are you sure you want to delete ${selectedMember.name}?`)) {
      // Optimistic delete
      setMembersList(membersList.filter(m => m.id !== selectedMember.id));
      setSelectedMember(null);
      
      // Backend delete
      const res = await deleteAdminMember(selectedMember.id);
      if (res.success) {
        showToast(`${selectedMember.name} has been deleted.`);
      } else {
        showToast(`Failed to delete ${selectedMember.name}`, 'error');
      }
    }
  };

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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsOpen, setRowsOpen] = useState(false);
  const rowsRef = useRef<HTMLDivElement>(null);

  /* add resident modal */
  const [addModal, setAddModal]     = useState(false);
  const [newName, setNewName]       = useState('');
  const [newEmail, setNewEmail]     = useState('');
  const [newRoom, setNewRoom]       = useState('101');
  const modalRef = useRef<HTMLDivElement>(null);

  /* detail drawer */
  const [selectedMember, setSelectedMember] = useState<any>(null);

/* ─── edit member modal ─── */
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', room: '', status: '' });

  /* full profile modal */
  const [fullProfileOpen, setFullProfileOpen] = useState(false);
  const [memberInvoices, setMemberInvoices] = useState<any[]>([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  /* notifications */
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Booking Request', message: 'Jane Doe requested Room 201.', time: '5m ago', unread: true },
    { id: 2, title: 'Maintenance Alert', message: 'AC broken in Room 305.', time: '1h ago', unread: true },
    { id: 3, title: 'Payment Received', message: 'John Smith paid Rp 1.400.000.', time: '2h ago', unread: false },
  ]);
  const notifRef = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (floorRef.current  && !floorRef.current.contains(e.target as Node))  setFloorOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
      if (rowsRef.current   && !rowsRef.current.contains(e.target as Node))   setRowsOpen(false);
      if (modalRef.current  && !modalRef.current.contains(e.target as Node))  setAddModal(false);
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
        setEditModalOpen(false);
        setFullProfileOpen(false);
        setAddModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (fullProfileOpen && selectedMember) {
      getMemberInvoices(selectedMember.id).then(res => {
        if (res.success && res.data) {
          setMemberInvoices(res.data);
        }
      });
    }
  }, [fullProfileOpen, selectedMember]);

  /* filtered members */
  const filtered = membersList.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.room.toLowerCase().includes(q) || m.stId.toLowerCase().includes(q);
    const matchFloor  = floorFilter  === 'All Floors' || m.floor === floorFilter;
    const matchStatus = statusFilter === 'All Status'  || m.status === statusFilter;
    return matchQ && matchFloor && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedMembers = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-blue-900 dark:text-blue-500 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 dark:border-blue-900 dark:border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-bold animate-pulse">Loading directory...</p>
      </div>
    </div>
  );

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

      {/* ── Add Resident Modal ── */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div ref={modalRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Resident</h3>
              <button type="button" onClick={() => setAddModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!newName.trim() || !newEmail.trim()) { showToast('Please fill all fields.'); return; } showToast(`${newName} added to ${newRoom}!`); setAddModal(false); setNewName(''); setNewEmail(''); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter full name" className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter email" className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Assign Room</label>
                <select value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  <option value="101">Room 101 – Deluxe Suite (Floor 1)</option>
                  <option value="215">Room 215 – Studio (Floor 2)</option>
                  <option value="303">Room 303 – Shared Dorm (Floor 3)</option>
                  <option value="402B">Room 402B – Executive (Floor 4)</option>
                  <option value="501">Room 501 – Penthouse (Floor 5)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950">Cancel</button>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-orange-500/15">Add Resident</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Member Modal ── */}
      {editModalOpen && selectedMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Member</h3>
              <button type="button" onClick={() => setEditModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input type="email" required value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <input type="text" required value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none dark:bg-slate-950 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room</label>
                  <select 
                    value={editForm.room} 
                    onChange={(e) => setEditForm({...editForm, room: e.target.value})} 
                    className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none dark:bg-slate-950 dark:text-white"
                  >
                    <option value="" disabled>Select Room</option>
                    {allRooms.map((r: any) => (
                      <option key={r.id} value={r.roomNo}>
                        Room {r.roomNo} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none dark:bg-slate-950 dark:text-white">
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Past Member">Past Member</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Full Profile Modal ── */}
      {fullProfileOpen && selectedMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95">
            <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-5">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-md" />
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedMember.name}</h2>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">{selectedMember.stId} • Room {selectedMember.room}</p>
                  <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[selectedMember.status]}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setFullProfileOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-800 p-2 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Contact Info</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedMember.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedMember.phone}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Emergency Contact</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedMember.emergencyContact || 'Jane Doe (+1 555-9999)'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Contract Details</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Join Date</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedMember.joinDate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lease End</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedMember.leaseEnd || '2024-12-31'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Balance</span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">Rp 0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ── Billing & Invoices Section ── */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Billing & Invoices</h4>
                <button 
                  type="button" 
                  onClick={async () => {
                    setIsGeneratingInvoice(true);
                    showToast('Generating invoice...');
                    const res = await generateMemberInvoice(selectedMember.id);
                    setIsGeneratingInvoice(false);
                    if (res.success && res.redirect_url) {
                      navigator.clipboard.writeText(res.redirect_url);
                      showToast('Invoice generated & link copied!');
                      // refresh invoices
                      const invRes = await getMemberInvoices(selectedMember.id);
                      if(invRes.success && invRes.data) setMemberInvoices(invRes.data);
                    } else {
                      showToast(res.error || res.warning || 'Failed', 'error');
                    }
                  }}
                  disabled={isGeneratingInvoice}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">+</span>
                  Generate Invoice
                </button>
              </div>
              
              {memberInvoices.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">No invoices found for this member.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {memberInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Inv #{inv.id}</p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{inv.billingMonth} • Due {inv.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-extrabold text-blue-900 dark:text-blue-400">Rp {Number(inv.amount).toLocaleString('id-ID')}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                          inv.status === 'overdue' ? 'bg-rose-50 text-rose-700' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                        {inv.gatewayReference && inv.status !== 'paid' && (
                          <button type="button" onClick={() => {
                            navigator.clipboard.writeText(inv.gatewayReference);
                            showToast('Payment link copied!');
                          }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Copy Payment Link">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="button" onClick={() => setFullProfileOpen(false)} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-all cursor-pointer">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Member Detail Side Drawer ── */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setSelectedMember(null)} />
          <aside className="relative w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Member Details</h3>
              <button type="button" onClick={() => setSelectedMember(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm" />
                <div>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">{selectedMember.name}</p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">{selectedMember.stId}</p>
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
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2">
                <button type="button" onClick={() => setFullProfileOpen(true)} className="w-full bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">
                  Full Profile
                </button>
                <button type="button" onClick={() => { 
                  setEditForm({ name: selectedMember.name, email: selectedMember.email, phone: selectedMember.phone, room: selectedMember.room, status: selectedMember.status });
                  setEditModalOpen(true);
                }} className="w-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">
                  Edit Member
                </button>
                <button type="button" onClick={handleDeleteMember} className="w-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-all">
                  Delete Member
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ══════ NAV BAR ══════ */}
      <AdminNavbar activeTab="Members" />


      {/* ══════ MAIN ══════ */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-5">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">Members Directory</h1>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 text-sm font-medium">
              Manage all {membersList.length} residents across your properties.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => showToast('Exporting member data as CSV…')}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs">
              <Download className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" />
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3 shadow-xs">
          {/* Left: filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400 dark:text-slate-500"
              />
            </div>
            
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />

            {/* Floor dropdown */}
            <div className="relative" ref={floorRef}>
              <button type="button" onClick={() => setFloorOpen((o) => !o)}
                className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                {floorFilter} <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </button>
              {floorOpen && (
                <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-30 p-1">
                  {['All Floors', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'].map((opt) => (
                    <button key={opt} type="button" onClick={() => { setFloorFilter(opt); setPage(1); setFloorOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${floorFilter === opt ? 'bg-blue-50 text-blue-900' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status dropdown */}
            <div className="relative" ref={statusRef}>
              <button type="button" onClick={() => setStatusOpen((o) => !o)}
                className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                {statusFilter} <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </button>
              {statusOpen && (
                <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-30 p-1">
                  {['All Status', 'Active', 'Pending', 'Past Member'].map((opt) => (
                    <button key={opt} type="button" onClick={() => { setStatusFilter(opt); setPage(1); setStatusOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${statusFilter === opt ? 'bg-blue-50 text-blue-900' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950'}`}>
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
          <p className="ml-auto text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
            Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} – {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} members
          </p>
        </div>

        {/* ── Members Table ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Resident', 'Room', 'Contact', 'Status', 'Join Date', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap bg-slate-50/80">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-sm text-slate-400 dark:text-slate-500 font-semibold">
                      No members match your search or filters.
                    </td>
                  </tr>
                )}
                {paginatedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">

                    {/* Resident */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-xs shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{m.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">ID: {m.stId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight">{m.room}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{m.floor}</p>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-tight">{m.email}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{m.phone}</p>
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
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 whitespace-nowrap">{m.joinDate}</span>
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
          <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between gap-3">
            {/* Rows per page */}
            <div className="relative flex items-center gap-2" ref={rowsRef}>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Rows per page:</span>
              <button type="button" onClick={() => setRowsOpen((o) => !o)}
                className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all">
                {rowsPerPage} <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </button>
              {rowsOpen && (
                <div className="absolute bottom-full left-14 mb-1 w-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-30 p-1">
                  {[5, 10, 20, 50].map((n) => (
                    <button key={n} type="button" onClick={() => { setRowsPerPage(n); setPage(1); setRowsOpen(false); showToast(`Showing ${n} rows per page`); }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${rowsPerPage === n ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} – {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
              </span>
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className={`p-1.5 rounded-lg transition-all ${page === 1 ? 'text-slate-200 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'}`}>
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                className={`p-1.5 rounded-lg transition-all ${page === totalPages || totalPages === 0 ? 'text-slate-200 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'}`}>
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

      {/* ── View All Notifications Drawer ── */}
      {viewAllOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setViewAllOpen(false)} />
          <aside className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full animate-in slide-in-from-right">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">All Notifications History</h3>
              <button type="button" onClick={() => setViewAllOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-5 border-b border-slate-50 dark:border-slate-800 ${notif.unread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm ${notif.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>{notif.title}</h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap ml-4">{notif.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-10 text-center text-slate-500 dark:text-slate-400 font-semibold">No notification history.</div>
              )}
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
