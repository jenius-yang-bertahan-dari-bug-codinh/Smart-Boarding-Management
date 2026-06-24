import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await decrypt(token)
    
    // Fetch user with member, room, payments, complaints
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as number },
      include: {
        members: {
          include: {
            room: true,
            payments: {
              where: { status: 'pending' }
            },
            complaints: {
              where: { status: 'pending' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const member = user.members.length > 0 ? user.members[0] : null;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: member?.name || payload.name, // Member name if exists
        role: user.role,
        memberProfile: member ? {
          id: member.id,
          phone: member.phone,
          status: member.status,
          room: member.room ? {
            id: member.room.id,
            room_number: member.room.room_number,
            type: member.room.type,
            status: member.room.status,
          } : null,
          pendingPayments: member.payments,
          pendingComplaints: member.complaints,
        } : null
      },
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
