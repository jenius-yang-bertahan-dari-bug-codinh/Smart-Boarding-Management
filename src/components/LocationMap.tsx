import React from 'react';
import { MapPin, Mail } from 'lucide-react';

const LocationMap: React.FC = () => {
  return (
    <section id="location" className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Our Location</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
              Conveniently located in the heart of the city, close to public transport and essential amenities.
            </p>
          </div>

          <div className="space-y-4">
            {/* Address Card */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-slate-100/80 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Address</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">6°17&apos;01.0&quot;S 107°10&apos;02.3&quot;E (Cikarang Pusat, Bekasi, Jawa Barat)</div>
              </div>
            </div>

            {/* Email Card - Clickable direct to Gmail Compose */}
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=papikost123456@gmail.com&su=Inquiry%20Papikost" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-slate-100/80 dark:border-slate-700 flex items-center gap-4 hover:shadow-md hover:border-blue-500/30 transition-all duration-200 group cursor-pointer block"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Email Address
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-all">papikost123456@gmail.com</div>
              </div>
            </a>
          </div>
        </div>

        {/* Map Column */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100/50 dark:border-slate-700 h-72 sm:h-96">
          <iframe
            title="map"
            className="w-full h-full border-0"
            src="https://www.google.com/maps?q=6%C2%B017'01.0%22S+107%C2%B010'02.3%22E&z=17&output=embed"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default LocationMap;

