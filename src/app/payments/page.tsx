"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Download, 
  SlidersHorizontal,
  Home as HomeIcon,
  Coins,
  WashingMachine,
  ArrowRight,
  ShieldCheck,
  CircleDot
} from 'lucide-react';
import Logo from '@/components/Logo';
import MemberSidebar from '@/components/MemberSidebar';

export default function FinancialHub() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  // Helper: extract redirect_url from gateway_reference (handles both old and new format)
  const getRedirectUrl = (gatewayRef: string | null) => {
    if (!gatewayRef) return null;
    // New format: "order_id|redirect_url", Old format: just the URL
    const parts = gatewayRef.split('|');
    return parts.length > 1 ? parts[1] : parts[0];
  };

  // Fetch payment data from server
  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/payments');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setTransactions(data.payments);
      setCurrentBalance(data.currentBalance);
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Check payment status from Midtrans API and refresh data
  const checkPaymentStatus = useCallback(async () => {
    // Only check if there are pending/overdue payments with gateway_reference
    const pendingWithGateway = transactions.filter(
      (t) => (t.status === 'pending' || t.status === 'overdue') && t.gateway_reference
    );
    if (pendingWithGateway.length === 0) return;

    setIsChecking(true);
    try {
      const res = await fetch('/api/payments/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: pendingWithGateway.map((t) => t.id)
        })
      });
      const data = await res.json();
      if (data.updated && data.updated.length > 0) {
        // Payment status changed — refresh all data
        await fetchPayments();
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      setIsChecking(false);
    }
  }, [transactions, fetchPayments]);

  // Initial data load
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Auto-check payment status when user returns to tab (after paying on Midtrans)
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans font-semibold text-slate-500">Loading payments...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Left-Side Navigation Sidebar */}
      <MemberSidebar activeTab="Payments" user={user} onRefresh={fetchPayments} />

      {/* Main Right-Side Content Area */}
      <section className="flex-grow p-6 sm:p-8 lg:p-10 overflow-y-auto">
        
        {/* Header Block with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Financial Hub
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">
              Manage your balances and transaction history.
            </p>
          </div>
          
          {/* Functional top-right action buttons */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => alert('Exporting transaction history to PDF...')}
              className="w-10 h-10 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-900 transition-colors shadow-xs cursor-pointer"
              title="Export Data"
            >
              <Download className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={() => alert('Opening history filter menu...')}
              className="w-10 h-10 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-900 transition-colors shadow-xs cursor-pointer"
              title="Filter Transactions"
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Two-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Account Summary) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Current Balance Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Balance
                  </span>
                  <span className="text-3xl font-black text-blue-900 block mt-1">
                    Rp {currentBalance.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              {/* Status information */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  Due in 5 days
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Next billing: Oct 1st
                </span>
              </div>

              {/* Pay Now Button */}
              <button
                type="button"
                disabled={currentBalance <= 0 || isPaying}
                onClick={async () => {
                  const pendingTx = transactions.find(t => t.status === 'pending' || t.status === 'overdue');
                  if (!pendingTx) return;
                  
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
                className={`mt-6 w-full font-bold py-3 px-6 rounded-xl transition-all cursor-pointer text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
                  currentBalance > 0 
                    ? 'bg-blue-900 hover:bg-blue-950 text-white' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isPaying ? 'Connecting...' : isChecking ? 'Checking...' : (currentBalance > 0 ? 'Pay Now' : 'All Paid')}
              </button>
            </div>


          </div>

          {/* Right Column (Transaction History) */}
          <div className="lg:col-span-8">
            
            {/* Transaction History Panel */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                  Transaction History
                </h2>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Opening complete transaction list...'); }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-slate-100/70">
                {transactions.map((tx) => {
                  return (
                    <div key={tx.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      {/* Left Block: Icon + Details */}
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                          <CreditCard className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-800">
                            Payment
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">
                            {new Date(tx.payment_date).toLocaleDateString()} &bull; <span className="text-slate-500">{tx.payment_method}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right Block: Amount + Status */}
                      <div className="text-right flex flex-col items-end">
                        <span className={`text-sm font-black block ${tx.status === 'pending' ? 'text-orange-500' : 'text-slate-800'}`}>
                          Rp {tx.amount.toLocaleString('id-ID')}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {(tx.status === 'pending' || tx.status === 'overdue') && (
                            <button
                              type="button"
                              disabled={isPaying}
                              onClick={async (e) => {
                                e.preventDefault();
                                const redirectUrl = getRedirectUrl(tx.gateway_reference);
                                if (redirectUrl) {
                                  window.open(redirectUrl, '_blank');
                                  return;
                                }
                                setIsPaying(true);
                                const { generatePaymentLink } = await import('@/app/actions/midtrans');
                                const res = await generatePaymentLink(tx.id);
                                if (res.success && res.redirect_url) {
                                  // Update local state so gateway_reference is populated
                                  setTransactions(transactions.map(t => t.id === tx.id ? { ...t, gateway_reference: `new|${res.redirect_url}` } : t));
                                  window.open(res.redirect_url, '_blank');
                                } else {
                                  alert('Failed to generate Midtrans link');
                                }
                                setIsPaying(false);
                              }}
                              className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
                            >
                              Pay
                            </button>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <CircleDot className={`w-2.5 h-2.5 ${tx.status === 'pending' ? 'text-orange-500 fill-orange-500/10' : 'text-emerald-500 fill-emerald-500/10'}`} />
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <div className="py-6 text-center text-slate-500 text-sm font-medium">No transactions found.</div>
                )}
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
