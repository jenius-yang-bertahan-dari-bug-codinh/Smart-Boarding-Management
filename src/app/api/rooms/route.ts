import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const rooms = await prisma.room.findMany();
    // Parse features from JSON string
    const formattedRooms = rooms.map(room => ({
      ...room,
      features: JSON.parse(room.features)
    }));
    return NextResponse.json(formattedRooms);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}
