"use client";

import React from 'react';
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
import RoleSwitcher from '@/components/RoleSwitcher';

export default function FinancialHub() {
  const transactions = [
    {
      id: 1,
      name: 'Monthly Rent',
      date: 'Sep 1, 2023',
      type: 'Auto-pay',
      amount: '-$1,400.00',
      status: 'Paid',
      positive: false,
      Icon: HomeIcon,
      bgIcon: 'bg-blue-50 text-blue-600'
    },
    {
      id: 2,
      name: 'Laundry Credit Addition',
      date: 'Aug 28, 2023',
      type: 'Manual',
      amount: '+$25.00',
      status: 'Completed',
      positive: true,
      Icon: Coins,
      bgIcon: 'bg-orange-50 text-orange-600'
    },
    {
      id: 3,
      name: 'Maintenance: Sink Repair',
      date: 'Aug 15, 2023',
      type: 'Invoice #8821',
      amount: '-$75.00',
      status: 'Paid',
      positive: false,
      Icon: Wrench,
      bgIcon: 'bg-slate-100 text-slate-600'
    },
    {
      id: 4,
      name: 'Monthly Rent',
      date: 'Aug 1, 2023',
      type: 'Auto-pay',
      amount: '-$1,400.00',
      status: 'Paid',
      positive: false,
      Icon: HomeIcon,
      bgIcon: 'bg-blue-50 text-blue-600'
    },
    {
      id: 5,
      name: 'Community Amenities Fee',
      date: 'Jul 25, 2023',
      type: 'Annual',
      amount: '-$150.00',
      status: 'Paid',
      positive: false,
      Icon: Landmark,
      bgIcon: 'bg-indigo-50 text-indigo-600'
    }
  ];

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
            <span className="text-sm font-bold text-blue-900 mt-0.5">Alex Johnson</span>
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

            {/* Payments (Active) */}
            <a 
              href="#" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50/80 text-blue-900 font-semibold text-sm transition-all"
            >
              <CreditCard className="w-4.5 h-4.5 stroke-[2.2]" />
              <span>Payments</span>
            </a>

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
          
          {/* Functional top-right action buttons & Role Switcher */}
          <div className="flex items-center gap-2.5">
            <RoleSwitcher currentRole="guest" />
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
                    $1,450.00
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
                onClick={() => alert('Directing to Balance payment portal...')}
                className="mt-6 w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer text-sm shadow-sm hover:shadow-md"
              >
                Pay Now
              </button>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  Payment Method
                </h2>
                <button 
                  onClick={() => alert('Opening payment method editor...')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                <div className="w-10 h-8 rounded bg-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-slate-500 tracking-wider">VISA</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    Visa ending in &bull;&bull;&bull;&bull; 4242
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mt-0.5">
                    Auto-pay enabled
                  </span>
                </div>
              </div>
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
                  const TxIcon = tx.Icon;
                  return (
                    <div key={tx.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      {/* Left Block: Icon + Details */}
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.bgIcon}`}>
                          <TxIcon className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-800">
                            {tx.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">
                            {tx.date} &bull; <span className="text-slate-500">{tx.type}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right Block: Amount + Status */}
                      <div className="text-right">
                        <span className={`text-sm font-black block ${
                          tx.positive ? 'text-orange-500' : 'text-slate-800'
                        }`}>
                          {tx.amount}
                        </span>
                        
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <CircleDot className="w-2.5 h-2.5 text-blue-900 fill-blue-900/10" />
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
