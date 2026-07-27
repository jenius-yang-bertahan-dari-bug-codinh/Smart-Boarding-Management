'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

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
        color: m.status === 'active' ? 'bg-blue-500' : (m.status === 'approved' ? 'bg-indigo-500' : (m.status === 'pending' ? 'bg-emerald-500' : 'bg-slate-500')),
        room: m.room ? `Room ${m.room.room_number}` : 'Unknown Room',
        term: m.due_date ? `Due: ${m.due_date.toISOString().split('T')[0]}` : 'Flexible',
        rawDueDate: m.due_date ? m.due_date.toISOString() : null,
        amount: m.room ? `Rp ${Number(m.room.price).toLocaleString('id-ID')}` : 'N/A',
        status: m.status === 'active' ? 'Confirmed' : (m.status === 'approved' ? 'Approved (Unpaid)' : (m.status === 'pending' ? 'Pending' : 'Cancelled'))
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
      data: { status },
      include: {
        user: true // Include user to get the email address
      }
    });

    if (status === 'active' || status === 'approved') {
      // 1. Generate the unique password
      const crypto = require('crypto');
      const rawPassword = crypto.randomBytes(4).toString('hex');
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // 2. Upgrade user role and update password
      await prisma.user.update({
        where: { id: member.user_id },
        data: { 
          role: 'tenant',
          password: hashedPassword 
        }
      });
      
      // 3. Send email to the user if they have a valid user account
      if (member.user && member.user.email) {
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #1e3a8a;">Welcome to Papikost! 🎉</h2>
            <p style="color: #475569; font-size: 16px;">Hello <strong>${member.name}</strong>,</p>
            <p style="color: #475569; font-size: 16px;">Good news! Your reservation has been approved by the Admin.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #334155;"><strong>Your Login Credentials:</strong></p>
              <p style="margin: 0 0 5px 0; color: #475569;">Email: <strong>${member.user.email}</strong></p>
              <p style="margin: 0; color: #475569;">Password: <strong>${rawPassword}</strong></p>
            </div>
            <p style="color: #b91c1c; font-size: 14px; font-weight: bold; background-color: #fef2f2; padding: 10px; border-radius: 6px; border-left: 4px solid #ef4444;">
              ⚠️ SECURITY NOTICE: For your safety, we strongly recommend changing this auto-generated password immediately after your first login via the Profile & Settings menu.
            </p>
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
        join_date: new Date(),
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