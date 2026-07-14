export type RoomStatus = 'Available' | 'Full' | 'Booked';

export interface Room {
  id: string;
  name: string;
  price: string;
  status: RoomStatus;
  features: string[];
  imageUrl: string;
}
