import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, fullName, email, phone, idNumber, paymentMethod, totalCost } = body;

    // Validate inputs
    if (!roomId || !fullName || !email || !phone || !idNumber || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Wrap in a transaction to ensure all or nothing
    const result = await prisma.$transaction(async (tx) => {
      // 0. Check room availability first
      const room = await tx.room.findUnique({
        where: { id: parseInt(roomId) },
      });
      if (!room) {
        throw new Error('Room not found');
      }
      if (room.status !== 'Available') {
        throw new Error('Room is no longer available');
      }

      // 1. Find or create the user
      let user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            password: 'defaultPassword123', // In a real app, generate securely or handle via auth
            role: 'guest',
          },
        });
      }

      // 2. Create the member record linked to the room (pending approval)
      const member = await tx.member.create({
        data: {
          user_id: user.id,
          room_id: parseInt(roomId),
          name: fullName,
          phone: phone,
          id_number: idNumber,
          status: 'pending',
        },
      });

      // 3. Create the payment record
      const payment = await tx.payment.create({
        data: {
          member_id: member.id,
          amount: totalCost,
          payment_method: paymentMethod,
          status: 'pending', // Pending payment until approved
        },
      });

      // 4. Update the room status to Booked (awaiting approval)
      await tx.room.update({
        where: { id: parseInt(roomId) },
        data: { status: 'Booked' },
      });

      return { user, member, payment };
    });

    revalidatePath('/');
    revalidatePath('/api/rooms');
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/rooms');

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
