import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import prisma from '@/lib/prisma';
import { validateServerImageDataUrl } from '@/lib/file-security';

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
              where: { status: { in: ['pending', 'overdue'] } }
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

    const uAny = user as any;
    const member = user.members.length > 0 ? user.members[0] : null;
    const mAny = member as any;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: member?.name || payload.name, // Member name if exists
        role: user.role,
        avatar_url: mAny?.avatar_url || uAny?.avatar_url || null,
        memberProfile: member ? {
          id: member.id,
          phone: member.phone,
          avatar_url: mAny?.avatar_url || uAny?.avatar_url || null,
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

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await decrypt(token)
    const userId = Number(payload.userId);

    const body = await request.json();
    const { name, email, phone, avatar_url } = body;

    if (avatar_url && typeof avatar_url === 'string') {
      const validation = validateServerImageDataUrl(avatar_url);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error || 'Security check failed for uploaded file.' }, { status: 400 });
      }
    }

    // If changing email, check uniqueness first
    if (email && typeof email === 'string') {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.trim().toLowerCase(),
          NOT: { id: userId }
        }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'This email address is already registered to another account.' }, { status: 400 });
      }
    }

    // Update User (Email and/or Avatar)
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email: email.trim().toLowerCase() }),
        ...(avatar_url !== undefined && { avatar_url })
      } as any
    }).catch(e => console.warn('Could not update User record:', e.message));

    // Update Member if exists
    const members = await prisma.member.findMany({ where: { user_id: userId } });
    if (members.length > 0) {
      await prisma.member.updateMany({
        where: { user_id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(avatar_url !== undefined && { avatar_url })
        } as any
      });
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Update profile API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

