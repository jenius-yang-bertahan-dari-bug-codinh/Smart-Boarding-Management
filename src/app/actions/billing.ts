'use server';

import prisma from '@/lib/prisma';

export async function getAdminBilling() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        member: true,
      },
      orderBy: { payment_date: 'desc' }
    });

    const mappedInvoices = payments.map(p => {
      let initials = 'U';
      if (p.member?.name) {
        const parts = p.member.name.split(' ');
        initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      }

      return {
        id: `#INV-${p.id.toString().padStart(6, '0')}`,
        member: p.member?.name || 'Unknown',
        initials,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        amount: `$${p.amount.toFixed(2)}`,
        dueDate: p.payment_date.toISOString().split('T')[0],
        status: p.status === 'paid' ? 'Paid' : (p.status === 'pending' ? 'Pending' : 'Overdue')
      };
    });

    const trendBars = [
      { month: 'Jan', h: 55 },
      { month: 'Feb', h: 70 },
      { month: 'Mar', h: 50 },
      { month: 'Apr', h: 80 },
      { month: 'May', h: 65 },
      { month: 'Jun', h: 95, active: true },
    ];

    return { success: true, data: { invoices: mappedInvoices, trendBars } };
  } catch (error) {
    console.error('Error fetching admin billing:', error);
    return { success: false, error: 'Failed to fetch billing' };
  }
}
