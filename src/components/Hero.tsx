import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="bg-slate-50 flex flex-col">
      {/* Hero Content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Konten Kiri (Headline, Paragraf, CTA) */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Find Your Smart &amp; <span className="text-blue-600">Comfortable</span> Living Space
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            Experience modern living with our digitally-managed boarding houses. Enjoy premium
            amenities, seamless bookings, and a secure environment designed for your comfort and
            peace of mind.
          </p>
          <div className="pt-2">
            <a
              href="#rooms"
              className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20"
            >
              Check Room Availability
            </a>
          </div>
        </div>

        {/* Konten Kanan: Foto Interior Bedroom Baru */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100/50 bg-slate-200 aspect-[4/3] sm:aspect-auto">
            <img
              src="/bedroom_hero.png"
              alt="Cozy Minimalist Bedroom Workspace"
              className="w-full h-full sm:h-80 lg:h-96 object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
