"use client";

import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CreditCard, 
  Zap, 
  CheckCircle2, 
  BookOpen,
  Printer,
  Download
} from 'lucide-react';

interface HouseRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HouseRulesModal({ isOpen, onClose }: HouseRulesModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const rulesData = [
    {
      id: 1,
      title: "Quiet Hours & Visitor Policy",
      icon: Clock,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      items: [
        "Visitor visiting hours end strictly at 10:00 PM (22:00 WIB).",
        "Overnight guests require prior written authorization from property management. Approved stays will incur standard surcharge rates.",
        "Opposite-gender visitors are strictly prohibited inside private bedrooms with doors closed. All visits should take place in the common living or lobby areas.",
        "Residents returning after 11:00 PM must maintain quietness to avoid disturbing neighboring tenants."
      ]
    },
    {
      id: 2,
      title: "Cleanliness & Comfort Standards",
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      items: [
        "Every resident is required to keep their private room clean and dispose of personal trash in designated property receptacles.",
        "Common areas (shared kitchen, drying room, parking facility) must be kept clean immediately after every use.",
        "Leaving personal belongings or waste bags in front of room doors or along public corridors is prohibited.",
        "Tenants must maintain reasonable volume levels on televisions and sound systems to preserve a peaceful living environment."
      ]
    },
    {
      id: 3,
      title: "Strictly Prohibited Conduct",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      isCritical: true,
      items: [
        "Possessing, storing, or using illegal drugs, alcoholic beverages, and dangerous weapons on property premises is strictly prohibited.",
        "Immoral conduct or any activities violating statutory laws and community ethical standards are strictly prohibited.",
        "Gambling of any form on property grounds is strictly prohibited.",
        "Violation of any zero-tolerance rules will result in immediate lease termination without refund."
      ]
    },
    {
      id: 4,
      title: "Rental Payment & Security Deposit",
      icon: CreditCard,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      items: [
        "Monthly rental payments must be settled on or before the room billing due date each month.",
        "Late payments are subject to a late fee penalty of 1% per day based on the monthly rental amount.",
        "The security deposit will be refunded upon check-out, provided there are no facility damages or outstanding payment arrears."
      ]
    },
    {
      id: 5,
      title: "Electricity & Water Usage Guidelines",
      icon: Zap,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      items: [
        "Use water and electricity responsibly and efficiently.",
        "Ensure all lights, air conditioners, and electronic devices are turned off when leaving the room.",
        "Bringing high-power personal appliances (such as large water dispensers or private refrigerators) requires prior management approval."
      ]
    }
  ];

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
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-6 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <BookOpen className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 block mb-0.5">
                  Papikost Official Document
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Official House Rules & Regulations
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
          <p className="text-xs sm:text-sm text-blue-100/90 mt-3 font-medium leading-relaxed max-w-2xl">
            This document is established to ensure a safe, clean, and harmonious community environment for every resident at Papikost.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-grow bg-slate-50/50">
          
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3.5 text-blue-900">
            <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">
              All residents must read, understand, and adhere to the guidelines outlined below to maintain mutual comfort and safety while living at <span className="font-bold">Papikost</span>.
            </p>
          </div>

          <div className="space-y-4">
            {rulesData.map((rule) => {
              const IconComponent = rule.icon;
              return (
                <div 
                  key={rule.id} 
                  className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all shadow-sm hover:shadow-md ${
                    rule.isCritical ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${rule.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Section {rule.id}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                        {rule.title}
                      </h3>
                    </div>
                    {rule.isCritical && (
                      <span className="ml-auto bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-rose-200/80 uppercase tracking-wider shrink-0">
                        Critical
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 pl-2">
                    {rule.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Agreement Checkbox Box */}
          <div 
            onClick={() => setAgreed(!agreed)}
            className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer hover:border-blue-500 transition-all group"
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
              agreed ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30' : 'border-slate-300 bg-slate-50 group-hover:border-blue-400'
            }`}>
              {agreed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 select-none">
                I have read, understood, and agree to abide by all Papikost Official House Rules & Regulations.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Document</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/15 transition-all cursor-pointer text-center"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
}
