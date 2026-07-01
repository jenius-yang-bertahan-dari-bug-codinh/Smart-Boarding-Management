"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ArrowLeft, User, Bell, Shield, Paintbrush, Smartphone, Check, Settings, Moon, Sun } from 'lucide-react';
import Logo from '@/components/Logo';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance'>('profile');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Paintbrush },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border-l-4 border-l-blue-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl px-4 py-3 max-w-xs flex items-center gap-3">
          <Check className="w-4 h-4 text-blue-900 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-grow">{toast}</p>
        </div>
      )}

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Logo size={26} />
            <div className="leading-tight">
              <span className="text-sm font-extrabold text-blue-900 block tracking-tight">SmartStay</span>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">Settings</span>
            </div>
          </Link>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-blue-900 tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-900" />
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Manage your personal preferences and system configurations.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-900 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 dark:bg-slate-900 hover:text-slate-800 dark:hover:text-white dark:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-700' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Settings Panel */}
          <div className="flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSave}>
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Profile Details</h2>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">Update your name and contact information.</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-slate-50" />
                    <button type="button" className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors">Change Avatar</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                      <input type="text" defaultValue="Admin" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                      <input type="text" defaultValue="User" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <input type="email" defaultValue="admin@smartstay.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Notification Preferences</h2>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">Choose what you want to be notified about.</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: 'New Bookings', desc: 'Get alerted when a new booking is requested.' },
                      { title: 'Maintenance Requests', desc: 'Receive notifications for new emergency requests.' },
                      { title: 'Payment Reminders', desc: 'Alerts for overdue payments.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Security</h2>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">Manage your password and security settings.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Appearance</h2>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">Customize the UI theme.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => { if(mounted) setTheme('light'); showToast('Theme set to Light'); }} className={`border-2 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${mounted && theme === 'light' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 bg-slate-50 dark:bg-slate-950'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mounted && theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Sun className="w-5 h-5" />
                      </div>
                      <span className={`text-sm font-bold ${mounted && theme === 'light' ? 'text-blue-900' : 'text-slate-600 dark:text-slate-400'}`}>Light Mode</span>
                    </button>
                    <button type="button" onClick={() => { if(mounted) setTheme('dark'); showToast('Theme set to Dark'); }} className={`border-2 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${mounted && theme === 'dark' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 bg-slate-50 dark:bg-slate-950'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mounted && theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Moon className="w-5 h-5" />
                      </div>
                      <span className={`text-sm font-bold ${mounted && theme === 'dark' ? 'text-blue-900' : 'text-slate-600 dark:text-slate-400'}`}>Dark Mode</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button type="submit" className="bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
