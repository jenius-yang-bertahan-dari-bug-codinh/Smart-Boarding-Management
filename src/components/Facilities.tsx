import React from 'react';
import { Wifi, Snowflake, WashingMachine, ShieldCheck, Dumbbell, Car, Coffee, Tv } from 'lucide-react';

interface Facility {
  id: number | string;
  name: string;
  description: string;
  icon: string;
}

interface Props {
  items: Facility[];
}

const getFacilityIcon = (iconName: string) => {
  switch (iconName) {
    case 'Wifi': return <Wifi className="w-5 h-5 stroke-[2.2]" />;
    case 'WashingMachine': return <WashingMachine className="w-5 h-5 stroke-[2.2]" />;
    case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 stroke-[2.2]" />;
    case 'Dumbbell': return <Dumbbell className="w-5 h-5 stroke-[2.2]" />;
    case 'Car': return <Car className="w-5 h-5 stroke-[2.2]" />;
    case 'Coffee': return <Coffee className="w-5 h-5 stroke-[2.2]" />;
    case 'Tv': return <Tv className="w-5 h-5 stroke-[2.2]" />;
    default: return <Wifi className="w-5 h-5 stroke-[2.2]" />; // Fallback
  }
};

const Facilities: React.FC<Props> = ({ items }) => {
  return (
    <section id="facilities" className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Premium Facilities</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2.5 text-sm sm:text-base">Everything you need for a comfortable stay.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {items.map((it) => {
            return (
              <div
                key={it.id}
                className="w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(20%-1.2rem)] flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 rounded-xl mb-4 group-hover:bg-blue-100/80 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                  {getFacilityIcon(it.icon)}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-center tracking-wide group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {it.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Facilities;

