"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Room } from '../types';
import { Bed, Bath, Tv, Laptop, Wind, Utensils, Info, X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface RoomCardProps {
  room: Room;
}

const getFeatureIcon = (feature: string) => {
  const f = feature.toLowerCase();
  if (f.includes('bed')) return <Bed className="w-3.5 h-3.5 text-slate-500" />;
  if (f.includes('bath') || f.includes('suite')) return <Bath className="w-3.5 h-3.5 text-slate-500" />;
  if (f.includes('tv')) return <Tv className="w-3.5 h-3.5 text-slate-500" />;
  if (f.includes('workspace') || f.includes('desk') || f.includes('laptop')) return <Laptop className="w-3.5 h-3.5 text-slate-500" />;
  if (f.includes('ac') || f.includes('fan')) return <Wind className="w-3.5 h-3.5 text-slate-500" />;
  if (f.includes('kitchen')) return <Utensils className="w-3.5 h-3.5 text-slate-500" />;
  return <Info className="w-3.5 h-3.5 text-slate-500" />;
};

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentStatus = room.status?.toLowerCase() || '';
  const isAvailable = currentStatus === 'available';
  const isBooked = currentStatus === 'booked' || currentStatus === 'pending';
  const displayStatus = isAvailable ? 'Available' : isBooked ? 'Booked' : 'Full';

  const mockDescription = "Experience premium comfort in our Deluxe Room. Meticulously designed for the modern resident, this space features a plush double bed, a dedicated ergonomic study area, and a pristine en-suite bathroom. Generous natural light and minimalist furnishings create a serene environment perfect for both focused work and relaxation.";
  const mockLocation = "North Wing, 1st Floor";

  return (
    <>
      <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col group">
      {/* Image Block with Absolute Badge */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={room.imageUrl}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-md ${
            isAvailable
              ? 'bg-emerald-50/95 text-emerald-700 border border-emerald-100/50'
              : isBooked
              ? 'bg-amber-50/95 text-amber-700 border border-amber-100/50'
              : 'bg-rose-50/95 text-rose-700 border border-rose-100/50'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isAvailable
              ? 'bg-emerald-500 animate-pulse'
              : isBooked
              ? 'bg-amber-500 animate-pulse'
              : 'bg-rose-500'
          }`} />
          {displayStatus}
        </span>
      </div>

      {/* Content Block */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title and Price */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {room.name}
            </h4>
            <div className="text-blue-600 dark:text-blue-400 font-extrabold text-lg shrink-0">
              {room.price}
            </div>
          </div>

          {/* Features Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {room.features.map((feature, idx) => (
              <span
                key={idx}
                className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
              >
                {getFeatureIcon(feature)}
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-blue-700 dark:text-blue-400 font-semibold text-sm hover:underline w-fit text-left"
          >
            View Details &rarr;
          </button>
          {isAvailable ? (
            <Link
              href={`/checkout?roomId=${room.id}`}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer text-center block"
            >
              Book Now
            </Link>
          ) : isBooked ? (
             <button className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 cursor-not-allowed text-center block">
              Waiting for Approval
            </button>
          ) : (
            <button className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer text-center block">
              Notify Me
            </button>
          )}
        </div>
      </div>
    </article>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Image Slider Mockup */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 p-2 rounded-xl shadow-sm transition-colors text-slate-700 dark:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 p-2 rounded-xl shadow-sm transition-colors text-slate-700 dark:text-slate-200">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 p-2 rounded-xl shadow-sm transition-colors text-slate-700 dark:text-slate-200">
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <div className="w-2 h-2 rounded-full bg-white/70"></div>
                <div className="w-2 h-2 rounded-full bg-white/70"></div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {room.name}
                  </h3>
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                    <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                    {mockLocation}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-blue-900 dark:text-blue-400 font-bold text-2xl">
                    {room.price}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                    Per Month
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700/50 my-6"></div>

              <div className="flex flex-wrap gap-2.5">
                {room.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium"
                  >
                    {getFeatureIcon(feature)}
                    {feature}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Description
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {mockDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomCard;

