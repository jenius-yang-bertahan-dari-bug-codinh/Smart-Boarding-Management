"use client";

import React from 'react';
import { 
  X, 
  FileCheck, 
  User, 
  Home, 
  DollarSign, 
  AlertCircle, 
  Printer, 
  CheckCircle,
  Calendar,
  Building,
  MapPin
} from 'lucide-react';

interface LeaseAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export default function LeaseAgreementModal({ isOpen, onClose, user }: LeaseAgreementModalProps) {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-6 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <FileCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-0.5">
                  Legal Contract Document
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Official Tenancy Lease Agreement
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 font-medium leading-relaxed max-w-2xl">
            On this date, <span className="text-white font-bold">{todayStr}</span>, the following lease agreement has been officially ratified by the undersigned parties.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-grow bg-slate-50/50">
          
          {/* Parties Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* First Party (Lessor) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Building className="w-4 h-4 text-blue-600" />
                <span>First Party (Lessor / Property Management)</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                <p><span className="font-bold text-slate-900">Entity:</span> Papikost Management</p>
                <p className="flex items-start gap-1"><span className="font-bold text-slate-900 shrink-0">Address:</span> Central Cikarang, Bekasi Regency, West Java</p>
              </div>
            </div>

            {/* Second Party (Tenant) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Second Party (Tenant / Resident)</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                <p><span className="font-bold text-slate-900">Name:</span> {user?.name || 'Resident Member'}</p>
                <p><span className="font-bold text-slate-900">ID Number (KTP):</span> Verified in System</p>
                <p><span className="font-bold text-slate-900">Status:</span> Papikost Active Member</p>
              </div>
            </div>

          </div>

          {/* Articles (Sections) */}
          <div className="space-y-4">
            
            {/* Section 1 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center">1</span>
                <span>Section 1: Leased Property and Duration</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                The First Party leases the residential room <span className="font-bold text-slate-900">{user?.room_id ? `Room ${user.room_id}` : 'Papikost Unit'}</span> located in Papikost, Central Cikarang to the Second Party for the duration agreed upon during system reservation, effective from the check-in date until the designated lease expiration.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">2</span>
                <span>Section 2: Rental Fees and Security Deposit</span>
              </h3>
              <ul className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8 space-y-1.5 list-decimal">
                <li>The agreed rental rate corresponds to the monthly/annual room tariff settled through the official payment gateway.</li>
                <li>The Second Party submits a security deposit to guarantee room integrity and facility protection throughout the tenancy period.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">3</span>
                <span>Section 3: Facility Maintenance and Damages</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                The Second Party is fully responsible for maintaining room furnishings. Any damages resulting from tenant negligence will be deducted from the security deposit or billed directly.
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 text-xs font-black flex items-center justify-center">4</span>
                <span>Section 4: Lease Termination</span>
              </h3>
              <ul className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8 space-y-1.5 list-decimal">
                <li>Tenants wishing to terminate or non-renew their lease must provide written notification to Property Management at least <span className="font-bold text-slate-900">14 days</span> prior to lease expiration.</li>
                <li>Early departure prior to contract completion forfeits any remaining pre-paid rental balances.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center">5</span>
                <span>Section 5: House Rules & Compliance</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8 font-medium">
                The Resident confirms having read, understood, and agreed to abide by the <span className="font-bold text-blue-900">Papikost House Rules & Regulations</span>, which form an integral part of this contract.
              </p>
            </div>

          </div>

          {/* Signature Block */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Agreement Status</p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-sm">
                <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Active & Digitally Verified</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-xs font-medium text-slate-500 mb-2">(Authorized Signature)</p>
              <p className="text-base font-black text-blue-900 tracking-tight font-serif italic">Papikost Management</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Central Cikarang, Bekasi</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Contract</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
}
