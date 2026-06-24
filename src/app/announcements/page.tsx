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
  Sparkles
} from 'lucide-react';
import Logo from '@/components/Logo';
import RoleSwitcher from '@/components/RoleSwitcher';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data.announcements || []);
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans font-semibold text-slate-500">Loading announcements...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Left-Side Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col py-6 px-4 shrink-0 justify-between md:min-h-screen">
        <div>
          {/* Top Brand Section: Logo + Text */}
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <Logo size={32} />
            <span className="text-xl font-bold text-blue-900 tracking-tight">
              SmartStay
            </span>
          </div>

          {/* User Profile Avatar Section */}
          <div className="flex flex-col items-center mb-6 py-4 border-y border-slate-100/60">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
              alt="Alex Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm mb-2"
            />
            <span className="text-xs font-semibold text-slate-400">Welcome back,</span>
            <span className="text-sm font-bold text-blue-900 mt-0.5">{user?.name}</span>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
              Premium Member
            </span>
          </div>

          {/* Vertical Navigation Links */}
          <nav className="space-y-1">
            {/* Overview */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-semibold text-sm transition-all"
            >
              <LayoutDashboard className="w-4.5 h-4.5 stroke-[1.8]" />
              <span>Overview</span>
            </Link>

            {/* Payments */}
            <Link 
              href="/payments" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-semibold text-sm transition-all"
            >
              <CreditCard className="w-4.5 h-4.5 stroke-[1.8]" />
              <span>Payments</span>
            </Link>

            {/* Service Requests */}
            <Link 
              href="/service-requests" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-semibold text-sm transition-all"
            >
              <Wrench className="w-4.5 h-4.5 stroke-[1.8]" />
              <span>Service Requests</span>
            </Link>

            {/* Announcements (Active) */}
            <a 
              href="#" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50/80 text-blue-900 font-semibold text-sm transition-all"
            >
              <Megaphone className="w-4.5 h-4.5 stroke-[2.2]" />
              <span>Announcements</span>
            </a>

            {/* Settings */}
            <a 
              href="#" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-semibold text-sm transition-all"
            >
              <Settings className="w-4.5 h-4.5 stroke-[1.8]" />
              <span>Settings</span>
            </a>
          </nav>
        </div>

        {/* Sidebar Footer Section */}
        <div className="mt-8 pt-4 border-t border-slate-100 space-y-4">
          {/* Light Grey Emergency Support Button with Red Asterisk */}
          <button 
            type="button"
            onClick={() => alert('Emergency dispatch team has been notified. We will contact you immediately.')}
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer shadow-xs"
          >
            <span className="text-red-500 font-black text-sm">*</span>
            <span>Emergency Support</span>
          </button>

          {/* Additional Links */}
          <div className="space-y-1">
            <a 
              href="#" 
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all"
            >
              <HelpCircle className="w-4.5 h-4.5 text-slate-400 stroke-[1.8]" />
              <span>Help Center</span>
            </a>
            <Link 
              href="/" 
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 font-semibold text-xs sm:text-sm transition-all"
            >
              <LogOut className="w-4 h-4 text-slate-400 stroke-[1.8]" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>

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
          
          <div className="flex items-center gap-2.5">
            <RoleSwitcher currentRole="guest" />
            <button 
              onClick={() => alert('Opening announcement filters...')}
              className="border border-blue-900/80 hover:bg-blue-50 text-blue-900 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors"
            >
              Filter Feed
            </button>
            <button 
              onClick={() => alert('Opening notice creation editor...')}
              className="bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
            >
              Post Notice
            </button>
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

            {announcements.map((ann, idx) => (
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
            {announcements.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-sm font-medium">No announcements available.</div>
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
              <div className="space-y-4 divide-y divide-slate-100">
                
                {/* Event 1 */}
                <div className="pt-0 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-blue-900 block">
                      June 15th
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      AC Unit Servicing
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      09:00 AM - 05:00 PM
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Upcoming
                  </span>
                </div>

                {/* Event 2 */}
                <div className="pt-4 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-blue-900 block">
                      June 18th
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      Window Washing (South Face)
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      08:00 AM - 12:00 PM
                    </span>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="pt-4 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-blue-900 block">
                      June 22nd
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      Elevator B Maintenance
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      All Day
                    </span>
                  </div>
                </div>
              </div>

              {/* View Full Calendar link */}
              <button 
                onClick={() => alert('Opening calendar module...')}
                className="w-full text-center text-xs font-extrabold text-blue-600 hover:text-blue-800 hover:underline pt-3 border-t border-slate-100 block cursor-pointer tracking-wider"
              >
                VIEW FULL CALENDAR
              </button>
            </div>

            {/* Resources Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 tracking-wider mb-4 uppercase">
                Building Resources
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* HOA Docs */}
                <button
                  type="button"
                  onClick={() => alert('Opening HOA documents folder...')}
                  className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-slate-50/20 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-center transition-all group"
                >
                  <FileText className="w-5.5 h-5.5 text-slate-500 mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">HOA Docs</span>
                </button>

                {/* Directory */}
                <button
                  type="button"
                  onClick={() => alert('Opening building residents directory...')}
                  className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-slate-50/20 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-center transition-all group"
                >
                  <Users className="w-5.5 h-5.5 text-slate-500 mb-1.5 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">Directory</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
