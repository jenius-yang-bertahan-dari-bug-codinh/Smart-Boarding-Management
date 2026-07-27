'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
        price: `Rp ${Number(room.price).toLocaleString('id-ID')}`,
        status: activeMember ? 'Active Member' : (room.status === 'Occupied' || room.status === 'Booked' ? 'Booked' : (room.status === 'Maintenance' ? 'Maintenance' : 'Empty Room')),
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

export async function assignMemberToRoom(memberId: number, roomId: number, moveInDate?: string) {
  try {
    const room = await prisma.room.findUnique({ 
      where: { id: roomId },
      include: { members: { where: { status: 'active' } } }
    });
    if (!room || room.status === 'Maintenance' || room.members.length > 0) {
      return { success: false, error: 'Room is not available' };
    }

    // Determine due_date
    const dueDate = moveInDate ? new Date(moveInDate) : new Date();

    // Assign member to room and set them active
    await prisma.member.update({
      where: { id: memberId },
      data: { 
        room_id: roomId,
        due_date: dueDate,
        status: 'active'
      }
    });

    // Update room status
    await prisma.room.update({
      where: { id: roomId },
      data: { status: 'Occupied' }
    });

    revalidatePath('/');
    revalidatePath('/api/rooms');
    revalidatePath('/admin/rooms');
    revalidatePath('/admin/reservations');

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning member to room:', error);
    return { success: false, error: error.message };
  }
}

export async function checkOutMember(roomId: number) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: { where: { status: { in: ['active', 'pending'] } } } }
    });

    if (!room || room.members.length === 0) {
      return { success: false, error: 'Room has no active resident to check out' };
    }

    const memberToCheckout = room.members[0];

    // Mark member as inactive instead of deleting or nullifying room_id to keep history
    await prisma.member.update({
      where: { id: memberToCheckout.id },
      data: { status: 'inactive' }
    });

    // Reset room status
    await prisma.room.update({
      where: { id: roomId },
      data: { status: 'Available' }
    });

    revalidatePath('/');
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (error) {
    console.error('Error checking out member:', error);
    return { success: false, error: 'Failed to check out member' };
  }
}

export async function addRoom(data: { room_number: string, floor: number, type: string, price: number, features?: string, imageUrl?: string }) {
  try {
    const existing = await prisma.room.findFirst({
      where: { room_number: data.room_number }
    });
    if (existing) {
      return { success: false, error: 'Room number already exists' };
    }

    const newRoom = await prisma.room.create({
      data: {
        room_number: data.room_number,
        floor: data.floor,
        type: data.type,
        price: data.price,
        status: 'Available',
        features: data.features || JSON.stringify(['AC', 'WiFi', 'Private Bathroom']),
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80'
      }
    });

    revalidatePath('/');
    revalidatePath('/api/rooms');
    revalidatePath('/admin/rooms');

    return { success: true, data: newRoom };
  } catch (error: any) {
    console.error('Error adding room:', error);
    return { success: false, error: error.message };
  }
}

export async function updateRoom(roomId: number, data: { room_number: string, floor: number, type: string, price: number, status: string, features?: string, imageUrl?: string }) {
  try {
    const existing = await prisma.room.findFirst({
      where: { room_number: data.room_number, NOT: { id: roomId } }
    });
    if (existing) {
      return { success: false, error: 'Room number already exists' };
    }

    // If status is changed to Available or Maintenance, evict active members
    if (data.status !== 'Occupied') {
      await prisma.member.updateMany({
        where: { room_id: roomId, status: 'active' },
        data: { status: 'past' }
      });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        room_number: data.room_number,
        floor: data.floor,
        type: data.type,
        price: data.price,
        status: data.status,
        ...(data.features ? { features: data.features } : {}),
        ...(data.imageUrl ? { imageUrl: data.imageUrl } : {})
      }
    });

    revalidatePath('/');
    revalidatePath('/api/rooms');
    revalidatePath('/admin/rooms');

    return { success: true, data: updatedRoom };
  } catch (error: any) {
    console.error('Error updating room:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteRoom(roomId: number) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: { where: { status: 'active' } } }
    });

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.members.length > 0) {
      return { success: false, error: 'Cannot delete an occupied room. Please remove or reassign the resident first.' };
    }

    // Clean up associated maintenance rooms first to avoid FK constraint error
    await prisma.maintenanceRoom.deleteMany({
      where: { room_id: roomId }
    });

    await prisma.room.delete({
      where: { id: roomId }
    });

    revalidatePath('/');
    revalidatePath('/api/rooms');
    revalidatePath('/admin/rooms');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting room:', error);
    return { success: false, error: 'Failed to delete room. It might be tied to other records.' };
  }
}

