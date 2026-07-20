// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { getAdminLandingConfig } from '@/app/actions/landing';
import Link from 'next/link';
import AdminNavbar from '@/components/AdminNavbar';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Settings, 
  Search,
  CheckCircle, 
  X,
  UploadCloud,
  Edit2,
  Trash2,
  Plus,
  Wifi,
  WashingMachine,
  ShieldCheck,
  Dumbbell
} from 'lucide-react';

export default function LandingPageManagement() {
  const router = useRouter();
  // Page specific tabs
  const [activeConfigTab, setActiveConfigTab] = useState<'Hero Section' | 'Facilities' | 'Rooms'>('Hero Section');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Facilities data
  const [facilities, setFacilities] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminLandingConfig().then(res => {
      if(res.success && res.data) {
        setFacilities(res.data.facilities);
        setRooms(res.data.rooms);
      }
      setIsLoading(false);
    });
  }, []);

  // Rooms data
  

  const getFacilityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wifi': return <Wifi className="w-5 h-5" />;
      case 'WashingMachine': return <WashingMachine className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Dumbbell': return <Dumbbell className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-4 max-w-sm flex items-center gap-3.5 border-l-4 border-l-teal-500">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Notification</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 ml-auto cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Navigation Bar */}
      <AdminNavbar activeTab="Landing Page" />

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header section matching Image 2 */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">
            Landing Page Management 
            {activeConfigTab === 'Rooms' && <span className="mx-2">&gt;</span>} 
            {activeConfigTab === 'Rooms' && <span className="font-semibold text-slate-700 dark:text-slate-300">Rooms Configuration</span>}
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-1">
            {activeConfigTab === 'Rooms' ? 'Website Content Manager' : 'Landing Page Management'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">
            {activeConfigTab === 'Rooms' 
              ? 'Manage the room availability catalog displayed on your public landing page.' 
              : 'Configure the public-facing content for your property landing page.'}
          </p>
        </div>

        {/* Configuration Tabs container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Sub Navigation */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-6 pt-4 gap-6 bg-slate-50/50">
            {(['Hero Section', 'Facilities', 'Rooms'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveConfigTab(tab)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeConfigTab === tab 
                    ? 'border-blue-900 text-blue-900' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeConfigTab === 'Hero Section' && (
              <div className="w-full">
                <h2 className="text-lg font-semibold text-blue-900 mb-6">Hero Configuration</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Headline Title</label>
                    <input 
                      type="text" 
                      defaultValue="Experience Luxury Living"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subtitle</label>
                    <textarea 
                      rows={3}
                      defaultValue="Discover the perfect blend of comfort and sophistication in our premium suites."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hero Background Image</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                      <UploadCloud className="w-8 h-8 text-blue-900 mb-3" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Drag and drop or click to upload</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">PNG, JPG up to 10MB</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => showToast('Hero section changes saved successfully!')}
                    className="w-full sm:w-auto bg-[#0A2558] hover:bg-[#0A2558]/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeConfigTab === 'Facilities' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Facilities Configuration</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage the key features and amenities highlighted to potential residents.</p>
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Add Facility
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Icon</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Facility Name</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {facilities.map((facility) => (
                        <tr key={facility.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-colors group">
                          <td className="py-4 px-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              {getFacilityIcon(facility.icon)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{facility.name}</td>
                          <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 max-w-xs truncate">{facility.description}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Page Live & Syncing
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-colors">
                      Preview Landing Page
                    </button>
                    <button 
                      onClick={() => showToast('Facilities changes saved!')}
                      className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#0A2558] hover:bg-[#0A2558]/90 text-white transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeConfigTab === 'Rooms' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rooms Section Configuration</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage the room availability catalog displayed on your public landing page.</p>
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Add New Room
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Room Image</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Room Name</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Starting Price</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amenities</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-colors">
                          <td className="py-4 px-4">
                            <img src={room.image} alt={room.name} className="w-16 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">{room.name}</td>
                          <td className="py-4 px-4 text-sm font-bold text-blue-900">{room.price} <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-normal">/mo</span></td>
                          <td className="py-4 px-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {room.amenities.map(amenity => (
                                <span key={amenity} className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{amenity}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {/* Empty actions matching mockup */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button 
                    onClick={() => showToast('Rooms changes saved!')}
                    className="w-full sm:w-auto bg-[#0A2558] hover:bg-[#0A2558]/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center text-[8px] font-bold">i</div>
                    Last updated: Oct 24, 2024 at 10:45 AM
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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
              <a key={link} href="#" onClick={(e) => { e.preventDefault(); showToast(`Opening ${link}…`); }}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-blue-900 transition-colors hover:underline underline-offset-2">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
