"use server";

import prisma from '@/lib/prisma';
// @ts-ignore
import midtransClient from 'midtrans-client';
import { revalidatePath } from 'next/cache';

// Create Snap API instance
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

export async function generatePaymentLink(paymentId: number) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        member: true
      }
    });

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (payment.status === 'paid') {
      return { success: false, error: 'Payment is already paid' };
    }

    // Prepare transaction details for Midtrans
    const orderId = `INV-${payment.id}-${Date.now()}`;
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(payment.amount) // Midtrans requires integer amount for IDR usually, but amount is Float in schema. If IDR, must be int. Let's round it to be safe.
      },
      customer_details: {
        first_name: payment.member.name,
        email: payment.member.user_id ? `user${payment.member.user_id}@example.com` : 'tenant@papikost.com', // fallback
        phone: payment.member.phone
      }
    };

    const transaction = await snap.createTransaction(parameter);

    if (transaction && transaction.redirect_url) {
      // Save order_id and redirect_url in gateway_reference (format: "order_id|redirect_url")
      // This allows us to query Midtrans API later for transaction status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          gateway_reference: `${orderId}|${transaction.redirect_url}`
        }
      });
      revalidatePath('/admin/billing');
      revalidatePath('/payments');
      return { success: true, redirect_url: transaction.redirect_url };
    } else {
      return { success: false, error: 'Failed to generate Midtrans link' };
    }
  } catch (error: any) {
    console.error('Midtrans Error:', error);
    return { success: false, error: error.message };
  }
}
