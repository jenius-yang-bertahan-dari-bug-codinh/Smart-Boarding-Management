// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { getAdminLandingConfig, updateFacilities } from '@/app/actions/landing';
import { addRoom } from '@/app/actions/properties';
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
  Dumbbell,
  Car,
  Coffee,
  Tv
} from 'lucide-react';

export default function LandingPageManagement() {
  const router = useRouter();
  // Page specific tabs
  const [activeConfigTab, setActiveConfigTab] = useState<'Hero Section' | 'Facilities'>('Hero Section');

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
      }
      setIsLoading(false);
    });
  }, []);

  // Add Facility Modal State
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityDesc, setNewFacilityDesc] = useState('');
  const [newFacilityIcon, setNewFacilityIcon] = useState('Wifi');

  const handleAddFacility = async () => {
    if (!newFacilityName || !newFacilityDesc) return;
    const newFacility = {
      id: Date.now(),
      name: newFacilityName,
      description: newFacilityDesc,
      icon: newFacilityIcon
    };
    
    const updatedFacilities = [...facilities, newFacility];
    setFacilities(updatedFacilities);
    setIsFacilityModalOpen(false);
    setNewFacilityName('');
    setNewFacilityDesc('');
    setNewFacilityIcon('Wifi');

    const res = await updateFacilities(updatedFacilities);
    if (res.success) {
      showToast('Facility added successfully!');
    } else {
      showToast('Failed to save facility.');
    }
  };

  const handleDeleteFacility = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      const updatedFacilities = facilities.filter(f => f.id !== id);
      setFacilities(updatedFacilities);
      
      const res = await updateFacilities(updatedFacilities);
      if (res.success) {
        showToast('Facility deleted successfully!');
      } else {
        showToast('Failed to delete facility.');
      }
    }
  };

  // Add Room Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState('Standard');
  const [newRoomFloor, setNewRoomFloor] = useState('1');
  const [newRoomPrice, setNewRoomPrice] = useState('');
  const [newRoomFeatures, setNewRoomFeatures] = useState('AC, WiFi');
  
  const handleAddRoom = async () => {
    if (!newRoomNumber || !newRoomPrice) {
      showToast('Room number and price are required!');
      return;
    }

    const priceNum = parseInt(newRoomPrice.replace(/[^0-9]/g, ''), 10);
    const floorNum = parseInt(newRoomFloor, 10);
    const featuresArray = newRoomFeatures.split(',').map(f => f.trim()).filter(f => f);

    const payload = {
      room_number: newRoomNumber,
      floor: floorNum || 1,
      type: newRoomType,
      price: priceNum || 0,
      features: JSON.stringify(featuresArray),
      imageUrl: '/assets/rooms/room_101.png', // Default placeholder
    };

    const res = await addRoom(payload);
    if (res.success && res.data) {
      showToast('Room added successfully!');
      setIsRoomModalOpen(false);
      // Reset form
      setNewRoomNumber('');
      setNewRoomPrice('');
      
      // Update local state by converting server object to local list format
      const formattedRoom = {
        id: res.data.id,
        name: `Room ${res.data.room_number} - ${res.data.type}`,
        image: res.data.imageUrl || '/assets/rooms/default.jpg',
        price: `Rp ${Number(res.data.price).toLocaleString('id-ID')}`,
        amenities: res.data.features ? JSON.parse(res.data.features) : [],
      };
      setRooms([...rooms, formattedRoom]);
    } else {
      showToast(res.error || 'Failed to add room.');
    }
  };
  
  const getFacilityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wifi': return <Wifi className="w-5 h-5" />;
      case 'WashingMachine': return <WashingMachine className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Dumbbell': return <Dumbbell className="w-5 h-5" />;
      case 'Car': return <Car className="w-5 h-5" />;
      case 'Coffee': return <Coffee className="w-5 h-5" />;
      case 'Tv': return <Tv className="w-5 h-5" />;
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
              {['Hero Section', 'Facilities'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveConfigTab(tab as any)}
                  className={`py-3 sm:py-4 px-2 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                    activeConfigTab === tab 
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
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
                  <button 
                    onClick={() => setIsFacilityModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                  >
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
                              <button 
                                onClick={() => handleDeleteFacility(facility.id)}
                                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                    <Link 
                      href="/"
                      target="_blank"
                      className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-colors"
                    >
                      Preview Landing Page
                    </Link>
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
            <a href="mailto:adventurecreature@gmail.com" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-900 transition-colors hover:underline underline-offset-2">
                Contact Us
              </a>
          </div>
        </div>
      </footer>
      {/* Add Facility Modal */}
      {isFacilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Facility</h3>
              <button onClick={() => setIsFacilityModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Facility Name</label>
                <input 
                  type="text" 
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Free Coffee"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea 
                  value={newFacilityDesc}
                  onChange={(e) => setNewFacilityDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Enjoy freshly brewed coffee every morning..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Icon</label>
                <select 
                  value={newFacilityIcon}
                  onChange={(e) => setNewFacilityIcon(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Wifi">Wi-Fi</option>
                  <option value="WashingMachine">Washing Machine</option>
                  <option value="ShieldCheck">Security / Shield</option>
                  <option value="Dumbbell">Gym / Fitness</option>
                  <option value="Car">Parking / Car</option>
                  <option value="Coffee">Cafe / Coffee</option>
                  <option value="Tv">TV / Entertainment</option>
                </select>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <span>Icon Preview:</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    {getFacilityIcon(newFacilityIcon)}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleAddFacility}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors mt-2"
              >
                Add Facility
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
