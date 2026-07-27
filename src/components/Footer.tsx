import React from 'react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#e2e8f0] dark:bg-slate-950 transition-colors py-6 md:py-8 border-t border-slate-300/40 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-xl font-bold text-blue-900 dark:text-blue-400 tracking-tight">
              Papikost
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            &copy; 2024 Papikost Boarding House Management. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
