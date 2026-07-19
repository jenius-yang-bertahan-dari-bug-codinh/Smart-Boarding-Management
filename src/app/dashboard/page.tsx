"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  Megaphone, 
  LogOut, 
  Landmark, 
  ChevronRight, 
  Wind, 
  Sparkles,
  MessageSquare,
  Clock,
  Home as HomeIcon,
  Settings,
  CheckCircle
} from 'lucide-react';
import Logo from '@/components/Logo';
import MemberSidebar from '@/components/MemberSidebar';

export default function MemberDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const router = useRouter();

  // Helper: extract redirect_url from gateway_reference (handles both old and new format)
  const getRedirectUrl = (gatewayRef: string | null) => {
    if (!gatewayRef) return null;
    const parts = gatewayRef.split('|');
    return parts.length > 1 ? parts[1] : parts[0];
  };

  // Fetch dashboard data from server
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err: any) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Check payment status from Midtrans API and refresh data
  const checkPaymentStatus = useCallback(async () => {
    const pendingPayments = user?.memberProfile?.pendingPayments || [];
    const pendingWithGateway = pendingPayments.filter(
      (p: any) => p.gateway_reference
    );
    if (pendingWithGateway.length === 0) return;

    setIsChecking(true);
    try {
      const res = await fetch('/api/payments/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: pendingWithGateway.map((p: any) => p.id)
        })
      });
      const data = await res.json();
      if (data.updated && data.updated.length > 0) {
        // Payment status changed — refresh dashboard data
        await fetchDashboard();
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      setIsChecking(false);
    }
  }, [user, fetchDashboard]);

  // Initial data load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-check payment status when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isChecking) {
        checkPaymentStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkPaymentStatus, isChecking]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans font-semibold text-slate-500">Loading your dashboard...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Left-Side Navigation Sidebar */}
      <MemberSidebar activeTab="Overview" user={user} onRefresh={fetchDashboard} />

      {/* Main Right-Side Dashboard Area */}
      <section className="flex-grow p-6 sm:p-8 lg:p-10 overflow-y-auto">
        
        {/* Header Block with property tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.name || "Member Avatar"}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-blue-600 shadow-md shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80";
                }}
              />
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user.name?.split(' ')[0] || 'Guest'}
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">
                Here&apos;s what&apos;s happening at your property today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200/60 shadow-xs">
              {user.memberProfile?.room ? `Room ${user.memberProfile.room.room_number} \u2022 ${user.memberProfile.room.type}` : "No Unit Assigned"}
            </span>
          </div>
        </div>

        {/* Main Status & Active Bills Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Left Column: Active Bills (7 columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
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
                  Rp {(user.memberProfile?.pendingPayments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0).toLocaleString('id-ID')}
                </span>
                <span className="block text-xs text-slate-500 font-semibold mt-1">
                  Monthly Room &amp; Utilities
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center">
              <button 
                type="button"
                disabled={isPaying || !user.memberProfile?.pendingPayments || user.memberProfile.pendingPayments.length === 0}
                onClick={async () => {
                  const pendingTxs = user.memberProfile?.pendingPayments || [];
                  if (pendingTxs.length === 0) return;
                  
                  const pendingTx = pendingTxs[0];
                  const redirectUrl = getRedirectUrl(pendingTx.gateway_reference);
                  if (redirectUrl) {
                    window.open(redirectUrl, '_blank');
                    return;
                  }

                  setIsPaying(true);
                  const { generatePaymentLink } = await import('@/app/actions/midtrans');
                  const res = await generatePaymentLink(pendingTx.id);
                  if (res.success && res.redirect_url) {
                    window.open(res.redirect_url, '_blank');
                  } else {
                    alert('Failed to initialize payment: ' + (res.error || 'Unknown error'));
                  }
                  setIsPaying(false);
                }}
                className="bg-blue-900 hover:bg-blue-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer text-sm"
              >
                {isPaying ? 'Connecting...' : isChecking ? 'Checking...' : 'Pay Now'}
              </button>
              <a 
                href="#" 
                className="text-xs font-bold text-slate-500 hover:text-blue-900 hover:underline transition-colors ml-5"
              >
                View Details
              </a>
            </div>
          </div>

          {/* Right Column: Room Status & Maintenance Requests beside Active Bills (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Card 1: Room Status */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex items-center justify-between flex-grow">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {user.memberProfile?.room ? `Room ${user.memberProfile.room.room_number}` : "Room Status"}
                </span>
                <span className="text-lg font-extrabold text-slate-800 block mt-0.5">
                  Unit Status
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${user.memberProfile?.pendingPayments?.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'}`}>
                <span className={`w-2 h-2 rounded-full ${user.memberProfile?.pendingPayments?.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                {user.memberProfile?.pendingPayments?.length > 0 ? 'Unpaid' : (user.memberProfile?.room ? 'Paid' : 'No Room')}
              </span>
            </div>

            {/* Card 2: Maintenance Request */}
            <div 
              onClick={() => router.push('/service-requests')}
              className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex items-center justify-between flex-grow cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Maintenance Request
                </span>
                <span className="text-lg font-extrabold text-slate-800 block mt-0.5 group-hover:text-blue-600 transition-colors">
                  {user.memberProfile?.pendingComplaints?.length || 0} Pending
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Wrench className="w-5 h-5 stroke-[2]" />
              </div>
            </div>
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
              onClick={() => router.push('/service-requests')}
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
              onClick={() => router.push('/announcements')}
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
