import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    let userName = 'Guest';
    let memberData = null;

    if (token) {
      try {
        const payload = await decrypt(token)
        const user = (await prisma.user.findUnique({
          where: { id: payload.userId as number },
          include: { 
            members: {
              include: {
                room: true,
                complaints: {
                  orderBy: { id: 'desc' }
                }
              }
            } 
          }
        })) as any;

        if (user) {
          const member = user.members?.length > 0 ? user.members[0] : null;
          userName = member?.name || (payload.name as string);
          memberData = member;
        }
      } catch (e) {
        // ignore auth error for announcements
      }
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        expiry_date: {
          gte: new Date(),
        }
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({ 
      announcements, 
      user: { 
        name: userName,
        memberProfile: memberData
      } 
    })
  } catch (error: any) {
    console.error('Announcements API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
