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
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as number },
      include: {
        members: {
          include: {
            complaints: {
              orderBy: { id: 'desc' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const member = user.members.length > 0 ? user.members[0] : null;
    const complaints = member ? member.complaints : [];

    return NextResponse.json({
      complaints,
      user: {
        name: member?.name || payload.name,
      }
    })
  } catch (error: any) {
    console.error('Complaints API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
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
        members: true
      }
    })

    if (!user || user.members.length === 0) {
      return NextResponse.json({ error: 'User member profile not found' }, { status: 400 })
    }

    const body = await req.json();
    const { category, description, photo_url } = body;

    if (photo_url && typeof photo_url === 'string') {
      const validation = validateServerImageDataUrl(photo_url);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error || 'Security verification failed for uploaded attachment.' }, { status: 400 });
      }
    }

    const newComplaint = await prisma.complaint.create({
      data: {
        tracking_id: 'REQ-' + Math.floor(Math.random() * 10000),
        member_id: user.members[0].id,
        category,
        description,
        photo_url: photo_url || null,
        status: 'pending',
      }
    });

    return NextResponse.json({ success: true, complaint: newComplaint })
  } catch (error: any) {
    console.error('Complaints POST error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
