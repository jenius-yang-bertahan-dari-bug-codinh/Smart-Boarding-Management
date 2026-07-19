import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import prisma from '@/lib/prisma';
// @ts-ignore
import midtransClient from 'midtrans-client';

// Create Core API instance for checking transaction status
const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

/**
 * POST /api/payments/check-status
 * 
 * Check and sync payment status from Midtrans for all pending payments
 * that have a gateway_reference (meaning they were sent to Midtrans).
 * 
 * Body: { paymentIds?: number[] } — optional filter. If empty, checks ALL pending payments for the user.
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await decrypt(token);
    const body = await req.json().catch(() => ({}));
    const requestedPaymentIds: number[] | undefined = body.paymentIds;

    // Find the user's member record
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as number },
      include: {
        members: {
          include: {
            payments: {
              where: {
                status: { in: ['pending', 'overdue'] },
                gateway_reference: { not: null },
                ...(requestedPaymentIds && requestedPaymentIds.length > 0
                  ? { id: { in: requestedPaymentIds } }
                  : {})
              }
            }
          }
        }
      }
    });

    if (!user || user.members.length === 0) {
      return NextResponse.json({ error: 'No member profile found' }, { status: 404 });
    }

    const member = user.members[0];
    const pendingPayments = member.payments;

    if (pendingPayments.length === 0) {
      return NextResponse.json({ message: 'No pending payments to check', updated: [] });
    }

    const updatedPayments: { id: number; newStatus: string }[] = [];

    for (const payment of pendingPayments) {
      if (!payment.gateway_reference) continue;

      // Parse order_id from gateway_reference (format: "order_id|redirect_url")
      const parts = payment.gateway_reference.split('|');
      const orderId = parts.length > 1 ? parts[0] : null;

      if (!orderId) {
        // Legacy format — gateway_reference is just a URL, skip
        console.log(`Payment #${payment.id}: gateway_reference has no order_id, skipping status check.`);
        continue;
      }

      try {
        // Query Midtrans Core API for the transaction status
        const statusResponse = await core.transaction.status(orderId);
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Payment #${payment.id} (${orderId}): Midtrans status = ${transactionStatus}, fraud = ${fraudStatus}`);

        let newStatus: string | null = null;

        if (transactionStatus === 'capture') {
          if (fraudStatus === 'accept') {
            newStatus = 'paid';
          }
          // 'challenge' stays pending
        } else if (transactionStatus === 'settlement') {
          newStatus = 'paid';
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
          // Payment expired/cancelled — clear gateway_reference so user can try again
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'pending',
              gateway_reference: null
            }
          });
          updatedPayments.push({ id: payment.id, newStatus: 'pending' });
          continue;
        }
        // 'pending' stays pending — no update needed

        if (newStatus === 'paid') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'paid',
              payment_date: new Date()
            }
          });
          updatedPayments.push({ id: payment.id, newStatus: 'paid' });
        }
      } catch (midtransError: any) {
        // Midtrans returns 404 if the transaction doesn't exist yet (user hasn't completed payment)
        // This is normal — just skip
        console.log(`Payment #${payment.id} (${orderId}): Midtrans API error — ${midtransError.message || 'Unknown'}. Skipping.`);
        continue;
      }
    }

    return NextResponse.json({
      message: `Checked ${pendingPayments.length} payments, updated ${updatedPayments.length}`,
      updated: updatedPayments
    });

  } catch (error: any) {
    console.error('Check Status API Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
