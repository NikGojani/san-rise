import bcrypt from 'bcryptjs'
import { supabase, type SupabaseUser, type AppUser, mapSupabaseUserToApp } from '@/lib/supabase'

export type UserRole = 'admin' | 'team'

// Hilfsfunktion um Passwort zu hashen
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

// Hilfsfunktion um Passwort zu verifizieren
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

// Benutzer aus Supabase laden
export const getUserByUsername = async (username: string): Promise<AppUser | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    return mapSupabaseUserToApp(data as SupabaseUser)
  } catch (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
}

// Benutzer by ID aus Supabase laden
export const getUserById = async (id: string): Promise<AppUser | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    return mapSupabaseUserToApp(data as SupabaseUser)
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

// Benutzer-Login authentifizieren
export const authenticateUser = async (username: string, password: string): Promise<AppUser | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    const supabaseUser = data as SupabaseUser
    const isValidPassword = await verifyPassword(password, supabaseUser.password_hash)

    if (!isValidPassword) return null

    // Update last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', supabaseUser.id)

    return mapSupabaseUserToApp(supabaseUser)
  } catch (error) {
    console.error('Error authenticating user:', error)
    return null
  }
}

// Passwort eines Benutzers ändern
export const updateUserPassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Lade aktuellen Benutzer
    const { data, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single()

    if (error || !data) return false

    // Verifiziere aktuelles Passwort
    const isValidPassword = await verifyPassword(currentPassword, data.password_hash)
    if (!isValidPassword) return false

    // Hash neues Passwort
    const newPasswordHash = await hashPassword(newPassword)

    // Update Passwort in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId)

    return !updateError
  } catch (error) {
    console.error('Error updating user password:', error)
    return false
  }
}

// Neuen Benutzer erstellen
export const createUser = async (userData: {
  username: string
  displayName: string
  email?: string
  password: string
  role: UserRole
  avatar?: string
}): Promise<AppUser | null> => {
  try {
    const passwordHash = await hashPassword(userData.password)

    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: userData.username,
        display_name: userData.displayName,
        email: userData.email || null,
        password_hash: passwordHash,
        role: userData.role,
        avatar: userData.avatar || null,
        is_active: true
      }])
      .select()
      .single()

    if (error || !data) return null

    return mapSupabaseUserToApp(data as SupabaseUser)
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

// Alle aktiven Benutzer laden
export const getAllUsers = async (): Promise<AppUser[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('username')

    if (error || !data) return []

    return data.map(user => mapSupabaseUserToApp(user as SupabaseUser))
  } catch (error) {
    console.error('Error fetching all users:', error)
    return []
  }
} 