'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function onboardResident(data: { name: string; email: string; phone: string; roomId: number; moveInDate: string }) {
  try {
    const { name, email, phone, roomId, moveInDate } = data;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create user with default password
      const crypto = require('crypto');
      const rawPassword = crypto.randomBytes(4).toString('hex');
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
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
        status: 'active',
        due_date: new Date(moveInDate),
        join_date: new Date()
      }
    });

    // Update room status
    await prisma.room.update({
      where: { id: roomId },
      data: { status: 'Occupied' }
    });

    revalidatePath('/');
    revalidatePath('/api/rooms');
    revalidatePath('/admin');
    revalidatePath('/admin/rooms');

    return { success: true, data: member };
  } catch (error: any) {
    console.error('Error onboarding resident:', error);
    return { success: false, error: error.message };
  }
}

export async function syncAutoBilling() {
  try {
    const activeMembers = await prisma.member.findMany({
      where: { status: 'active' },
      include: { room: true }
    });

    const payments = [];
    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    for (const member of activeMembers) {
      if (!member.room || !member.due_date) continue;

      // Only generate if the due date has passed (i.e., billing cycle has elapsed)
      if (now >= member.due_date) {
        // Build billing_month label for the current cycle (e.g. "July 2026")
        const billingLabel = `${monthNames[member.due_date.getMonth()]} ${member.due_date.getFullYear()}`;

        // Check if an invoice for this exact billing month already exists — prevent duplicates
        const existing = await (prisma.payment as any).findFirst({
          where: {
            member_id: member.id,
            billing_month: billingLabel,
            status: { in: ['pending', 'paid'] },
          },
        });
        if (existing) continue; // already billed for this month

        const payment = await prisma.payment.create({
          data: {
            member_id: member.id,
            amount: member.room.price,
            payment_method: 'midtrans',
            status: 'pending',
            payment_date: now,
            due_date: member.due_date,
            billing_month: billingLabel,
            gateway_reference: null,
          } as any,
        });
        payments.push(payment);

        // Advance due_date by 1 month for the next cycle
        const nextDueDate = new Date(member.due_date);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        await prisma.member.update({
          where: { id: member.id },
          data: { due_date: nextDueDate },
        });
      }
    }

    return { success: true, count: payments.length };
  } catch (error: any) {
    console.error('Error syncing auto-billing:', error);
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
