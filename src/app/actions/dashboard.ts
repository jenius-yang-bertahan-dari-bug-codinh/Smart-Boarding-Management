'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats(filter: string = 'Last 30 Days') {
  try {
    let startDate = new Date(0);
    const now = new Date();
    if (filter === 'Today') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (filter === 'Last 7 Days') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === 'Last 30 Days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (filter === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filter === 'This Year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // 1. Total Revenue (Filtered by date)
    const payments = await prisma.payment.findMany({
      where: { 
        status: 'paid',
        payment_date: { gte: startDate }
      }
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

    // 4. New Reservations (Pending Members)
    const newReservations = await prisma.member.count({
      where: { status: 'pending' }
    });

    // 5. Recent Activities
    const recentPayments = await prisma.payment.findMany({
      take: 3,
      where: { payment_date: { gte: startDate } },
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

    // Fetch all paid payments for the current year to build the charts
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const allPayments = await prisma.payment.findMany({
      where: {
        status: 'paid',
        payment_date: { gte: startOfYear }
      },
      select: { payment_date: true, amount: true }
    });

    // Generate Monthly Data
    const monthlyTotals = new Array(12).fill(0);
    allPayments.forEach(p => {
      const monthIndex = p.payment_date.getMonth();
      monthlyTotals[monthIndex] += p.amount;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxMonthly = Math.max(...monthlyTotals, 1);
    const monthlyData = monthlyTotals.map((total, i) => ({
      month: monthNames[i],
      value: Math.round((total / maxMonthly) * 100),
      amount: '$' + total.toLocaleString(),
      highlight: total === maxMonthly && total > 0
    }));

    // Generate Weekly Data (Last 6 weeks)
    const weeklyData = [];
    const nowTime = now.getTime();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const weeklyTotals = new Array(6).fill(0);
    
    allPayments.forEach(p => {
      const diffTime = nowTime - p.payment_date.getTime();
      const weekIndex = Math.floor(diffTime / oneWeekMs);
      if (weekIndex >= 0 && weekIndex < 6) {
        weeklyTotals[5 - weekIndex] += p.amount; // 5 is the most recent week, 0 is 5 weeks ago
      }
    });

    const maxWeekly = Math.max(...weeklyTotals, 1);
    for (let i = 0; i < 6; i++) {
      weeklyData.push({
        month: `W${i + 1}`,
        value: Math.round((weeklyTotals[i] / maxWeekly) * 100),
        amount: '$' + weeklyTotals[i].toLocaleString(),
        highlight: weeklyTotals[i] === maxWeekly && weeklyTotals[i] > 0
      });
    }

    return {
      success: true,
      data: {
        totalRevenue,
        occupancyRate,
        activeMaintenance,
        newReservations,
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
