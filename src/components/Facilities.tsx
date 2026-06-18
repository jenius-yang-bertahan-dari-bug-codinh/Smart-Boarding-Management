import React from 'react';
import { Wifi, Snowflake, WashingMachine, Shield, Refrigerator } from 'lucide-react';

const items = [
  { id: 1, label: 'High-speed Wi-Fi', Icon: Wifi },
  { id: 2, label: 'AC', Icon: Snowflake },
  { id: 3, label: 'Laundry', Icon: WashingMachine },
  { id: 4, label: '24/7 Security', Icon: Shield },
  { id: 5, label: 'Shared Kitchen', Icon: Refrigerator },
];

const Facilities: React.FC = () => {
  return (
    <section id="facilities" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Premium Facilities</h2>
          <p className="text-slate-500 mt-2.5 text-sm sm:text-base">Everything you need for a comfortable stay.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {items.map((it) => {
            const IconComponent = it.Icon;
            return (
              <div
                key={it.id}
                className="flex flex-col items-center justify-center bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-900 rounded-xl mb-4 group-hover:bg-blue-100/80 transition-colors duration-300">
                  <IconComponent className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-700 text-center tracking-wide group-hover:text-slate-900 transition-colors">
                  {it.label}
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

