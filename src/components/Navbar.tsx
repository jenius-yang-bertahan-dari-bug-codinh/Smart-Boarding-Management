import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Sisi Kiri: Logo dengan Ikon Rumah Baru */}
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-xl font-bold text-blue-900 tracking-tight">
            SmartStay
          </span>
        </div>

        {/* Sisi Tengah: Tautan Navigasi */}
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#" 
            className="text-slate-600 hover:text-blue-600 transition-colors pb-1.5 pt-1 font-medium text-sm sm:text-base"
          >
            Home
          </a>
          <a 
            href="#facilities" 
            className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1.5 pt-1 transition-all text-sm sm:text-base"
          >
            Facilities
          </a>
          <a 
            href="#rooms" 
            className="text-slate-600 hover:text-blue-600 transition-colors pb-1.5 pt-1 font-medium text-sm sm:text-base"
          >
            Rooms
          </a>
          <a 
            href="#location" 
            className="text-slate-600 hover:text-blue-600 transition-colors pb-1.5 pt-1 font-medium text-sm sm:text-base"
          >
            Location
          </a>
        </nav>

        {/* Right Side: Member Login Button */}
        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white font-bold px-4 py-2 rounded-xl transition-all duration-200 text-sm cursor-pointer block text-center"
          >
            Member Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
