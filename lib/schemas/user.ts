import { z } from 'zod'

export const userSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
})

export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  displayName: z.string().min(1, 'Anzeigename ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse').optional(),
  role: z.enum(['admin', 'team']),
  avatar: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  lastLogin: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Aktuelles Passwort ist erforderlich'),
  newPassword: z.string().min(6, 'Neues Passwort muss mindestens 6 Zeichen lang sein'),
  confirmPassword: z.string().min(1, 'Passwort-Bestätigung ist erforderlich'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
})

export const createUserSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  displayName: z.string().min(1, 'Anzeigename ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse').optional(),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
  role: z.enum(['admin', 'team']),
  avatar: z.string().optional(),
})

export type User = z.infer<typeof userSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type ChangePassword = z.infer<typeof changePasswordSchema>
export type CreateUser = z.infer<typeof createUserSchema> 