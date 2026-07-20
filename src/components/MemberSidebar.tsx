"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  Megaphone, 
  Settings, 
  LogOut 
} from 'lucide-react';
import Logo from '@/components/Logo';
import MemberSettingsModal from '@/components/MemberSettingsModal';

interface MemberSidebarProps {
  activeTab: 'Overview' | 'Payments' | 'Service Requests' | 'Announcements';
  user: any;
  onRefresh?: () => void | Promise<void>;
}

export default function MemberSidebar({ activeTab, user, onRefresh }: MemberSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      window.location.href = '/login';
    }
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, tab: 'Overview' },
    { name: 'Payments', href: '/payments', icon: CreditCard, tab: 'Payments' },
    { name: 'Service Requests', href: '/service-requests', icon: Wrench, tab: 'Service Requests' },
    { name: 'Announcements', href: '/announcements', icon: Megaphone, tab: 'Announcements' },
  ];

  return (
    <>
      {/* Spacer div to hold exactly 256px width on tablet/desktop so right-side container sits beside the fixed sidebar */}
      <div className="hidden md:block md:w-64 md:shrink-0" />

      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-100 p-6 flex flex-col justify-between shrink-0 md:fixed md:inset-y-0 md:left-0 md:h-screen md:z-30 md:overflow-y-auto">
        <div>
          {/* Top Brand Section */}
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <Logo size={32} />
            <span className="text-xl font-bold text-blue-900 tracking-tight">
              Papikost
            </span>
          </div>

          {/* User Profile Avatar Section */}
          <div className="flex flex-col items-center mb-6 py-4 border-y border-slate-100/60">
            <img
              src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"}
              alt={user?.name || "Member Avatar"}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80";
              }}
            />
            <span className="text-xs font-semibold text-slate-400">Welcome back,</span>
            <span className="text-sm font-bold text-blue-900 mt-0.5">{user?.name || 'Member'}</span>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
              Premium Member
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-900 font-bold'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-semibold text-sm transition-all cursor-pointer text-left"
            >
              <Settings className="w-4.5 h-4.5 stroke-[1.8]" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Section */}
        <div className="mt-8 pt-4 border-t border-slate-100 space-y-1">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 font-semibold text-xs sm:text-sm transition-all cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-slate-400 stroke-[1.8]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      <MemberSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onRefresh={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}
