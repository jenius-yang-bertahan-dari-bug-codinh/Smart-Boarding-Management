'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAdminMaintenance() {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        member: {
          include: { room: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    const mappedRequests = complaints.map(c => {
      let initials = 'U';
      if (c.member?.name) {
        const parts = c.member.name.split(' ');
        initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      }

      return {
        id: c.tracking_id || `#MT-${c.id.toString().padStart(4, '0')}`,
        date: 'Recent', // using a string since we lack created_at on complaint right now
        member: c.member?.name || 'Unknown',
        unit: c.member?.room ? `Unit ${c.member.room.room_number}` : 'Unknown Unit',
        type: c.category,
        summary: c.description,
        photo_url: c.photo_url,
        status: c.status === 'pending' ? 'In Progress' : (c.status === 'resolved' ? 'Resolved' : 'Pending'),
        priority: c.category.toLowerCase().includes('leak') || c.category.toLowerCase().includes('urgent') ? 'High' : 'Normal',
        initials,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      };
    });

    return { success: true, data: mappedRequests };
  } catch (error) {
    console.error('Error fetching admin maintenance:', error);
    return { success: false, error: 'Failed to fetch maintenance requests' };
  }
}

export async function resolveMaintenanceTicket(trackingId: string) {
  try {
    // If the tracking ID starts with #MT-, we might need to parse the actual ID if it doesn't match the DB tracking_id exactly.
    // However, the DB tracks tracking_id. Let's find by tracking_id first.
    let complaint = await prisma.complaint.findUnique({
      where: { tracking_id: trackingId }
    });

    if (!complaint) {
      // fallback for old complaints without a tracking_id that got mapped to #MT-000X
      if (trackingId.startsWith('#MT-')) {
        const idStr = trackingId.replace('#MT-', '');
        const idNum = parseInt(idStr, 10);
        if (!isNaN(idNum)) {
          complaint = await prisma.complaint.findUnique({ where: { id: idNum } });
        }
      }
    }

    if (!complaint) {
      return { success: false, error: 'Ticket not found' };
    }

    await prisma.complaint.update({
      where: { id: complaint.id },
      data: { status: 'resolved' }
    });
    
    revalidatePath('/admin');
    revalidatePath('/admin/maintenance');

    return { success: true };
  } catch (error) {
    console.error('Error resolving maintenance ticket:', error);
    return { success: false, error: 'Failed to resolve ticket' };
  }
}
