'use server';

import prisma from '@/lib/prisma';

export async function getAdminLandingConfig() {
  try {
    const profile = await prisma.boardingHouseProfile.findFirst();
    let parsedFacilities = [
      { id: 1, name: 'High-Speed Wi-Fi', description: 'Stay connected with dedicated gigabit fiber internet...', icon: 'Wifi' },
      { id: 2, name: 'Laundry Services', description: '24/7 self-service laundry room equipped...', icon: 'WashingMachine' },
      { id: 3, name: '24/7 Security', description: 'Advanced biometric access...', icon: 'ShieldCheck' },
      { id: 4, name: 'Modern Gym', description: 'Fully equipped fitness center...', icon: 'Dumbbell' }
    ];

    if (profile && profile.facilities) {
      try {
        parsedFacilities = JSON.parse(profile.facilities);
      } catch (e) {
        console.warn('Failed to parse facilities JSON', e);
      }
    }

    const roomsData = await prisma.room.findMany({
      take: 4,
      orderBy: { price: 'desc' }
    });

    const mappedRooms = roomsData.map(r => ({
      id: r.id,
      image: r.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200',
      name: `${r.type} ${r.room_number}`,
      price: `$${r.price}`,
      amenities: r.features ? (r.features.startsWith('[') ? JSON.parse(r.features) : r.features.split(',')) : ['WiFi']
    }));

    return { 
      success: true, 
      data: {
        facilities: parsedFacilities,
        rooms: mappedRooms.length > 0 ? mappedRooms : [
          { id: 1, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200', name: 'Premium Sky Suite', price: '$1,200', amenities: ['WiFi 6', 'AC', 'Smart Lock'] },
          { id: 2, image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=200', name: 'Standard Solo Studio', price: '$850', amenities: ['WiFi', 'En-suite'] }
        ]
      }
    };
  } catch (error) {
    console.error('Error fetching admin landing config:', error);
    return { success: false, error: 'Failed to fetch config' };
  }
}
