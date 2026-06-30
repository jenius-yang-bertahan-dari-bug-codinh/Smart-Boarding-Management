'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    // 1. Total Revenue
    const payments = await prisma.payment.findMany({
      where: { status: 'paid' } // or whatever status means success
    });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Occupancy Rate
    const totalRooms = await prisma.room.count();
    const occupiedRooms = await prisma.room.count({
      where: { status: 'Occupied' }
    });
    const occupancyRate = totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);

    // 3. Active Maintenance / Complaints
    const activeMaintenance = await prisma.complaint.count({
      where: { status: 'pending' }
    });

    // 4. Total Active Members
    const activeMembers = await prisma.member.count({
      where: { status: 'active' }
    });

    // 5. Recent Activities
    const recentPayments = await prisma.payment.findMany({
      take: 3,
      orderBy: { payment_date: 'desc' },
      include: { member: { include: { room: true } } }
    });
    
    const recentComplaints = await prisma.complaint.findMany({
      take: 3,
      orderBy: { id: 'desc' },
      include: { member: { include: { room: true } } }
    });

    const recentActivities = [
      ...recentPayments.map(p => ({
        id: `p-${p.id}`,
        type: 'payment',
        title: 'Payment Received',
        details: `Unit ${p.member?.room?.room_number ?? 'Unknown'}`,
        amount: p.amount,
        time: p.payment_date.toISOString().split('T')[0]
      })),
      ...recentComplaints.map(c => ({
        id: `c-${c.id}`,
        type: 'maintenance',
        title: 'Maintenance Request',
        details: c.category,
        amount: 0,
        time: 'Recent'
      }))
    ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

    // Mock Monthly Data for now, ideally group by month in SQL
    const monthlyData = [
      { month: 'Jan', value: 35, amount: '$15,400' },
      { month: 'Feb', value: 50, amount: '$22,000' },
      { month: 'Mar', value: 45, amount: '$19,800' },
      { month: 'Apr', value: 65, amount: '$28,600' },
      { month: 'May', value: 75, amount: '$33,000' },
      { month: 'Jun', value: 95, amount: '$42,850', highlight: true },
      { month: 'Jul', value: 55, amount: '$24,200' },
      { month: 'Aug', value: 40, amount: '$17,600' },
      { month: 'Sep', value: 65, amount: '$28,600' },
      { month: 'Oct', value: 75, amount: '$33,000' }
    ];

    const weeklyData = [
      { month: 'W1', value: 45, amount: '$6,200' },
      { month: 'W2', value: 60, amount: '$8,400' },
      { month: 'W3', value: 55, amount: '$7,800' },
      { month: 'W4', value: 85, amount: '$12,100', highlight: true },
      { month: 'W5', value: 40, amount: '$5,600' },
      { month: 'W6', value: 50, amount: '$7,000' }
    ];

    return {
      success: true,
      data: {
        totalRevenue,
        occupancyRate,
        activeMaintenance,
        activeMembers,
        monthlyData,
        weeklyData,
        recentActivities
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}
