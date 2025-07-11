import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { changePasswordSchema } from '@/lib/schemas/user'
import { updateUserPassword } from '@/lib/auth-helpers'

export async function POST(request: Request) {
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
    const decoded = Buffer.from(sessionToken.value, 'base64').toString()
    const [userId] = decoded.split(':')

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Aktualisiere Passwort über Supabase
    const success = await updateUserPassword(userId, currentPassword, newPassword)

    if (!success) {
      return NextResponse.json(
        { error: 'Aktuelles Passwort ist falsch oder Benutzer nicht gefunden' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Passwort erfolgreich geändert'
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Ändern des Passworts' },
      { status: 500 }
    )
  }
} 