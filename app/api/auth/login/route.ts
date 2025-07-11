import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { userSchema } from '@/lib/schemas/user'
import { authenticateUser } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = userSchema.parse(body)

    // Authentifiziere Benutzer über Supabase
    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Ungültiger Benutzername oder Passwort' },
        { status: 401 }
      )
    }

    // Erstelle Session-Token (in echter App würde man JWT oder ähnliches verwenden)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // Setze HttpOnly Cookie
    const cookieStore = cookies()
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
      path: '/',
    })

    return NextResponse.json({
      user: user,
      message: 'Erfolgreich angemeldet'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Anmelden' },
      { status: 500 }
    )
  }
} 