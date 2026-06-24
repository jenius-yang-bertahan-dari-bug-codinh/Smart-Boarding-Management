"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Globe, User, Shield, Check } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'public' | 'guest' | 'admin';
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole }) => {
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const roles = [
    {
      id: 'public',
      label: 'Main / Public Page',
      path: '/',
      Icon: Globe
    },
    {
      id: 'guest',
      label: 'Guest / Member Portal',
      path: '/dashboard',
      Icon: User
    },
    {
      id: 'admin',
      label: 'Admin / Management',
      path: '/admin',
      Icon: Shield
    }
  ];

  const currentLabel = 
    currentRole === 'public' ? 'Public' :
    currentRole === 'guest' ? 'Guest' : 'Admin';

  const handleRoleSelect = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer focus:outline-none"
      >
        <ArrowLeftRight className="w-4 h-4 text-slate-400 stroke-[2]" />
        <span>View: {currentLabel}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-slate-100 rounded-2xl shadow-lg ring-1 ring-black/5 focus:outline-none z-50 p-1.5">
          <div className="py-1 space-y-0.5">
            {roles.map((role) => {
              const RoleIcon = role.Icon;
              const isActive = role.id === currentRole;

              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm rounded-xl text-left transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 text-blue-900 font-bold' 
                      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <RoleIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-900 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                  <span className="flex-grow">{role.label}</span>
                  {isActive && <Check className="w-4 h-4 text-blue-900 stroke-[2.5] ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;
