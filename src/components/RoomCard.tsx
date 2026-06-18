import React from 'react';
import Link from 'next/link';
import { Room } from '../types';
import { Bed, Bath, Tv, Laptop, Wind, Utensils, Info } from 'lucide-react';

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
  const isAvailable = room.status === 'Available';

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col group">
      {/* Image Block with Absolute Badge */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={room.imageUrl}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-md ${isAvailable
            ? 'bg-emerald-50/95 text-emerald-700 border border-emerald-100/50'
            : 'bg-rose-50/95 text-rose-700 border border-rose-100/50'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {room.status}
        </span>
      </div>

      {/* Content Block */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title and Price */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {room.name}
            </h4>
            <div className="text-blue-600 font-extrabold text-lg shrink-0">
              {room.price}
            </div>
          </div>

          {/* Features Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {room.features.map((feature, idx) => (
              <span
                key={idx}
                className="bg-slate-50 border border-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
              >
                {getFeatureIcon(feature)}
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {isAvailable ? (
            <Link
              href={`/checkout?roomId=${room.id}`}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-xs hover:shadow-md hover:shadow-orange-500/10 cursor-pointer text-center block"
            >
              Book Now
            </Link>
          ) : (
            <button className="w-full bg-white hover:bg-slate-50 border border-blue-600 text-blue-600 font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer text-center block">
              Not Available
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default RoomCard;

