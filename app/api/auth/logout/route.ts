import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // Lösche Session-Cookie
    cookieStore.delete('session')

    return NextResponse.json({
      message: 'Erfolgreich abgemeldet'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abmelden' },
      { status: 500 }
    )
  }
} 