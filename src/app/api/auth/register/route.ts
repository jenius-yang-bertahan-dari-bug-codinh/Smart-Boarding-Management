import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone, id_number, preferred_room_name } = body

    // Validate required fields
    if (!name || !email || !password || !phone || !id_number) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar. Silakan login.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with role 'guest' and store registration data
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'guest',
        name: name.trim(),
        phone: phone.trim(),
        id_number: id_number.trim(),
      },
    })

    // Create a pending Member record (no room assigned yet)
    // preferred_room_name is stored so admin knows which room the user wants
    const member = await prisma.member.create({
      data: {
        user_id: user.id,
        name: name.trim(),
        phone: phone.trim(),
        id_number: id_number.trim(),
        status: 'pending',
        join_date: new Date(),
        ...(preferred_room_name ? { preferred_room_name: preferred_room_name.trim() } : {}),
      },
    })

    // Auto-login: create session token
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: member.name,
    }

    const token = await encrypt(sessionPayload)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: member.name,
        role: user.role,
      },
    })

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
