'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function createAdminMember(data: { name: string, email: string, password: string, room: string, paymentStatus?: string }) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    let room_id = null;
    let room_price = 0;
    if (data.room) {
      const room = await prisma.room.findFirst({ where: { room_number: data.room } });
      if (room) {
        if (room.status === 'Occupied') {
          return { success: false, error: `Room ${data.room} is already occupied` };
        }
        room_id = room.id;
        room_price = room.price;
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'user'
      }
    });

    // Calculate due date (1 month from now)
    const joinDate = new Date();
    const dueDate = new Date(joinDate);
    dueDate.setMonth(dueDate.getMonth() + 1);

    const member = await prisma.member.create({
      data: {
        user_id: user.id,
        name: data.name,
        phone: '-',
        status: 'active',
        join_date: joinDate,
        due_date: data.paymentStatus === 'paid_offline' ? dueDate : joinDate,
        ...(room_id ? { room_id } : {})
      }
    });

    if (data.paymentStatus && room_id) {
      await prisma.payment.create({
        data: {
          member_id: member.id,
          amount: room_price,
          status: data.paymentStatus === 'paid_offline' ? 'paid' : 'pending',
          payment_date: joinDate,
          payment_method: data.paymentStatus === 'paid_offline' ? 'cash' : 'bank_transfer',
          due_date: joinDate
        }
      });
    }

    if (room_id) {
      await prisma.room.update({
        where: { id: room_id },
        data: { status: 'Occupied' }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating member:', error);
    return { success: false, error: 'Failed to create member' };
  }
}

export async function getAdminMembers() {
  try {
    const members = await prisma.member.findMany({
      include: {
        room: true,
        user: true,
      },
      orderBy: { name: 'asc' }
    });

    const mappedMembers = members.map(m => ({
      id: m.id.toString(),
      stId: `#ST-${m.id.toString().padStart(4, '0')}`,
      name: m.name,
      avatar: (m as any).avatar_url || (m as any).user?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      room: m.room ? `Room ${m.room.room_number}` : 'No Room',
      floor: m.room ? `Floor ${m.room.floor}` : '-',
      email: (m as any).user?.email || m.phone,
      phone: m.phone,
      id_number: (m as any).id_number || '-',
      preferredRoom: (m as any).preferred_room_name || null,
      joinDate: m.join_date
        ? m.join_date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '-',
      leaseEnd: m.due_date ? m.due_date.toISOString().split('T')[0] : 'N/A',
      status: m.status === 'active' ? 'Active' : (m.status === 'pending' ? 'Pending' : 'Past Member')
    }));

    return { success: true, data: mappedMembers };
  } catch (error) {
    console.error('Error fetching admin members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}

export async function requestRoom(userId: number, roomName: string) {
  try {
    const member = await prisma.member.findFirst({ where: { user_id: userId } });
    if (!member) return { success: false, error: 'Member not found' };

    await prisma.member.update({
      where: { id: member.id },
      data: { preferred_room_name: roomName }
    });
    return { success: true };
  } catch (error) {
    console.error('Error requesting room:', error);
    return { success: false, error: 'Failed to request room' };
  }
}

export async function updateAdminMember(id: string, data: { name: string, phone: string, email: string, status: string, room: string }) {
  try {
    const statusMap: Record<string, string> = {
      'Active': 'active',
      'Pending': 'pending',
      'Past Member': 'past'
    };

    let room_id = undefined;
    if (data.room) {
      const room = await prisma.room.findFirst({ where: { room_number: data.room } });
      if (room) {
        room_id = room.id;
      }
    }
    
    await prisma.member.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        phone: data.phone,
        status: statusMap[data.status] || 'active',
        ...(room_id ? { room_id } : {})
      }
    });

    if (room_id && (statusMap[data.status] || 'active') === 'active') {
      await prisma.room.update({
        where: { id: room_id },
        data: { status: 'Occupied' }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating member:', error);
    return { success: false, error: 'Failed to update member' };
  }
}

export async function deleteAdminMember(id: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) }
    });

    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    // Delete related records first
    await prisma.complaint.deleteMany({ where: { member_id: parseInt(id) } });
    await prisma.payment.deleteMany({ where: { member_id: parseInt(id) } });
    
    // Delete the member profile
    await prisma.member.delete({
      where: { id: parseInt(id) }
    });

    // Delete the associated user account
    if (member.user_id) {
      await prisma.user.delete({
        where: { id: member.user_id }
      });
    }

    // Free up the room if no other active member is in it
    if (member.room_id) {
      const otherMembers = await prisma.member.findFirst({ 
        where: { room_id: member.room_id, status: 'active' } 
      });
      if (!otherMembers) {
        await prisma.room.update({ 
          where: { id: member.room_id }, 
          data: { status: 'Available' } 
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}

// Resident requests to check out — sets a checkout_requested flag
export async function requestCheckout(userId: number) {
  try {
    const member = await prisma.member.findFirst({ where: { user_id: userId } });
    if (!member) return { success: false, error: 'Member not found' };

    await prisma.member.update({
      where: { id: member.id },
      data: { status: 'checkout_requested' } as any
    });
    return { success: true };
  } catch (error) {
    console.error('Error requesting checkout:', error);
    return { success: false, error: 'Failed to request checkout' };
  }
}

// Admin processes (force) checkout — sets member as checkout_approved or past, frees room if past due
export async function forceCheckout(memberId: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(memberId) }
    });
    if (!member) return { success: false, error: 'Member not found' };

    const today = new Date();
    const isPastDue = !member.due_date || new Date(member.due_date) <= today;

    if (isPastDue) {
      // Immediate checkout
      await prisma.member.update({
        where: { id: parseInt(memberId) },
        data: { status: 'past', due_date: new Date() } as any
      });

      // Free the room
      if (member.room_id) {
        await prisma.room.update({
          where: { id: member.room_id },
          data: { status: 'Available' }
        });
      }
    } else {
      // Future checkout - just mark as approved, let them stay until due_date
      await prisma.member.update({
        where: { id: parseInt(memberId) },
        data: { status: 'checkout_approved' } as any
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error forcing checkout:', error);
    return { success: false, error: 'Failed to process checkout' };
  }
}

