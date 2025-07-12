import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session')

    if (!sessionToken?.value) {
      return NextResponse.json(
        { error: 'Nicht angemeldet' },
        { status: 401 }
      )
    }

    // Dekodiere Session-Token
    try {
      const decoded = Buffer.from(sessionToken.value, 'base64').toString()
      const [userId, timestamp] = decoded.split(':')

      // Überprüfe, ob Session noch gültig ist (7 Tage)
      const sessionAge = Date.now() - parseInt(timestamp)
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 Tage in Millisekunden

      if (sessionAge > maxAge) {
        return NextResponse.json(
          { error: 'Session abgelaufen' },
          { status: 401 }
        )
      }

      // Lade Benutzer aus Supabase
      const user = await getUserById(userId)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Benutzer nicht gefunden' },
          { status: 404 }
        )
      }

      return NextResponse.json({ user })

    } catch (decodeError) {
      return NextResponse.json(
        { error: 'Ungültiges Session-Token' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Session-Überprüfung' },
      { status: 500 }
    )
  }
} 