import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await decrypt(token)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as number },
      include: {
        members: {
          include: {
            payments: {
              orderBy: { payment_date: 'desc' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const member = user.members.length > 0 ? user.members[0] : null;
    const payments = member ? member.payments : [];
    
    // Calculate current balance (sum of pending payments)
    const currentBalance = payments
      .filter((p: any) => p.status === 'pending')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      currentBalance,
      user: {
        name: member?.name || payload.name,
      }
    })
  } catch (error: any) {
    console.error('Payments API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
