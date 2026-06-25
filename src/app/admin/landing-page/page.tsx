"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Properties' | 'Reservations' | 'Billing' | 'Members' | 'Landing Page'>('Landing Page');
  
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
  const [facilities, setFacilities] = useState([
    { id: 1, name: 'High-Speed Wi-Fi', description: 'Stay connected with dedicated gigabit fiber internet available i...', icon: 'Wifi' },
    { id: 2, name: 'Laundry Services', description: '24/7 self-service laundry room equipped with modern industri...', icon: 'WashingMachine' },
    { id: 3, name: '24/7 Security', description: 'Advanced biometric access, CCTV monitoring, and on-site se...', icon: 'ShieldCheck' },
    { id: 4, name: 'Modern Gym', description: 'Fully equipped fitness center with cardio machines, free weigh...', icon: 'Dumbbell' }
  ]);

  // Rooms data
  const [rooms, setRooms] = useState([
    { id: 1, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200', name: 'Premium Sky Suite', price: '$1,200', amenities: ['WiFi 6', 'AC', 'Smart Lock'] },
    { id: 2, image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=200', name: 'Standard Solo Studio', price: '$850', amenities: ['WiFi', 'En-suite'] },
    { id: 3, image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=200', name: 'Executive Double', price: '$1,500', amenities: ['Balcony', 'AC', 'Gym Access'] },
    { id: 4, image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=200', name: 'Solo Compact Capsule', price: '$450', amenities: ['WiFi', 'Shared Kitchen'] }
  ]);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-white shadow-xl rounded-2xl p-4 max-w-sm flex items-center gap-3.5 border-l-4 border-l-teal-500">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Notification</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 ml-auto cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-slate-100 shadow-xs z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8 lg:gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-blue-900 tracking-tight">SmartStay Admin</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {(['Dashboard', 'Properties', 'Reservations', 'Billing', 'Members', 'Landing Page'] as const).map((tab) => {
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
                      else if (tab === 'Landing Page') router.push('/admin/landing-page');
                      else if (tab === 'Dashboard')    router.push('/admin');
                    }}
                    className={`pb-1.5 pt-1 text-sm font-semibold transition-all cursor-pointer border-b-2 ${
                      isActive ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-blue-900'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl transition-all">
                <Bell className="w-5 h-5 stroke-[2]" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>
              <button className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-50 rounded-xl transition-all">
                <Settings className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
              <button className="hidden sm:flex items-center gap-1.5 bg-[#0f2852] hover:bg-[#0f2852]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <span className="text-lg leading-none mb-0.5">+</span> Add Resident
              </button>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Admin Profile"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header section matching Image 2 */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-slate-500 mb-2">
            Landing Page Management 
            {activeConfigTab === 'Rooms' && <span className="mx-2">&gt;</span>} 
            {activeConfigTab === 'Rooms' && <span className="font-semibold text-slate-700">Rooms Configuration</span>}
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-1">
            {activeConfigTab === 'Rooms' ? 'Website Content Manager' : 'Landing Page Management'}
          </h1>
          <p className="text-slate-500 text-sm">
            {activeConfigTab === 'Rooms' 
              ? 'Manage the room availability catalog displayed on your public landing page.' 
              : 'Configure the public-facing content for your property landing page.'}
          </p>
        </div>

        {/* Configuration Tabs container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Sub Navigation */}
          <div className="flex items-center border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50/50">
            {(['Hero Section', 'Facilities', 'Rooms'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveConfigTab(tab)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeConfigTab === tab 
                    ? 'border-blue-900 text-blue-900' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeConfigTab === 'Hero Section' && (
              <div className="max-w-3xl">
                <h2 className="text-lg font-semibold text-blue-900 mb-6">Hero Configuration</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Headline Title</label>
                    <input 
                      type="text" 
                      defaultValue="Experience Luxury Living"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                    <textarea 
                      rows={3}
                      defaultValue="Discover the perfect blend of comfort and sophistication in our premium suites."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hero Background Image</label>
                    <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors">
                      <UploadCloud className="w-8 h-8 text-blue-900 mb-3" />
                      <p className="text-sm font-semibold text-slate-700 mb-1">Drag and drop or click to upload</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
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
                    <h2 className="text-2xl font-bold text-slate-900">Facilities Configuration</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage the key features and amenities highlighted to potential residents.</p>
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Add Facility
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Icon</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Name</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {facilities.map((facility) => (
                        <tr key={facility.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-4 px-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              {getFacilityIcon(facility.icon)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-slate-800">{facility.name}</td>
                          <td className="py-4 px-4 text-sm text-slate-500 max-w-xs truncate">{facility.description}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Page Live & Syncing
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
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
                    <h2 className="text-2xl font-bold text-slate-900">Rooms Section Configuration</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage the room availability catalog displayed on your public landing page.</p>
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Add New Room
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Room Image</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Room Name</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Starting Price</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amenities</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <img src={room.image} alt={room.name} className="w-16 h-12 rounded-lg object-cover border border-slate-200" />
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-slate-800">{room.name}</td>
                          <td className="py-4 px-4 text-sm font-bold text-blue-900">{room.price} <span className="text-xs text-slate-500 font-normal">/mo</span></td>
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
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center text-[8px] font-bold">i</div>
                    Last updated: Oct 24, 2024 at 10:45 AM
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
