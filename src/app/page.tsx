import Hero from '@/components/Hero';
import Facilities from '@/components/Facilities';
import RoomCard from '@/components/RoomCard';
import LocationMap from '@/components/LocationMap';
import { mockRooms } from '@/data/mockRooms';

export default function Home() {
  return (
    <main>
      <Hero />
      <Facilities />
      
      <section>
        <h2>Real-Time Room Availability</h2>
        <div>
          {mockRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      <LocationMap />
    </main>
  );
}
