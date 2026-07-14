import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Facilities from '@/components/Facilities';
import RoomCard from '@/components/RoomCard';
import LocationMap from '@/components/LocationMap';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';

export default async function Home() {
  const rooms = await prisma.room.findMany();
  
  const formattedRooms = rooms.map(room => {
    let parsedFeatures: string[] = [];
    try {
      parsedFeatures = room.features ? JSON.parse(room.features) : [];
    } catch (e) {
      if (typeof room.features === 'string' && room.features.trim() !== '') {
        parsedFeatures = room.features.split(',').map(f => f.trim());
      }
    }
    
    return {
      id: room.id.toString(),
      name: `Room ${room.room_number} - ${room.type}`,
      price: `$${room.price}/mo`,
      status: room.status,
      features: parsedFeatures,
      imageUrl: room.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    };
  });

  return (
    <main className="bg-slate-50 dark:bg-slate-900 transition-colors min-h-screen font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Content Area (padded top & bottom for sticky components) */}
      <div className="flex-grow pt-20 pb-44 md:pb-36">
        {/* Hero Section */}
        <Hero />
        
        {/* Facilities Section */}
        <Facilities />

        {/* Room Section */}
        <section id="rooms" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-10 text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Real-Time Room Availability</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">Find the perfect room that fits your needs and budget.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {formattedRooms.map((room) => (
                <RoomCard key={room.id} room={room as any} />
              ))}
            </div>
          </div>
        </section>

        {/* Location Section */}
        <LocationMap />
      </div>

      {/* Sticky Footer */}
      <Footer />
    </main>
  );
}

