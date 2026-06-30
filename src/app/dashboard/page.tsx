"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  Megaphone, 
  Settings, 
  AlertTriangle, 
  HelpCircle, 
  LogOut, 
  Landmark, 
  ChevronRight, 
  Wind, 
  Sparkles,
  MessageSquare,
  Package,
  Clock,
  Home as HomeIcon
} from 'lucide-react';
import Logo from '@/components/Logo';
import RoleSwitcher from '@/components/RoleSwitcher';

export default function MemberDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/dashboard/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans font-semibold text-slate-500">Loading your dashboard...</div>;
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
              alt={user.name || "Member Avatar"}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm mb-2"
            />
            <span className="text-xs font-semibold text-slate-400">Welcome back,</span>
            <span className="text-sm font-bold text-blue-900 mt-0.5">{user.name}</span>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
              Premium Member
            </span>
          </div>

          {/* Vertical Navigation Links */}
          <nav className="space-y-1">
            {/* Overview (Active) */}
            <a 
              href="#" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50/80 text-blue-900 font-semibold text-sm transition-all"
            >
              <LayoutDashboard className="w-4.5 h-4.5 stroke-[2.2]" />
              <span>Overview</span>
            </a>

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

            {/* Announcements */}
            <Link 
              href="/announcements" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-semibold text-sm transition-all"
            >
              <Megaphone className="w-4.5 h-4.5 stroke-[1.8]" />
              <span>Announcements</span>
            </Link>

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
          {/* Emergency Support Button */}
          <button 
            type="button"
            onClick={() => alert('Emergency dispatch team has been notified. We will contact you immediately.')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 text-xs sm:text-sm cursor-pointer"
          >
            <AlertTriangle className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Emergency Support</span>
          </button>

          {/* Additional Links */}
          <div className="space-y-1">
            <a 
              href="#" 
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 stroke-[1.8]" />
              <span>Help Center</span>
            </a>
            <button 
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 font-semibold text-xs sm:text-sm transition-all cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-slate-400 stroke-[1.8]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Right-Side Dashboard Area */}
      <section className="flex-grow p-6 sm:p-8 lg:p-10 overflow-y-auto">
        
        {/* Header Block with property tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">
              Here&apos;s what&apos;s happening at your property today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RoleSwitcher currentRole="guest" />
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200/60 shadow-xs">
              {user.memberProfile?.room ? `Room ${user.memberProfile.room.room_number} \u2022 ${user.memberProfile.room.type}` : "No Unit Assigned"}
            </span>
          </div>
        </div>

        {/* Summary Cards Row (Row 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Unit status */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.memberProfile?.room ? `Room ${user.memberProfile.room.room_number}` : "N/A"}</span>
              <span className="text-base font-extrabold text-slate-800 block mt-0.5">Room Status</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${user.memberProfile?.pendingPayments?.length > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.memberProfile?.pendingPayments?.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
              {user.memberProfile?.pendingPayments?.length > 0 ? 'Unpaid' : (user.memberProfile?.room ? 'Paid' : 'No Room')}
            </span>
          </div>

          {/* Card 2: Active requests */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Requests</span>
              <span className="text-base font-extrabold text-slate-800 block mt-0.5">{user.memberProfile?.pendingComplaints?.length || 0} Pending</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 stroke-[2]" />
            </div>
          </div>

          {/* Card 3: Packages */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Packages</span>
              <span className="text-base font-extrabold text-slate-800 block mt-0.5">1 Arrived</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Payment & Bills Section */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs mb-8 max-w-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
                <Landmark className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Active Bills
              </span>
            </div>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
              Due in 3 days
            </span>
          </div>

          <div className="mt-4">
            <span className="text-4xl font-black text-blue-900">
              ${user.memberProfile?.pendingPayments?.reduce((sum: number, p: any) => sum + p.amount, 0).toFixed(2) || '0.00'}
            </span>
            <span className="block text-xs text-slate-500 font-semibold mt-1">
              Monthly HOA Dues &amp; Utilities
            </span>
          </div>

          <div className="mt-6 flex items-center">
            <button 
              type="button"
              onClick={() => alert('Redirecting to Payment screen...')}
              className="bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer text-sm"
            >
              Pay Now
            </button>
            <a 
              href="#" 
              className="text-xs font-bold text-slate-500 hover:text-blue-900 hover:underline transition-colors ml-5"
            >
              View Details
            </a>
          </div>
        </div>

        {/* Maintenance Section */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Upcoming Maintenance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: AC Cleaning */}
            <div className="flex items-center justify-between border border-slate-100 hover:border-slate-200 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    AC Cleaning
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Scheduled: Nov 15
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition-colors" />
            </div>

            {/* Card 2: Fogging */}
            <div className="flex items-center justify-between border border-slate-100 hover:border-slate-200 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Monthly Fogging
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Scheduled: Nov 20
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition-colors" />
            </div>
          </div>
        </div>

        {/* Quick Actions (Row 2) */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Pay Rent */}
            <button
              type="button"
              onClick={() => alert('Opening Rent Payments...')}
              className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CreditCard className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Pay Rent
              </span>
            </button>

            {/* Request Maintenance */}
            <button
              type="button"
              onClick={() => alert('Opening Maintenance Request form...')}
              className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Wrench className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Request Maintenance
              </span>
            </button>

            {/* Community Board */}
            <button
              type="button"
              onClick={() => alert('Opening Community Board...')}
              className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Community Board
              </span>
            </button>
          </div>
        </div>

      </section>

    </main>
  );
}
