"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { Moon, Sun, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check initial state
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Special case for home (top of page)
      if (scrollPosition < 100) {
        setActiveSection('home');
        return;
      }

      const sections = ['facilities', 'rooms', 'location'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          // Adding a 200px offset to trigger highlight before the section exactly hits the top
          if (scrollPosition >= offsetTop - 200 && scrollPosition < offsetTop + offsetHeight - 200) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call once to set initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Close mobile menu when window is resized to md or larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getLinkClass = (section: string) => {
    if (pathname !== '/') {
      return "text-slate-600 dark:text-slate-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors pb-1.5 pt-1 font-medium text-sm sm:text-base";
    }

    const isActive = activeSection === section;
    return isActive
      ? "text-blue-900 dark:text-blue-400 font-semibold border-b-2 border-blue-900 dark:border-blue-400 pb-1.5 pt-1 transition-all text-sm sm:text-base"
      : "text-slate-600 dark:text-slate-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors pb-1.5 pt-1 font-medium text-sm sm:text-base";
  };

  const getMobileLinkClass = (section: string) => {
    const baseClass = "block px-6 py-4 text-sm font-bold tracking-widest transition-colors uppercase";
    
    if (pathname !== '/') {
      return `${baseClass} text-slate-500 dark:text-slate-400`;
    }

    const isActive = activeSection === section;
    return isActive
      ? `${baseClass} text-blue-700 dark:text-blue-400 border-l-4 border-blue-700 dark:border-blue-400 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent`
      : `${baseClass} text-slate-500 dark:text-slate-400 border-l-4 border-transparent`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white dark:bg-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Sisi Kiri: Logo dengan Ikon Rumah Baru */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
            <Logo size={36} />
            <span className="text-xl font-bold text-blue-900 dark:text-blue-400 tracking-tight">
              SmartStay
            </span>
          </Link>
        </div>

        {/* Sisi Tengah: Tautan Navigasi */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={getLinkClass('home')}
            onClick={() => setActiveSection('home')}
          >
            Home
          </Link>
          <Link 
            href="/#facilities" 
            className={getLinkClass('facilities')}
            onClick={() => setActiveSection('facilities')}
          >
            Facilities
          </Link>
          <Link 
            href="/#rooms" 
            className={getLinkClass('rooms')}
            onClick={() => setActiveSection('rooms')}
          >
            Rooms
          </Link>
          <Link 
            href="/#location" 
            className={getLinkClass('location')}
            onClick={() => setActiveSection('location')}
          >
            Location
          </Link>
        </nav>

        {/* Right Side: Member Login & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Member Login
          </Link>
          <button
            onClick={toggleDarkMode}
            className={`p-2 transition-colors ${
              isMobileMenuOpen 
                ? 'border border-blue-600 dark:border-blue-500 rounded-md text-slate-800 dark:text-slate-200' 
                : 'rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-800 dark:text-slate-200 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white dark:bg-slate-900 border-t-2 border-blue-600 dark:border-blue-500 flex flex-col transition-colors z-40 overflow-y-auto">
          <nav className="flex flex-col py-4">
            <Link 
              href="/" 
              className={getMobileLinkClass('home')}
              onClick={() => { setActiveSection('home'); setIsMobileMenuOpen(false); }}
            >
              HOME
            </Link>
            <Link 
              href="/#facilities" 
              className={getMobileLinkClass('facilities')}
              onClick={() => { setActiveSection('facilities'); setIsMobileMenuOpen(false); }}
            >
              FACILITIES
            </Link>
            <Link 
              href="/#rooms" 
              className={getMobileLinkClass('rooms')}
              onClick={() => { setActiveSection('rooms'); setIsMobileMenuOpen(false); }}
            >
              ROOMS
            </Link>
            <Link 
              href="/#location" 
              className={getMobileLinkClass('location')}
              onClick={() => { setActiveSection('location'); setIsMobileMenuOpen(false); }}
            >
              LOCATION
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
