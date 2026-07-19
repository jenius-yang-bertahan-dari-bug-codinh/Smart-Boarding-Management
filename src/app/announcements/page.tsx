"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  Megaphone, 
  Settings, 
  HelpCircle, 
  LogOut, 
  MoreVertical,
  ChevronRight,
  FileText,
  Users,
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';
import Logo from '@/components/Logo';
import MemberSidebar from '@/components/MemberSidebar';
import MemberCalendarModal from '@/components/MemberCalendarModal';
import HouseRulesModal from '@/components/HouseRulesModal';
import LeaseAgreementModal from '@/components/LeaseAgreementModal';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Document Management State (integrated with admin updates)
  const [docs, setDocs] = useState<{
    leaseAgreement: { name: string; size: string; date: string; url: string } | null;
    houseRules: { name: string; size: string; date: string; url: string } | null;
  }>({
    leaseAgreement: { name: 'lease-agreement-v2.pdf', size: '2.4 MB', date: '2024-07-01', url: '/lease-agreement.pdf' },
    houseRules: { name: 'house-rules-official.pdf', size: '1.8 MB', date: '2024-06-15', url: '/house-rules.pdf' },
  });
  const [isHouseRulesOpen, setIsHouseRulesOpen] = useState(false);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);

  const openDocument = (docUrl: string, fileName: string) => {
    if (!docUrl) return;
    if (docUrl.startsWith('data:')) {
      try {
        const arr = docUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (e) {
        const link = document.createElement('a');
        link.href = docUrl;
        link.download = fileName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      window.open(docUrl, '_blank');
    }
  };

  const fetchAnnouncements = () => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data.announcements || []);
        setUser(data.user);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();

    const loadDocs = () => {
      try {
        const savedDocs = localStorage.getItem('papikost_admin_docs');
        if (savedDocs) {
          setDocs(JSON.parse(savedDocs));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadDocs();
    window.addEventListener('storage', loadDocs);
    window.addEventListener('papikost_docs_changed', loadDocs);
    return () => {
      window.removeEventListener('storage', loadDocs);
      window.removeEventListener('papikost_docs_changed', loadDocs);
    };
  }, []);

  const filteredAnnouncements = announcements.filter((ann) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (ann.title && ann.title.toLowerCase().includes(q)) ||
      (ann.body && ann.body.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans font-semibold text-slate-500">Loading announcements...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Left-Side Navigation Sidebar */}
      <MemberSidebar activeTab="Announcements" user={user} onRefresh={fetchAnnouncements} />

      {/* Main Right-Side Announcements Area */}
      <section className="flex-grow p-6 sm:p-8 lg:p-10 overflow-y-auto">
        
        {/* Header Block with filter/post actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Board
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">
              Stay updated with building operations and announcements.
            </p>
          </div>
          
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium shadow-xs"
            />
          </div>
        </div>

        {/* Two-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Recent Announcements (Megaphone) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Megaphone */}
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-5 h-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-800">
                Recent Announcements
              </h2>
            </div>

            {filteredAnnouncements.map((ann, idx) => (
              <div key={ann.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      Notice
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Valid until {new Date(ann.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-3.5">
                  {ann.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5 mb-4 whitespace-pre-wrap">
                  {ann.body}
                </p>
                <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                    Mgmt
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Building Management
                  </span>
                </div>
              </div>
            ))}
            {filteredAnnouncements.length === 0 && (
              <div className="py-10 text-center bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-slate-700 text-sm font-bold">
                  {searchQuery ? `No announcements matching "${searchQuery}"` : 'No announcements available.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Maintenance & Resources */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Maintenance Section Header */}
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-slate-800">
                Maintenance Schedule
              </h2>
            </div>

            {/* Schedule Timeline Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  {user?.memberProfile?.room ? `Room ${user.memberProfile.room.room_number} & Building` : 'All Schedule'}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Active Feed
                </span>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                {/* Event 1 (Personalized or Unit Priority) */}
                <div className="pt-0 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-amber-800 block">
                      Jul 20th • {user?.memberProfile?.room ? `Room ${user.memberProfile.room.room_number}` : 'Unit Inspection'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      AC Unit &amp; Filter Deep Servicing
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      10:00 AM - 11:30 AM
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
                    My Room
                  </span>
                </div>

                {/* Event 2 (Personalized or Unit Priority) */}
                {user?.memberProfile?.complaints && user.memberProfile.complaints.length > 0 ? (
                  <div className="pt-4 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-amber-800 block">
                        Scheduled • {user.memberProfile.room ? `Room ${user.memberProfile.room.room_number}` : 'Unit Ticket'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                        {user.memberProfile.complaints[0].category} ({user.memberProfile.complaints[0].status})
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 line-clamp-1">
                        {user.memberProfile.complaints[0].description}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
                      My Room
                    </span>
                  </div>
                ) : (
                  <div className="pt-4 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-blue-900 block">
                        Jul 22nd • Common Area
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                        Elevator B Safety Inspection
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        08:00 AM - 12:00 PM
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                      Building
                    </span>
                  </div>
                )}

                {/* Event 3 (General Building) */}
                <div className="pt-4 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-blue-900 block">
                      Jul 25th • Facade
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      Exterior Glass Pressure Washing
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      09:00 AM - 04:00 PM
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                    Building
                  </span>
                </div>
              </div>

              {/* View Full Calendar link */}
              <button 
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className="w-full text-center text-xs font-extrabold text-blue-600 hover:text-blue-800 hover:underline pt-3 border-t border-slate-100 block cursor-pointer tracking-wider"
              >
                VIEW FULL CALENDAR ({user?.memberProfile?.room ? `Room ${user.memberProfile.room.room_number}` : 'All'})
              </button>
            </div>

            {/* Resources Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 tracking-wider mb-4 uppercase">
                Building Resources
              </h3>
              
              {docs.houseRules || docs.leaseAgreement ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* House Rules Button */}
                  {docs.houseRules && (
                    <button
                      type="button"
                      onClick={() => {
                        if (docs.houseRules && docs.houseRules.url && docs.houseRules.url !== '/house-rules.pdf') {
                          openDocument(docs.houseRules.url, docs.houseRules.name);
                        } else {
                          setIsHouseRulesOpen(true);
                        }
                      }}
                      className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-slate-50/20 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-center transition-all group"
                    >
                      <FileText className="w-5.5 h-5.5 text-slate-500 mb-1.5 group-hover:scale-105 transition-transform" />
                      <span className="text-xs font-bold text-slate-700">House Rules</span>
                    </button>
                  )}

                  {/* Lease Agreement Button */}
                  {docs.leaseAgreement && (
                    <button
                      type="button"
                      onClick={() => {
                        if (docs.leaseAgreement && docs.leaseAgreement.url && docs.leaseAgreement.url !== '/lease-agreement.pdf') {
                          openDocument(docs.leaseAgreement.url, docs.leaseAgreement.name);
                        } else {
                          setIsLeaseModalOpen(true);
                        }
                      }}
                      className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-slate-50/20 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-center transition-all group"
                    >
                      <FileText className="w-5.5 h-5.5 text-slate-500 mb-1.5 group-hover:scale-105 transition-transform" />
                      <span className="text-xs font-bold text-slate-700">Lease Agreement</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-semibold">
                    No active documents published by property management.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </section>

      {/* Interactive Personalized Member Calendar Modal */}
      <MemberCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        user={user}
      />

      {/* House Rules Interactive Modal */}
      <HouseRulesModal
        isOpen={isHouseRulesOpen}
        onClose={() => setIsHouseRulesOpen(false)}
      />

      {/* Lease Agreement Interactive Modal */}
      <LeaseAgreementModal
        isOpen={isLeaseModalOpen}
        onClose={() => setIsLeaseModalOpen(false)}
        user={user}
      />
    </main>
  );
}
