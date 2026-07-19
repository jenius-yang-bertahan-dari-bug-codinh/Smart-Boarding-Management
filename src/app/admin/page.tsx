// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '@/app/actions/dashboard';
import { generateMonthlyInvoices, broadcastAnnouncement } from '@/app/actions/quick-actions';
import { getAdminRooms, assignMemberToRoom } from '@/app/actions/properties';
import { getAdminMembers } from '@/app/actions/members';
import { getAdminMaintenance, resolveMaintenanceTicket } from '@/app/actions/maintenance';
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
  CreditCard,
  Check,
  Upload,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Logo from '@/components/Logo';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminDashboard() {
  const router = useRouter();

  // Chart View State (Monthly vs Weekly)
  const [chartView, setChartView] = useState<'Monthly' | 'Weekly'>('Monthly');

  // Interactive Hover Month State for Chart Tooltips
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Dropdowns States
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 30 Days');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Booking Request', message: 'Jane Doe requested Room 201.', time: '5m ago', unread: true },
    { id: 2, title: 'Maintenance Alert', message: 'AC broken in Room 305.', time: '1h ago', unread: true },
    { id: 3, title: 'Payment Received', message: 'John Smith paid Rp 1.400.000.', time: '2h ago', unread: false },
  ]);

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

  // Document Management State (Lease Agreement & House Rules)
  const [docs, setDocs] = useState<{
    leaseAgreement: { name: string; size: string; date: string; url: string } | null;
    houseRules: { name: string; size: string; date: string; url: string } | null;
  }>({
    leaseAgreement: { name: 'lease-agreement-v2.pdf', size: '2.4 MB', date: '2024-07-01', url: '/lease-agreement.pdf' },
    houseRules: { name: 'house-rules-official.pdf', size: '1.8 MB', date: '2024-06-15', url: '/house-rules.pdf' },
  });

  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem('papikost_admin_docs');
      if (savedDocs) {
        setDocs(JSON.parse(savedDocs));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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

  const handleDocUpload = (type: 'leaseAgreement' | 'houseRules', file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Error: File size exceeds 5MB limit.', 'error');
      return;
    }

    const formattedSize = file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = {
        ...docs,
        [type]: {
          name: file.name,
          size: formattedSize,
          date: new Date().toISOString().split('T')[0],
          url: dataUrl,
        },
      };
      setDocs(updated);
      try {
        localStorage.setItem('papikost_admin_docs', JSON.stringify(updated));
        window.dispatchEvent(new Event('papikost_docs_changed'));
      } catch (e) {
        showToast('Error: File is too large for browser local storage.', 'error');
        return;
      }
      showToast(`${type === 'leaseAgreement' ? 'Lease Agreement' : 'House Rules'} uploaded successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDocDelete = (type: 'leaseAgreement' | 'houseRules') => {
    if (!window.confirm(`Are you sure you want to remove the ${type === 'leaseAgreement' ? 'Lease Agreement' : 'House Rules'} file?`)) return;
    const updated = {
      ...docs,
      [type]: null,
    };
    setDocs(updated);
    try {
      localStorage.setItem('papikost_admin_docs', JSON.stringify(updated));
      window.dispatchEvent(new Event('papikost_docs_changed'));
    } catch (e) {}
    showToast(`${type === 'leaseAgreement' ? 'Lease Agreement' : 'House Rules'} removed successfully!`, 'info');
  };

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [newResidentUnit, setNewResidentUnit] = useState('');

  const [invoiceAmount, setInvoiceAmount] = useState('1000000');

  const [maintenanceMemberId, setMaintenanceMemberId] = useState('');
  const [maintenanceCategory, setMaintenanceCategory] = useState('Plumbing');
  const [maintenanceDesc, setMaintenanceDesc] = useState('');

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementExpiry, setAnnouncementExpiry] = useState('7');

  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<any[]>([]);

  const [dashboardData, setDashboardData] = useState<any>(null);
  useEffect(() => {
    getDashboardStats(selectedFilter).then(res => {
      if(res.success) setDashboardData(res.data);
    });
    getAdminRooms().then(res => {
      if(res.success && res.data) setAvailableRooms(res.data);
    });
    getAdminMembers().then(res => {
      if(res.success && res.data) setActiveMembers(res.data.filter((m: any) => m.status === 'active'));
    });
    getAdminMaintenance().then(res => {
      if(res.success && res.data) setMaintenanceTickets(res.data);
    });
  }, [selectedFilter]);

  // Mock data for the monthly growth chart
  const monthlyData = dashboardData?.monthlyData || [];
  const weeklyData = dashboardData?.weeklyData || [];



  const currentChartData = chartView === 'Monthly' ? monthlyData : weeklyData;

  const handleExport = () => {
    showToast('Preparing spreadsheet report... Excel file exported successfully!', 'success');
  };

  const handleAddResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !newResidentUnit) {
      showToast('Please select a resident and a room.', 'error');
      return;
    }
    const res = await assignMemberToRoom(parseInt(selectedMemberId), parseInt(newResidentUnit));
    if (res.success) {
      showToast(`Resident successfully assigned to room!`, 'success');
      setActiveModal(null);
      setSelectedMemberId(''); setNewResidentUnit('');
    } else {
      showToast(res.error || 'Failed to assign resident', 'error');
    }
  };

  const handleGenerateInvoicesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await generateMonthlyInvoices(parseFloat(invoiceAmount));
    if (res.success) {
      showToast(`Successfully generated ${res.count} invoices!`, 'success');
      setActiveModal(null);
    } else {
      showToast(res.error || 'Failed to generate invoices', 'error');
    }
  };

  const handleSendAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementBody.trim()) {
      showToast('Please enter title and message.', 'error');
      return;
    }
    const res = await broadcastAnnouncement({ title: announcementTitle, body: announcementBody, expiryDays: parseInt(announcementExpiry) });
    if (res.success) {
      showToast(`Announcement broadcasted!`, 'success');
      setActiveModal(null);
      setAnnouncementTitle(''); setAnnouncementBody('');
    } else {
      showToast(res.error || 'Failed to send announcement', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Toast Alert Box */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl p-4 max-w-sm flex items-center gap-3.5 border-l-4 border-l-teal-500">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Notification</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{toastMessage}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)} 
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Navigation Bar (Top) */}
      <AdminNavbar activeTab="Dashboard" />

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Dashboard Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">
              System Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 text-sm sm:text-base font-semibold">
              Operational heartbeat for August 2024
            </p>
          </div>
          
          <div className="flex items-center gap-3 relative">
            {/* Last 30 Days Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>{selectedFilter}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </button>

              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in slide-in-from-top-2">
                  {['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(filter);
                        setFilterDropdownOpen(false);
                        showToast(`Filtered dashboard to: ${filter}`, 'info');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:text-blue-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 rounded-lg transition-all"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                {dashboardData ? '$' + dashboardData.totalRevenue.toLocaleString() : '...'}
              </span>
              <div className="mt-2.5 flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  <ArrowUpRight className="w-3 h-3" />
                  +12.5%
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">from last month</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Occupancy Rate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Occupancy Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {dashboardData ? dashboardData.occupancyRate + '%' : '...'}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Stable
                </span>
              </div>
              {/* Horizontal blue progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: dashboardData ? `${dashboardData.occupancyRate}%` : "0%" }}></div>
              </div>
            </div>
          </div>

          {/* KPI 3: Active Maintenance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Active Maintenance
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Wrench className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                {dashboardData ? dashboardData.activeMaintenance + ' Tickets' : '...'}
              </span>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200/40">
                  3 Priority
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">unresolved tasks</span>
              </div>
            </div>
          </div>

          {/* KPI 4: New Reservations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                New Reservations
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                {dashboardData ? dashboardData.newReservations + ' Requests' : '...'}
              </span>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                  Today
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">awaiting review</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Revenue Growth Chart & Documents) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Revenue Growth Chart Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Revenue Growth
                </h2>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-medium">Monthly performance overview</p>
              </div>

              {/* Monthly / Weekly toggle buttons */}
              <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-200/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setChartView('Monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartView === 'Monthly'
                      ? 'bg-white dark:bg-slate-900 text-blue-900 shadow-xs'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('Weekly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartView === 'Weekly'
                      ? 'bg-white dark:bg-slate-900 text-blue-900 shadow-xs'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            {/* Custom High-Fidelity Chart */}
            <div className="relative h-72 flex items-end justify-between gap-1 sm:gap-2 px-2 pt-6 border-b border-slate-100 dark:border-slate-800">
              
              {/* Background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
                <div className="border-b border-dashed border-slate-100 dark:border-slate-800 w-full h-0"></div>
                <div className="border-b border-dashed border-slate-100 dark:border-slate-800 w-full h-0"></div>
                <div className="border-b border-dashed border-slate-100 dark:border-slate-800 w-full h-0"></div>
                <div className="border-b border-dashed border-slate-100 dark:border-slate-800 w-full h-0"></div>
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
                  <p className="text-[8px] text-slate-400 dark:text-slate-500 text-center font-normal">{currentChartData[hoveredBar].month}</p>
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
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2.5 block">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>

            {/* Growth Indicator Footer */}
            <div className="mt-6 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span className="font-semibold flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                Growth is up 12% compared to Q1 2024
              </span>
              <span className="font-semibold">Amounts in IDR (Rupiah)</span>
            </div>
            </div>

            {/* Document & Policy Management Box (Leasing Agreement & House Rules) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Property Agreements & House Rules
                  </h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-medium">
                    Manage and update official property documents accessible to all active residents (5MB max per file).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Lease Agreement Card */}
                <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      {docs.leaseAgreement ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          Active File
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
                          <AlertCircle className="w-3 h-3" />
                          No File
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Lease Agreement</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      Binding rental terms, monthly rates, and official tenancy contract provisions.
                    </p>

                    {docs.leaseAgreement && (
                      <div className="mt-4 p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{docs.leaseAgreement.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">{docs.leaseAgreement.size} &bull; {docs.leaseAgreement.date}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDocument(docs.leaseAgreement!.url, docs.leaseAgreement!.name)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                          title="View Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                    <label className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs text-center">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{docs.leaseAgreement ? 'Replace File' : 'Upload PDF'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocUpload('leaseAgreement', file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {docs.leaseAgreement && (
                      <button
                        type="button"
                        onClick={() => handleDocDelete('leaseAgreement')}
                        className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors shrink-0"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. House Rules Card */}
                <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      {docs.houseRules ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          Active File
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
                          <AlertCircle className="w-3 h-3" />
                          No File
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white">House Rules & Regulations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      Building code of conduct, visitor hours, common facility guidelines, and quiet hours.
                    </p>

                    {docs.houseRules && (
                      <div className="mt-4 p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{docs.houseRules.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">{docs.houseRules.size} &bull; {docs.houseRules.date}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDocument(docs.houseRules!.url, docs.houseRules!.name)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                          title="View Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                    <label className="flex-1 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs text-center">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{docs.houseRules ? 'Replace File' : 'Upload PDF'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocUpload('houseRules', file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {docs.houseRules && (
                      <button
                        type="button"
                        onClick={() => handleDocDelete('houseRules')}
                        className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors shrink-0"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Modules) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Module 1: Recent Activity */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5">
                Recent Activity
              </h2>

              <div className="space-y-4">
                {/* Event 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      Payment Received
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                      Unit 402 &bull; Rp 1.400.000
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    2m ago
                  </span>
                </div>

                {/* Event 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      New Member Sign-up
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                      Alex Rivera &bull; Suite 12B
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    1h ago
                  </span>
                </div>

                {/* Event 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      Maintenance Resolved
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                      Unit 105 &bull; Electrical Fix
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    3h ago
                  </span>
                </div>
              </div>

              {/* View All Activity link */}
              <button
                type="button"
                onClick={() => showToast('Opening comprehensive activity ledger...', 'info')}
                className="w-full border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 py-2.5 rounded-xl transition-all cursor-pointer text-center block mt-5"
              >
                View All Activity
              </button>
            </div>

            {/* Module 2: Quick Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5">
                Quick Actions
              </h2>

              <div className="space-y-3">
                {/* Add Resident */}
                <button
                  type="button"
                  onClick={() => setActiveModal('add_resident')}
                  className="w-full flex items-center gap-3.5 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <UserPlus className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Add Resident
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Onboard a new guest</span>
                  </div>
                </button>

                {/* Generate Invoice */}
                <button
                  type="button"
                  onClick={() => setActiveModal('generate_invoice')}
                  className="w-full flex items-center gap-3.5 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Generate Invoice
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Calculate dues and utility dues</span>
                  </div>
                </button>

                {/* Open Maintenance */}
                <button
                  type="button"
                  onClick={() => setActiveModal('open_maintenance')}
                  className="w-full flex items-center gap-3.5 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Wrench className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Open Maintenance
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">View and manage repair tickets</span>
                  </div>
                </button>

                {/* Send Announcement */}
                <button
                  type="button"
                  onClick={() => setActiveModal('send_announcement')}
                  className="w-full flex items-center gap-3.5 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Megaphone className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Send Announcement
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Broadcast push alert to all units</span>
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
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 dark:text-slate-500 border border-slate-200/60 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Assign Resident
              </h3>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResidentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Resident</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-950 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-950"
                >
                  <option value="" disabled>Choose a resident...</option>
                  {activeMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} {m.room ? `(${m.room})` : ''}</option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] text-slate-500 font-medium leading-relaxed">
                  Only members who are registered in the system can be assigned to a room. Assigning a member will move them from their current room if they already have one.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Assigned Unit</label>
                <select
                  required
                  value={newResidentUnit}
                  onChange={(e) => setNewResidentUnit(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-950 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">Select a room...</option>
                  {availableRooms.filter(r => r.status !== 'Active Member' && r.status !== 'Maintenance').map(room => (
                    <option key={room.id} value={room.id}>
                      Unit {room.roomNo} - {room.type}
                    </option>
                  ))}
                  {availableRooms.filter(r => r.status !== 'Active Member' && r.status !== 'Maintenance').length === 0 && (
                    <option value="" disabled>No rooms available</option>
                  )}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-all cursor-pointer"
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

      {/* Quick Action Modal Dialog for Generate Invoices */}
      {activeModal === 'generate_invoice' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Generate Invoices
              </h3>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This will generate pending payments for all active members.
            </p>

            <form onSubmit={handleGenerateInvoicesSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Standard Invoice Amount (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1000000"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-950 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-950"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Generate Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Action Modal Dialog for Open Maintenance */}
      {activeModal === 'open_maintenance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 shrink-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Resident Maintenance Tickets
              </h3>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-2 flex-grow">
              {maintenanceTickets.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-10 text-sm font-semibold">
                  No maintenance tickets found.
                </div>
              ) : (
                maintenanceTickets.map(ticket => (
                  <div key={ticket.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">{ticket.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' :
                            ticket.status === 'In Progress' ? 'bg-orange-50 text-orange-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {ticket.status}
                          </span>
                          {ticket.priority === 'High' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                              Urgent
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                          {ticket.type} - {ticket.unit}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {ticket.summary}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                          Reported by: <span className="text-slate-600 dark:text-slate-400 font-bold">{ticket.member}</span>
                        </p>
                      </div>
                      
                      {ticket.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await resolveMaintenanceTicket(ticket.id);
                            if (res.success) {
                              showToast(`Marked ticket ${ticket.id} as resolved!`, 'success');
                              setMaintenanceTickets(tickets => tickets.map(t => t.id === ticket.id ? { ...t, status: 'Resolved' } : t));
                            } else {
                              showToast(res.error || 'Failed to resolve ticket', 'error');
                            }
                          }}
                          className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-lg transition-colors"
                          title="Mark as Resolved"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Modal Dialog for Send Announcement */}
      {activeModal === 'send_announcement' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Send Announcement
              </h3>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water Shutoff Notice"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-950 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Message Body</label>
                <textarea
                  required
                  placeholder="Enter the broadcast message..."
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-950 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-950 min-h-[100px]"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Valid For (Days)</label>
                <select
                  required
                  value={announcementExpiry}
                  onChange={(e) => setAnnouncementExpiry(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-950 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="1">1 Day</option>
                  <option value="3">3 Days</option>
                  <option value="7">1 Week</option>
                  <option value="14">2 Weeks</option>
                  <option value="30">1 Month</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <a key={link} href="#" onClick={(e) => { e.preventDefault(); showToast(`Opening ${link}…`, 'info'); }}
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
