'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

export async function getAdminReservations() {
  try {
    const rooms = await prisma.room.findMany();

    const members = await prisma.member.findMany({
      include: {
        room: true,
        payments: {
          orderBy: { id: 'desc' },
          take: 1
        }
      },
      orderBy: { id: 'desc' }
    });

    const mappedReservations = members.map(m => {
      let initials = 'U';
      if (m.name) {
        const parts = m.name.split(' ');
        initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      }

      let paymentStatus = 'Not Billed';
      if (m.payments && m.payments.length > 0) {
        const pStatus = m.payments[0].status;
        if (pStatus === 'paid') paymentStatus = 'Paid';
        else paymentStatus = 'Unpaid';
      }

      // Calculate room string and price based on preferred_room_name if room is null
      let roomStr = 'Unknown Room';
      let priceStr = 'N/A';
      
      if (m.room) {
        roomStr = `Room ${m.room.room_number}`;
        // If they have a billed payment, use that amount instead of the base room price
        if (m.payments && m.payments.length > 0) {
          priceStr = `Rp ${Number(m.payments[0].amount).toLocaleString('id-ID')}`;
        } else {
          priceStr = `Rp ${Number(m.room.price).toLocaleString('id-ID')}`;
        }
      } else if (m.preferred_room_name) {
        roomStr = m.preferred_room_name;
        // Try to extract room number and duration to calculate price
        const match = m.preferred_room_name.match(/Room\s+(\d+)/i);
        const durationMatch = m.preferred_room_name.match(/\((\d+)\s+months?\)/i);
        const duration = durationMatch ? parseInt(durationMatch[1], 10) : 1;
        
        if (match) {
          const matchedRoom = rooms.find(r => r.room_number === match[1]);
          if (matchedRoom) {
            priceStr = `Rp ${Number(matchedRoom.price * duration).toLocaleString('id-ID')}`;
          }
        }
      }

      return {
        rawId: m.id,
        id: `#RSV-${m.id.toString().padStart(4, '0')}`,
        tenant: m.name,
        initials,
        color: m.status === 'active' ? 'bg-blue-500' : (m.status === 'approved' ? 'bg-indigo-500' : (m.status === 'pending' ? 'bg-emerald-500' : 'bg-slate-500')),
        room: roomStr,
        term: m.due_date ? `Due: ${m.due_date.toISOString().split('T')[0]}` : 'Flexible',
        rawDueDate: m.due_date ? m.due_date.toISOString() : null,
        rawCheckinDate: m.join_date ? m.join_date.toISOString() : null,
        checkinDate: m.join_date ? m.join_date.toISOString().split('T')[0] : 'N/A',
        checkoutDate: m.due_date ? m.due_date.toISOString().split('T')[0] : 'N/A',
        amount: priceStr,
        status: m.status === 'active' ? 'Confirmed' : (m.status === 'approved' ? 'Approved (Unpaid)' : (m.status === 'pending' ? 'Pending' : 'Cancelled')),
        paymentStatus
      };
    });

    // Separately fetch checkout requests
    const checkoutRequests = await prisma.member.findMany({
      where: { status: 'checkout_requested' },
      include: { room: true },
      orderBy: { id: 'desc' }
    });

    const mappedCheckouts = checkoutRequests.map(m => {
      const parts = m.name ? m.name.split(' ') : ['U'];
      const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      return {
        rawId: m.id,
        id: `#CHK-${m.id.toString().padStart(4, '0')}`,
        name: m.name,
        initials,
        color: 'bg-rose-500',
        unit: m.room ? `Room ${m.room.room_number}` : 'Unknown Room',
        price: m.room ? `Rp ${Number(m.room.price).toLocaleString('id-ID')}` : 'N/A',
        date: m.due_date ? m.due_date.toISOString().split('T')[0] : 'N/A',
        type: 'checkout' as const
      };
    });

    return { success: true, data: mappedReservations, rooms, checkoutRequests: mappedCheckouts };

  } catch (error) {
    console.error('Error fetching admin reservations:', error);
    return { success: false, error: 'Failed to fetch reservations' };
  }
}

export async function updateReservationStatus(id: number, status: string) {
  try {
    // Fetch current member to check for preferred room
    const currentMember = await prisma.member.findUnique({
      where: { id }
    });

    let room_id = undefined;
    if (currentMember && currentMember.preferred_room_name) {
      const match = currentMember.preferred_room_name.match(/Room\s+(\d+)/i);
      if (match) {
        const roomNum = match[1];
        const room = await prisma.room.findFirst({ where: { room_number: roomNum } });
        if (room) {
          room_id = room.id;
          
          // Mark room as occupied if the status is active/approved
          if (status === 'active' || status === 'approved') {
            await prisma.room.update({
              where: { id: room.id },
              data: { status: 'Occupied' }
            });
          }
        }
      }
    }

    const member = await prisma.member.update({
      where: { id },
      data: { 
        status,
        ...(room_id ? { room_id } : {})
      },
      include: {
        user: true // Include user to get the email address
      }
    });

    if (status === 'active' || status === 'approved') {
      // Upgrade user role to tenant
      await prisma.user.update({
        where: { id: member.user_id },
        data: { 
          role: 'tenant'
        }
      });

      // Extract duration from preferred_room_name if present (e.g. "Room 3 - VIP (4 months)")
      let durationMonths = 1;
      if (currentMember && currentMember.preferred_room_name) {
        const durationMatch = currentMember.preferred_room_name.match(/\((\d+)\s+months?\)/i);
        if (durationMatch) {
          durationMonths = parseInt(durationMatch[1], 10);
        }
      }

      // Auto-generate invoice for the assigned room
      if (room_id) {
        const { generateMemberInvoice } = await import('@/app/actions/billing');
        await generateMemberInvoice(id.toString(), durationMonths);
      }

      
      // Send email to the user if they have a valid user account
      if (member.user && member.user.email && !member.user.email.endsWith('@example.com')) {
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #1e3a8a;">Welcome to Papikost! 🎉</h2>
            <p style="color: #475569; font-size: 16px;">Hello <strong>${member.name}</strong>,</p>
            <p style="color: #475569; font-size: 16px;">Good news! Your room registration has been approved by the Admin.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #334155;"><strong>Login Details:</strong></p>
              <p style="margin: 0 0 5px 0; color: #475569;">Email: <strong>${member.user.email}</strong></p>
              <p style="margin: 0; color: #475569;">Password: <em>(The password you created during registration)</em></p>
            </div>

            <p style="color: #475569; font-size: 16px;">Please log in to your dashboard and complete your first payment to officially check in and secure your room.</p>
            <a href="${loginUrl}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px;">Login to Dashboard</a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">Best regards,<br>Papikost Management</p>
          </div>
        `;
        
        await sendEmail(
          member.user.email,
          'Your Papikost Reservation is Approved! 🏠',
          emailHtml
        );
      }
      
      // NOTE: We no longer auto-update payment to 'completed' or room to 'Occupied' here.
      // That will happen after the user successfully pays via Midtrans in the dashboard.
    } else if (status.toLowerCase() === 'cancelled' || status === 'inactive') {
      if (member.room_id) {
        await prisma.room.update({
          where: { id: member.room_id },
          data: { status: 'Available' }
        });
      }
    } else if (status.toLowerCase() === 'pending') {
      if (member.room_id) {
        await prisma.room.update({
          where: { id: member.room_id },
          data: { status: 'Booked' }
        });
      }
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
    const checkOut = formData.get('checkOut') as string;
    
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

    const dueDateValue = checkOut ? new Date(checkOut) : new Date(new Date(checkIn).setMonth(new Date(checkIn).getMonth() + 1));

    await prisma.member.create({
      data: {
        name: tenantName,
        phone: 'N/A', // Default fallback
        status: 'pending', // lowercase pending to match the backend mapping logic
        due_date: dueDateValue,
        join_date: new Date(checkIn),
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