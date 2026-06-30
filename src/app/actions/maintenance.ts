'use server';

import prisma from '@/lib/prisma';

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
