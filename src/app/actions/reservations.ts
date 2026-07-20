'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAdminReservations() {
  try {
    const members = await prisma.member.findMany({
      include: {
        room: true,
      },
      orderBy: { id: 'desc' }
    });

    const mappedReservations = members.map(m => {
      let initials = 'U';
      if (m.name) {
        const parts = m.name.split(' ');
        initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      }

      return {
        rawId: m.id,
        id: `#RSV-${m.id.toString().padStart(4, '0')}`,
        tenant: m.name,
        initials,
        color: m.status === 'active' ? 'bg-blue-500' : (m.status === 'pending' ? 'bg-emerald-500' : 'bg-slate-500'),
        room: m.room ? `Room ${m.room.room_number}` : 'Unknown Room',
        term: m.due_date ? `Due: ${m.due_date.toISOString().split('T')[0]}` : 'Flexible',
        amount: m.room ? `Rp ${Number(m.room.price).toLocaleString('id-ID')}` : 'N/A',
        status: m.status === 'active' ? 'Confirmed' : (m.status === 'pending' ? 'Pending' : 'Cancelled')
      };
    });

    const rooms = await prisma.room.findMany();
    return { success: true, data: mappedReservations, rooms };
  } catch (error) {
    console.error('Error fetching admin reservations:', error);
    return { success: false, error: 'Failed to fetch reservations' };
  }
}

export async function updateReservationStatus(id: number, status: string) {
  try {
    const member = await prisma.member.update({
      where: { id },
      data: { status }
    });

    if (status === 'active') {
      // Also update payment to completed
      await prisma.payment.updateMany({
        where: { member_id: id },
        data: { status: 'completed' }
      });
      // And update room to Occupied
      await prisma.room.update({
        where: { id: member.room_id },
        data: { status: 'Occupied' }
      });
    } else if (status.toLowerCase() === 'cancelled' || status === 'inactive') {
      await prisma.room.update({
        where: { id: member.room_id },
        data: { status: 'Available' }
      });
    }

    revalidatePath('/');
    revalidatePath('/api/rooms');
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/rooms');

    return { success: true };
  } catch (error) {
    console.error('Error updating reservation:', error);
    return { success: false, error: 'Failed to update' };
  }
}

export async function createReservation(formData: FormData) {
  try {
    const tenantName = formData.get('tenantName') as string;
    const roomIdStr = formData.get('roomId') as string;
    const checkIn = formData.get('checkIn') as string;
    
    if (!tenantName || !roomIdStr) return { success: false, error: 'Missing fields' };
    
    // Check room availability first
    const room = await prisma.room.findUnique({ where: { room_number: roomIdStr } });
    if (!room) return { success: false, error: 'Room not found' };
    if (room.status !== 'Available') return { success: false, error: 'Room is no longer available' };

    // Create a new User for the tenant
    const dummyEmail = `${tenantName.replace(/\s+/g, '').toLowerCase()}${Date.now()}@example.com`;
    const newUser = await prisma.user.create({
      data: {
        email: dummyEmail,
        password: 'admin-created',
        role: 'tenant',
      }
    });

    await prisma.member.create({
      data: {
        name: tenantName,
        phone: 'N/A', // Default fallback
        status: 'pending', // lowercase pending to match the backend mapping logic
        due_date: new Date(checkIn),
        user: { connect: { id: newUser.id } },
        room: { connect: { room_number: roomIdStr } }
      }
    });

    await prisma.room.update({
      where: { room_number: roomIdStr },
      data: { status: 'Booked' }
    });
    
    revalidatePath('/');
    revalidatePath('/api/rooms');
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/rooms');

    return { success: true };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return { success: false, error: 'Failed to create booking' };
  }
}