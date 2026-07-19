import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// @ts-ignore
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Midtrans Webhook received:', JSON.stringify(body, null, 2));

    // Verify the notification using midtrans library
    const notification = await snap.transaction.notification(body);
    
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(`Midtrans Webhook: order_id=${orderId}, status=${transactionStatus}, fraud=${fraudStatus}`);

    // Our order ID format is `INV-{paymentId}-{timestamp}`
    const paymentIdStr = orderId.split('-')[1];
    const paymentId = parseInt(paymentIdStr, 10);

    if (isNaN(paymentId)) {
      console.error(`Midtrans Webhook: Invalid order ID format: ${orderId}`);
      return NextResponse.json({ message: 'Invalid order ID format' }, { status: 400 });
    }

    let finalStatus = 'pending';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        finalStatus = 'pending'; // Manual verify needed
      } else if (fraudStatus === 'accept') {
        finalStatus = 'paid';
      }
    } else if (transactionStatus === 'settlement') {
      finalStatus = 'paid';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      finalStatus = 'failed'; // Or back to pending
    } else if (transactionStatus === 'pending') {
      finalStatus = 'pending';
    }

    console.log(`Midtrans Webhook: Payment #${paymentId} → finalStatus=${finalStatus}`);

    // Update the payment record in the database
    if (finalStatus === 'paid') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'paid',
          payment_date: new Date() // Mark the actual payment date
        }
      });
      console.log(`Midtrans Webhook: Payment #${paymentId} marked as PAID`);
    } else if (finalStatus === 'failed') {
      // If it failed/expired, clear gateway_reference so user can retry
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'pending',
          gateway_reference: null
        }
      });
      console.log(`Midtrans Webhook: Payment #${paymentId} marked as PENDING (expired/failed), gateway_reference cleared`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Midtrans Webhook Error:', error);
    return NextResponse.json({ message: 'Error processing webhook' }, { status: 500 });
  }
}
