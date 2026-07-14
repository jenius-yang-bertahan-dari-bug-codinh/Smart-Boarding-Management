"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Settings } from 'lucide-react';
import Logo from '@/components/Logo';

interface AdminNavbarProps {
  activeTab: 'Dashboard' | 'Rooms' | 'Reservations' | 'Billing' | 'Members' | 'Maintenance' | 'Landing Page' | 'Settings';
}

export default function AdminNavbar({ activeTab }: AdminNavbarProps) {
  const router = useRouter();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Booking Request', message: 'Jane Doe requested Room 201.', time: '5m ago', unread: true },
    { id: 2, title: 'Maintenance Alert', message: 'AC broken in Room 305.', time: '1h ago', unread: true },
    { id: 3, title: 'Payment Received', message: 'John Smith paid $300.', time: '2h ago', unread: false },
  ]);

  const NAV_TABS = ['Dashboard', 'Rooms', 'Reservations', 'Billing', 'Members', 'Maintenance', 'Landing Page'] as const;

  const handleTabClick = (tab: string) => {
    if      (tab === 'Dashboard')    router.push('/admin');
    else if (tab === 'Rooms')        router.push('/admin/rooms');
    else if (tab === 'Reservations') router.push('/admin/reservations');
    else if (tab === 'Billing') router.push('/admin/billing');
    else if (tab === 'Members') router.push('/admin/members');
    else if (tab === 'Maintenance') router.push('/admin/maintenance');
    else if (tab === 'Landing Page') router.push('/admin/landing-page');
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        
        {/* Left: Logo */}
        <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
          <Logo size={28} />
          <span className="text-xl font-bold text-blue-900 tracking-tight">
            SmartStay Admin
          </span>
        </Link>
        
        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-6 flex-1">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`pb-1.5 pt-1 text-sm font-semibold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'border-blue-900 text-blue-900' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-blue-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Icons, Profile */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Icons Area */}
          <div className="flex items-center gap-3">
            {/* Notification Bell & Dropdown */}
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5 stroke-[2]" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <button type="button" onClick={() => setNotifications(notifications.map(n => ({...n, unread: false})))} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.filter(n => n.unread).length === 0 ? (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.filter(n => n.unread).map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors bg-blue-50/50 dark:bg-blue-900/20">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={() => { setNotificationsOpen(false); }} className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Gear */}
            <button 
              type="button" 
              onClick={() => router.push('/admin/settings')}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <Settings className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Admin Profile"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
