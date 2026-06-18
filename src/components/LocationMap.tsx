import React from 'react';
import { MapPin, Phone } from 'lucide-react';

const LocationMap: React.FC = () => {
  return (
    <section id="location" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Location</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base leading-relaxed">
              Conveniently located in the heart of the city, close to public transport and essential amenities.
            </p>
          </div>

          <div className="space-y-4">
            {/* Address Card */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100/80 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">Jl. Kayu Putih No. 12, Jakarta</div>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100/80 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">+62 812-3456-7890</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Column */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100/50 h-72 sm:h-96">
          <iframe
            title="map"
            className="w-full h-full border-0"
            src="https://www.google.com/maps?q=Jakarta&output=embed"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default LocationMap;

