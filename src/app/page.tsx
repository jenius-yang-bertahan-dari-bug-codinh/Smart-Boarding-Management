import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Facilities from '@/components/Facilities';
import RoomCard from '@/components/RoomCard';
import LocationMap from '@/components/LocationMap';
import Footer from '@/components/Footer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Home() {
  const rooms = await prisma.room.findMany();
  
  const formattedRooms = rooms.map(room => ({
    id: room.id.toString(),
    name: `Room ${room.room_number} - ${room.type}`,
    price: `$${room.price}/mo`,
    status: room.status,
    features: JSON.parse(room.features),
    imageUrl: room.imageUrl,
  }));

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Content Area (padded top & bottom for sticky components) */}
      <div className="flex-grow pt-20 pb-44 md:pb-36">
        {/* Hero Section */}
        <Hero />
        
        {/* Facilities Section */}
        <Facilities />

        {/* Room Section */}
        <section id="rooms" className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-10 text-left">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Real-Time Room Availability</h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">Find the perfect room that fits your needs and budget.</p>
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

