'use server';

import prisma from '@/lib/prisma';

export async function getAdminRooms() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        members: {
          where: { status: 'active' },
          take: 1
        }
      },
      orderBy: { room_number: 'asc' }
    });

    const mappedRooms = rooms.map(room => {
      const activeMember = room.members.length > 0 ? room.members[0] : null;
      let initials = '';
      if (activeMember) {
        const parts = activeMember.name.split(' ');
        initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      }

      return {
        id: room.id.toString(),
        roomNo: room.room_number,
        floor: `Floor ${room.floor}`,
        type: room.type,
        price: `$${room.price}`,
        status: activeMember ? 'Active Member' : (room.status === 'Maintenance' ? 'Maintenance' : 'Empty Room'),
        color: activeMember ? 'bg-blue-500' : '',
        member: activeMember ? {
          initials,
          name: activeMember.name,
          email: activeMember.phone, // fallback to phone if no email on member
          leaseStart: 'N/A' // we don't have leaseStart in schema right now
        } : null
      };
    });

    return { success: true, data: mappedRooms };
  } catch (error) {
    console.error('Error fetching admin rooms:', error);
    return { success: false, error: 'Failed to fetch rooms' };
  }
}
