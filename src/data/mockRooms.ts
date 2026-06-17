import { Room } from '../types';

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Room 101 - Deluxe',
    price: '$250/mo',
    status: 'Available',
    features: ['Double Bed', 'En-suite', 'AC'],
    imageUrl: 'https://images.unsplash.com/photo-1522771731470-410220bcbf15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Room 102 - Standard',
    price: '$200/mo',
    status: 'Full',
    features: ['Single Bed', 'Shared Bath', 'AC'],
    imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Room 201 - Premium Suite',
    price: '$350/mo',
    status: 'Available',
    features: ['King Bed', 'En-suite', 'AC', 'Balcony'],
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Room 202 - Deluxe',
    price: '$250/mo',
    status: 'Full',
    features: ['Double Bed', 'En-suite', 'AC'],
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55dd1b31120?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'Room 203 - Standard',
    price: '$180/mo',
    status: 'Available',
    features: ['Single Bed', 'Shared Bath', 'Fan'],
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    name: 'Room 301 - Studio',
    price: '$400/mo',
    status: 'Available',
    features: ['Queen Bed', 'En-suite', 'AC', 'Kitchenette'],
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];
