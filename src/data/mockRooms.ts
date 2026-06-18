import { Room } from '../types';

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Room 101 - Deluxe',
    price: '$250/mo',
    status: 'Available',
    features: ['Double Bed', 'En-suite'],
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Room 102 - Suite',
    price: '$350/mo',
    status: 'Full',
    features: ['Queen Bed', 'Smart TV'],
    imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Room 205 - Standard',
    price: '$160/mo',
    status: 'Available',
    features: ['Single Bed', 'Workspace'],
    imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

