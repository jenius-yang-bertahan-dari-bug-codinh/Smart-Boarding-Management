'use server';

import prisma from '@/lib/prisma';

export async function getAdminMembers() {
  try {
    const members = await prisma.member.findMany({
      include: {
        room: true,
      },
      orderBy: { name: 'asc' }
    });

    const mappedMembers = members.map(m => ({
      id: m.id.toString(),
      stId: `#ST-${m.id.toString().padStart(4, '0')}`,
      name: m.name,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // default avatar
      room: m.room ? `Room ${m.room.room_number}` : 'No Room',
      floor: m.room ? `Floor ${m.room.floor}` : '-',
      email: m.phone, // fallback to phone if no email
      phone: m.phone,
      joinDate: 'Oct 15, 2023', // Hardcode fallback since we don't have join date
      leaseEnd: m.due_date ? m.due_date.toISOString().split('T')[0] : 'N/A',
      status: m.status === 'active' ? 'Active' : (m.status === 'pending' ? 'Pending' : 'Past Member')
    }));

    return { success: true, data: mappedMembers };
  } catch (error) {
    console.error('Error fetching admin members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}
