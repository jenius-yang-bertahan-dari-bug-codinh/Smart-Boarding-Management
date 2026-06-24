"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, User, Shield, Check } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = [
    { id: 'public',  label: 'Main / Public Page',    path: '/',          Icon: Globe  },
    { id: 'guest',   label: 'Guest / Member Portal',  path: '/dashboard', Icon: User   },
    { id: 'admin',   label: 'Admin / Management',     path: '/admin',     Icon: Shield },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#e2e8f0] dark:bg-slate-950 transition-colors py-6 md:py-8 border-t border-slate-300/40 dark:border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left Side: Logo (role-switch trigger) + brand text + copyright */}
        <div className="flex flex-col items-center md:items-start gap-2.5">
          <div className="flex items-center gap-2.5">

            {/* House icon is the dropdown trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                title="Switch view"
                className="p-1 rounded-xl hover:bg-slate-300/40 dark:hover:bg-slate-800 active:bg-slate-300/60 transition-all cursor-pointer focus:outline-none"
              >
                <Logo size={30} />
              </button>

              {/* Dropdown menu — pops upward */}
              {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg ring-1 ring-black/5 p-1.5 z-50">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1.5 pb-1">
                    Switch View
                  </p>
                  <div className="space-y-0.5">
                    {roles.map((role) => {
                      // Detect current role from the window pathname
                      const isActive =
                        typeof window !== 'undefined' &&
                        (role.path === '/'
                          ? window.location.pathname === '/'
                          : window.location.pathname.startsWith(role.path));

                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            router.push(role.path);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 font-bold'
                              : 'text-slate-600 dark:text-slate-300 hover:text-blue-900 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
                          }`}
                        >
                          <role.Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-900 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span className="flex-grow">{role.label}</span>
                          {isActive && <Check className="w-4 h-4 text-blue-900 dark:text-blue-400 stroke-[2.5] ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <span className="text-xl font-bold text-blue-900 dark:text-blue-400 tracking-tight">
              SmartStay
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-left">
            &copy; 2024 SmartStay Boarding House Management. All rights reserved.
          </p>
        </div>

        {/* Right Side: Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:gap-x-8">
          <a href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
