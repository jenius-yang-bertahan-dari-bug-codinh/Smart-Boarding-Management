'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function onboardResident(data: { name: string; email: string; phone: string; roomId: number }) {
  try {
    const { name, email, phone, roomId } = data;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create user with default password
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'guest'
        }
      });
    }

    // Check if room is available
    const room = await prisma.room.findUnique({ 
      where: { id: roomId },
      include: { members: { where: { status: 'active' } } }
    });
    if (!room || room.status === 'Maintenance' || room.members.length > 0) {
      return { success: false, error: 'Room is not available' };
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        user_id: user.id,
        room_id: roomId,
        name,
        phone,
        status: 'active'
      }
    });

    // Update room status
    await prisma.room.update({
      where: { id: roomId },
      data: { status: 'Occupied' }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/rooms');

    return { success: true, data: member };
  } catch (error: any) {
    console.error('Error onboarding resident:', error);
    return { success: false, error: error.message };
  }
}

export async function generateMonthlyInvoices(amount: number) {
  try {
    const activeMembers = await prisma.member.findMany({
      where: { status: 'active' }
    });

    const payments = [];
    for (const member of activeMembers) {
      const payment = await prisma.payment.create({
        data: {
          member_id: member.id,
          amount,
          payment_method: 'Pending',
          status: 'pending'
        }
      });
      payments.push(payment);
    }

    return { success: true, count: payments.length };
  } catch (error: any) {
    console.error('Error generating invoices:', error);
    return { success: false, error: error.message };
  }
}

export async function createAdminComplaint(data: { memberId: number; category: string; description: string }) {
  try {
    const { memberId, category, description } = data;
    const tracking_id = 'REQ-' + Math.floor(Math.random() * 100000);

    const complaint = await prisma.complaint.create({
      data: {
        member_id: memberId,
        category,
        description,
        status: 'pending',
        tracking_id
      }
    });

    return { success: true, data: complaint };
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    return { success: false, error: error.message };
  }
}

export async function broadcastAnnouncement(data: { title: string; body: string; expiryDays: number }) {
  try {
    const { title, body, expiryDays } = data;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        expiry_date: expiryDate
      }
    });

    return { success: true, data: announcement };
  } catch (error: any) {
    console.error('Error broadcasting announcement:', error);
    return { success: false, error: error.message };
  }
}
