import { NextResponse } from 'next/server'

export async function POST() {
  return logout()
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  })
  return response
}

function logout() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  })
  return response
}
