"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown, 
  FileText, 
  Download, 
  TrendingUp, 
  Wrench, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  UserPlus, 
  FileSpreadsheet, 
  Megaphone, 
  ShieldAlert, 
  CheckCircle, 
  BookOpen, 
  Cpu, 
  Building, 
  User, 
  X,
  CreditCard
} from 'lucide-react';
import Logo from '@/components/Logo';
import RoleSwitcher from '@/components/RoleSwitcher';

export default function AdminPage() {
  const router = useRouter();
  // Navigation active tab state
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Properties' | 'Reservations' | 'Billing' | 'Members' | 'Maintenance'>('Dashboard');

  // Chart View State (Monthly vs Weekly)
  const [chartView, setChartView] = useState<'Monthly' | 'Weekly'>('Monthly');

  // Interactive Hover Month State for Chart Tooltips
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Dropdowns States
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 30 Days');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentUnit, setNewResidentUnit] = useState('101');

  // Mock data for the monthly growth chart
  const monthlyData = [
    { month: 'Jan', value: 35, amount: '$15,400' },
    { month: 'Feb', value: 50, amount: '$22,000' },
    { month: 'Mar', value: 45, amount: '$19,800' },
    { month: 'Apr', value: 65, amount: '$28,600' },
    { month: 'May', value: 75, amount: '$33,000' },
    { month: 'Jun', value: 95, amount: '$42,850', highlight: true }, // June is highlighted in teal
    { month: 'Jul', value: 55, amount: '$24,200' },
    { month: 'Aug', value: 40, amount: '$17,600' },
    { month: 'Sep', value: 65, amount: '$28,600' },
    { month: 'Oct', value: 75, amount: '$33,000' }
  ];

  const weeklyData = [
    { month: 'W1', value: 45, amount: '$6,200' },
    { month: 'W2', value: 60, amount: '$8,400' },
    { month: 'W3', value: 55, amount: '$7,800' },
    { month: 'W4', value: 85, amount: '$12,100', highlight: true },
    { month: 'W5', value: 40, amount: '$5,600' },
    { month: 'W6', value: 50, amount: '$7,000' }
  ];

  const currentChartData = chartView === 'Monthly' ? monthlyData : weeklyData;

  const handleExport = () => {
    showToast('Preparing spreadsheet report... Excel file exported successfully!', 'success');
  };

  const handleAddResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResidentName.trim()) {
      showToast('Please enter a resident name.', 'error');
      return;
    }
    showToast(`Resident ${newResidentName} successfully added to Unit ${newResidentUnit}!`, 'success');
    setActiveModal(null);
    setNewResidentName('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Toast Alert Box */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-white border border-slate-100 shadow-xl rounded-2xl p-4 max-w-sm flex items-center gap-3.5 border-l-4 border-l-teal-500">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Notification</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{toastMessage}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)} 
            className="text-slate-400 hover:text-slate-600 ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Navigation Bar (Top) */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-slate-100 shadow-xs z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Left: Logo & Navigation Tabs */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="text-xl font-bold text-blue-900 tracking-tight">
                SmartStay
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {(['Dashboard', 'Properties', 'Reservations', 'Billing', 'Members', 'Maintenance'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      if      (tab === 'Properties')   router.push('/admin/properties');
                      else if (tab === 'Reservations') router.push('/admin/reservations');
                      else if (tab === 'Billing')      router.push('/admin/billing');
                      else if (tab === 'Members')      router.push('/admin/members');
                      else if (tab === 'Maintenance')  router.push('/admin/maintenance');
                      else showToast(`Switched view to ${tab}`, 'info');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-900 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-blue-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Icons, Profile & Role Switcher */}
          <div className="flex items-center gap-4">
            
            {/* Search Input */}
            <div className="relative hidden lg:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4 stroke-[2]" />
              </span>
              <input
                type="text"
                placeholder="Search data..."
                className="w-48 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-900 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-400 text-slate-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    showToast(`Searching for "${(e.target as HTMLInputElement).value}"...`, 'info');
                  }
                }}
              />
            </div>

            {/* Icons Area */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button 
                type="button" 
                onClick={() => showToast('You have 3 unread administrative notifications.', 'info')}
                className="relative p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5 stroke-[2]" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>

              {/* Settings Gear */}
              <button 
                type="button" 
                onClick={() => showToast('Opening system settings...', 'info')}
                className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                <Settings className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Admin Profile"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            </div>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Dashboard Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">
              System Overview
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base font-semibold">
              Operational heartbeat for August 2024
            </p>
          </div>
          
          <div className="flex items-center gap-3 relative">
            {/* Last 30 Days Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{selectedFilter}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in slide-in-from-top-2">
                  {['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(filter);
                        setFilterDropdownOpen(false);
                        showToast(`Filtered dashboard to: ${filter}`, 'info');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-900 hover:bg-slate-50 rounded-lg transition-all"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Report teal button */}
            <button
              type="button"
              onClick={handleExport}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-teal-600/10 hover:shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* KPI Metric Cards (Top Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* KPI 1: Total Revenue */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block tracking-tight">
                $42,850.00
              </span>
              <div className="mt-2.5 flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  <ArrowUpRight className="w-3 h-3" />
                  +12.5%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">from last month</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Occupancy Rate */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Occupancy Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  85%
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Stable
                </span>
              </div>
              {/* Horizontal blue progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>

          {/* KPI 3: Active Maintenance */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active Maintenance
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Wrench className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block tracking-tight">
                14 Tickets
              </span>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200/40">
                  3 Priority
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">unresolved tasks</span>
              </div>
            </div>
          </div>

          {/* KPI 4: New Reservations */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                New Reservations
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block tracking-tight">
                28 Requests
              </span>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                  Today
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">awaiting review</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Revenue Growth Chart) */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Revenue Growth
                </h2>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">Monthly performance overview</p>
              </div>

              {/* Monthly / Weekly toggle buttons */}
              <div className="flex bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setChartView('Monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartView === 'Monthly'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('Weekly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartView === 'Weekly'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            {/* Custom High-Fidelity Chart */}
            <div className="relative h-72 flex items-end justify-between gap-1 sm:gap-2 px-2 pt-6 border-b border-slate-100">
              
              {/* Background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
                <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
              </div>

              {/* Interactive Tooltip Card */}
              {hoveredBar !== null && (
                <div 
                  className="absolute bg-slate-900 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xl z-10 transition-all pointer-events-none -translate-y-4"
                  style={{
                    left: `${(hoveredBar / currentChartData.length) * 100}%`,
                    bottom: `${currentChartData[hoveredBar].value}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <p className="text-center font-bold">{currentChartData[hoveredBar].amount}</p>
                  <p className="text-[8px] text-slate-400 text-center font-normal">{currentChartData[hoveredBar].month}</p>
                </div>
              )}

              {/* Render Bars */}
              {currentChartData.map((item, idx) => (
                <div 
                  key={item.month} 
                  className="flex-grow flex flex-col items-center group relative z-10"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* The bar visual */}
                  <div 
                    className={`w-8 sm:w-10 rounded-t-lg transition-all duration-300 cursor-pointer shadow-xs ${
                      item.highlight 
                        ? 'bg-teal-500 group-hover:bg-teal-600 shadow-md shadow-teal-500/20' 
                        : 'bg-blue-300/80 group-hover:bg-blue-400'
                    }`}
                    style={{ height: `${(item.value / 100) * 200}px` }}
                  ></div>
                  
                  {/* Label under bar */}
                  <span className="text-[10px] font-bold text-slate-400 mt-2.5 block">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>

            {/* Growth Indicator Footer */}
            <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                Growth is up 12% compared to Q1 2024
              </span>
              <span className="font-semibold">Amounts in USD</span>
            </div>
          </div>

          {/* Right Column (Sidebar Modules) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Module 1: Recent Activity */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                Recent Activity
              </h2>

              <div className="space-y-4">
                {/* Event 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Payment Received
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Unit 402 &bull; $1,200.00
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    2m ago
                  </span>
                </div>

                {/* Event 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      New Member Sign-up
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Alex Rivera &bull; Suite 12B
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    1h ago
                  </span>
                </div>

                {/* Event 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Maintenance Resolved
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Unit 105 &bull; Electrical Fix
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    3h ago
                  </span>
                </div>
              </div>

              {/* View All Activity link */}
              <button
                type="button"
                onClick={() => showToast('Opening comprehensive activity ledger...', 'info')}
                className="w-full border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 py-2.5 rounded-xl transition-all cursor-pointer text-center block mt-5"
              >
                View All Activity
              </button>
            </div>

            {/* Module 2: Quick Actions */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                Quick Actions
              </h2>

              <div className="space-y-3">
                {/* Add Resident */}
                <button
                  type="button"
                  onClick={() => setActiveModal('add_resident')}
                  className="w-full flex items-center gap-3.5 border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <UserPlus className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">
                      Add Resident
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Onboard a new guest</span>
                  </div>
                </button>

                {/* Generate Invoice */}
                <button
                  type="button"
                  onClick={() => showToast('Generating monthly bill run invoices...', 'success')}
                  className="w-full flex items-center gap-3.5 border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">
                      Generate Invoice
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Calculate dues and utility dues</span>
                  </div>
                </button>

                {/* Open Maintenance */}
                <button
                  type="button"
                  onClick={() => showToast('Redirecting to Maintenance dispatch portal...', 'info')}
                  className="w-full flex items-center gap-3.5 border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Wrench className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">
                      Open Maintenance
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">File an emergency repair ticket</span>
                  </div>
                </button>

                {/* Send Announcement */}
                <button
                  type="button"
                  onClick={() => showToast('Sending building-wide notification...', 'success')}
                  className="w-full flex items-center gap-3.5 border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Megaphone className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">
                      Send Announcement
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Broadcast push alert to all units</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Module 3: Smart System Status */}
            <div className="bg-blue-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden group">
              {/* Radial gradient background accent */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-500/25 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform"></div>

              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Smart System Online
                </span>
              </div>

              <p className="text-xs text-blue-200/90 leading-relaxed mb-5 font-medium">
                All 142 digital locks and environment sensors are reporting status: normal.
              </p>

              <button
                type="button"
                onClick={() => showToast('Loading interactive hardware sensor map...', 'info')}
                className="w-full bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/10 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4 shrink-0" />
                <span>View Hardware Map</span>
              </button>
            </div>

            {/* Module 4: Admin Guide */}
            <div className="bg-slate-100/70 border border-slate-200/40 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white text-slate-600 border border-slate-200/60 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Admin Guide
                  </h3>
                  <button 
                    onClick={() => showToast('Opening Admin Guide docs...', 'info')}
                    className="text-[10px] text-teal-600 hover:text-teal-700 font-bold hover:underline transition-colors block text-left"
                  >
                    Read documentation
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Quick Action Modal Dialog for Add Resident */}
      {activeModal === 'add_resident' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Add New Resident
              </h3>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResidentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Resident Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={newResidentName}
                  onChange={(e) => setNewResidentName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-950 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Unit</label>
                <select
                  value={newResidentUnit}
                  onChange={(e) => setNewResidentUnit(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-950 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none"
                >
                  <option value="101">Unit 101 - Deluxe Suite</option>
                  <option value="102">Unit 102 - Executive Suite</option>
                  <option value="205">Unit 205 - Standard Single</option>
                  <option value="402">Unit 402 - Penthouse Loft</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Confirm Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Sticky Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                SmartStay
              </span>
              <span className="text-slate-300 text-xs">|</span>
              <span className="text-[11px] text-slate-500 font-medium">
                &copy; 2024 SmartStay Management System. All rights reserved.
              </span>
            </div>
            {/* Role Switcher moved here from navbar */}
            <div className="border-l border-slate-200 pl-4">
              <RoleSwitcher currentRole="admin" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {['Support', 'Privacy Policy', 'Contact Us'].map((link) => (
              <a 
                key={link} 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  showToast(`Opening ${link} link...`, 'info');
                }}
                className="text-[11px] text-slate-500 hover:text-blue-900 font-semibold transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
