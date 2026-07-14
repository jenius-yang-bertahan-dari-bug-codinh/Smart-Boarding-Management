'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAdminBilling(trendFilter: string = '6_months') {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        member: true,
      },
      orderBy: { payment_date: 'desc' }
    });

    let incomeSum = 0;
    let pendingSum = 0;
    let pendingCount = 0;
    let overdueSum = 0;
    let overdueCount = 0;

    const mappedInvoices = payments.map(p => {
      let initials = 'U';
      if (p.member?.name) {
        const parts = p.member.name.split(' ');
        initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      }

      // Auto-update to overdue if past due date
      const now = new Date();
      let currentStatus = p.status;
      
      const pAny = p as any; // Bypass TS check due to missing Prisma typings refresh
      const dueDate = pAny.due_date ? new Date(pAny.due_date) : new Date(p.payment_date);
      
      if (currentStatus === 'pending' && dueDate < now) {
        currentStatus = 'overdue';
        // Optionally update in DB asynchronously
        prisma.payment.update({ where: { id: p.id }, data: { status: 'overdue' } }).catch(() => {});
      }

      // Aggregate metrics
      if (currentStatus === 'paid') {
        incomeSum += p.amount;
      } else if (currentStatus === 'pending') {
        pendingSum += p.amount;
        pendingCount++;
      } else if (currentStatus === 'overdue') {
        overdueSum += p.amount;
        overdueCount++;
      }

      return {
        rawId: p.id,
        id: `#INV-${p.id.toString().padStart(6, '0')}`,
        member: p.member?.name || 'Unknown',
        initials,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        amount: `$${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        dueDate: dueDate.toISOString().split('T')[0],
        dueDateRed: currentStatus === 'overdue',
        billingMonth: pAny.billing_month || 'N/A',
        status: currentStatus === 'paid' ? 'Paid' : (currentStatus === 'pending' ? 'Unpaid' : 'Overdue'),
        gatewayReference: p.gateway_reference
      };
    });

    const totalRooms = await prisma.room.count();
    const occupiedRooms = await prisma.room.count({
      where: { status: 'Active Member' }
    });
    
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const metrics = {
      monthlyIncome: `$${incomeSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      pendingInvoicesSum: `$${pendingSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      pendingInvoicesCount: pendingCount,
      overduePaymentsSum: `$${overdueSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      overduePaymentsCount: overdueCount,
      occupancyRate: occupancyRate,
      occupiedRooms: occupiedRooms,
      totalRooms: totalRooms
    };

    // Dynamic Trend Bars Calculation
    const now = new Date();
    let monthsToCalculate = 6;
    let startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    if (trendFilter === 'this_year') {
      monthsToCalculate = 12;
      startMonth = new Date(now.getFullYear(), 0, 1);
    }
    
    // Calculate income per month
    const monthlyIncomeMap = new Map();
    for (let i = 0; i < monthsToCalculate; i++) {
      const d = new Date(startMonth);
      d.setMonth(d.getMonth() + i);
      const key = d.toLocaleString('en-US', { month: 'short' });
      monthlyIncomeMap.set(key, 0);
    }

    payments.forEach(p => {
      const pAny = p as any;
      if (p.status === 'paid' || (pAny.status === 'paid')) { // safe check
        const pDate = new Date(p.payment_date);
        if (pDate >= startMonth) {
          const key = pDate.toLocaleString('en-US', { month: 'short' });
          if (monthlyIncomeMap.has(key)) {
            monthlyIncomeMap.set(key, monthlyIncomeMap.get(key) + p.amount);
          }
        }
      }
    });

    const maxMonthlyIncome = Math.max(...Array.from(monthlyIncomeMap.values()), 1);
    
    const trendBars = Array.from(monthlyIncomeMap.entries()).map(([month, amount], idx) => {
      const h = Math.round((amount / maxMonthlyIncome) * 100);
      return { 
        month, 
        h: h > 0 ? h : 5, // minimum visible height
        active: idx === monthsToCalculate - 1,
        rawValue: `$${amount.toLocaleString()}`
      };
    });

    return { success: true, data: { invoices: mappedInvoices, trendBars, metrics } };
  } catch (error) {
    console.error('Error fetching admin billing:', error);
    return { success: false, error: 'Failed to fetch billing' };
  }
}

export async function generateInvoices(memberId: number, amount: number, startMonth: string, durationMonths: number) {
  try {
    const startDate = new Date(startMonth + '-01T00:00:00.000Z');
    const paymentsToCreate = [];

    for (let i = 0; i < durationMonths; i++) {
      const currentMonth = new Date(startDate);
      currentMonth.setMonth(startDate.getMonth() + i);
      
      const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      // Due date is usually the 5th of the month
      const dueDate = new Date(currentMonth);
      dueDate.setDate(5);

      paymentsToCreate.push({
        member_id: memberId,
        amount: amount,
        payment_method: 'Manual',
        status: 'pending',
        payment_date: new Date(),
        due_date: dueDate,
        billing_month: monthName,
        gateway_reference: null
      } as any); // cast to any to bypass Prisma type checks for new schema fields
    }

    await prisma.payment.createMany({
      data: paymentsToCreate
    });

    revalidatePath('/admin/billing');
    return { success: true };
  } catch (error) {
    console.error('Error generating invoices:', error);
    return { success: false, error: 'Failed to generate invoices' };
  }
}

export async function markInvoiceAsPaid(invoiceId: number) {
  try {
    await prisma.payment.update({
      where: { id: invoiceId },
      data: { status: 'paid' }
    });
    revalidatePath('/admin/billing');
    return { success: true };
  } catch (error) {
    console.error('Error approving payment:', error);
    return { success: false, error: 'Failed to approve payment' };
  }
}

export async function getAllMembers() {
  try {
    const members = await prisma.member.findMany({
      select: { id: true, name: true, room: { select: { room_number: true } } },
      orderBy: { name: 'asc' }
    });
    return { success: true, data: members };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}

export async function updateInvoice(invoiceId: number, data: any) {
  try {
    const updateData: any = {};
    if (data.memberId) updateData.member_id = Number(data.memberId);
    if (data.amount) updateData.amount = parseFloat(data.amount);
    if (data.dueDate) updateData.due_date = new Date(data.dueDate);
    if (data.status) updateData.status = data.status.toLowerCase();
    if (data.billingMonth) updateData.billing_month = data.billingMonth;
    
    await prisma.payment.update({
      where: { id: invoiceId },
      data: updateData
    });
    revalidatePath('/admin/billing');
    return { success: true };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, error: 'Failed to update invoice' };
  }
}

export async function getMemberInvoices(memberId: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: { member_id: Number(memberId) },
      orderBy: { due_date: 'desc' }
    });

    const mapped = payments.map(p => {
      let currentStatus = p.status;
      const dueDate = p.due_date;
      if (currentStatus === 'pending' && dueDate < new Date()) {
        currentStatus = 'overdue';
      }
      return {
        id: p.id,
        amount: p.amount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: currentStatus,
        billingMonth: p.billing_month || 'N/A',
        gatewayReference: p.gateway_reference
      };
    });

    return { success: true, data: mapped };
  } catch (error) {
    console.error('Error fetching member invoices:', error);
    return { success: false, error: 'Failed to fetch invoices' };
  }
}

export async function generateMemberInvoice(memberId: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: Number(memberId) },
      include: { room: true }
    });

    if (!member || !member.room) {
      return { success: false, error: 'Member has no assigned room' };
    }

    const price = member.room.price;
    if (price <= 0) {
      return { success: false, error: 'Room price is zero' };
    }

    // Generate for current month
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const billingMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    // Due date in 7 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Create Payment
    const payment = await prisma.payment.create({
      data: {
        member_id: member.id,
        amount: price,
        payment_method: 'midtrans',
        status: 'pending',
        due_date: dueDate,
        billing_month: billingMonth
      }
    });

    // Import and call midtrans generation
    const { generatePaymentLink } = await import('@/app/actions/midtrans');
    const midtransRes = await generatePaymentLink(payment.id);

    revalidatePath('/admin/members');
    revalidatePath('/admin/billing');

    if (midtransRes.success) {
      return { success: true, paymentId: payment.id, redirect_url: midtransRes.redirect_url };
    } else {
      return { success: true, paymentId: payment.id, warning: 'Invoice created, but failed to generate Midtrans link' };
    }
  } catch (error) {
    console.error('Error generating member invoice:', error);
    return { success: false, error: 'Failed to generate invoice' };
  }
}
