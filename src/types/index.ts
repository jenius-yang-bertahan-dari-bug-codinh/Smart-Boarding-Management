export type RoomStatus = 'Available' | 'Full';

export interface Room {
  id: string;
  name: string;
  price: string;
  status: RoomStatus;
  features: string[];
  imageUrl: string;
}
