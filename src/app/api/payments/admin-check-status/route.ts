import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import prisma from '@/lib/prisma';
// @ts-ignore
import midtransClient from 'midtrans-client';

const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

/**
 * POST /api/payments/admin-check-status
 * Admin-only endpoint: checks Midtrans status for given paymentIds regardless of member ownership.
 * Body: { paymentIds: number[] }
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await decrypt(token);

    // Only admins may call this
    const adminUser = await prisma.user.findUnique({ where: { id: payload.userId as number } });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const paymentIds: number[] = body.paymentIds || [];

    if (paymentIds.length === 0) {
      return NextResponse.json({ message: 'No payment IDs provided', updated: [] });
    }

    // Fetch those payments directly
    const payments = await prisma.payment.findMany({
      where: {
        id: { in: paymentIds },
        status: { in: ['pending', 'overdue'] },
        gateway_reference: { not: null }
      },
      include: { member: true }
    });

    if (payments.length === 0) {
      return NextResponse.json({ message: 'No pending payments to check', updated: [] });
    }

    const updatedPayments: { id: number; newStatus: string }[] = [];

    for (const payment of payments) {
      if (!payment.gateway_reference) continue;

      const parts = payment.gateway_reference.split('|');
      const orderId = parts.length > 1 ? parts[0] : null;
      if (!orderId) continue;

      try {
        const statusResponse = await core.transaction.status(orderId);
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`[Admin] Payment #${payment.id} (${orderId}): Midtrans status = ${transactionStatus}, fraud = ${fraudStatus}`);

        if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept')) {
          // Mark as paid
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'paid', payment_date: new Date() }
          });

          // Extend member due_date by 1 month
          if (payment.member) {
            const baseDate = payment.member.due_date || payment.member.join_date || new Date();
            const newDueDate = new Date(baseDate);
            newDueDate.setMonth(newDueDate.getMonth() + 1);
            await prisma.member.update({
              where: { id: payment.member.id },
              data: { due_date: newDueDate }
            });
          }

          updatedPayments.push({ id: payment.id, newStatus: 'paid' });

        } else if (
          transactionStatus === 'cancel' ||
          transactionStatus === 'deny' ||
          transactionStatus === 'expire'
        ) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'pending', gateway_reference: null }
          });
          updatedPayments.push({ id: payment.id, newStatus: 'pending' });
        }
      } catch (midtransError: any) {
        console.log(`[Admin] Payment #${payment.id} (${orderId}): Midtrans API error — ${midtransError.message || 'Unknown'}. Skipping.`);
        continue;
      }
    }

    return NextResponse.json({
      message: `Checked ${payments.length} payments, updated ${updatedPayments.length}`,
      updated: updatedPayments
    });

  } catch (error: any) {
    console.error('Admin Check Status API Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
