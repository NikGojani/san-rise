import { prisma } from '@/lib/prisma'

export async function getSettings() {
  const settings = await prisma.settings.findFirst()
  return settings
}

export async function updateSettings(data: {
  companyName: string
  gemaPercentage: number
  currency: string
  logoUrl?: string | null
  logoText?: string | null
  nikPercentage: number
  adrianPercentage: number
  sebastianPercentage: number
  mexifyPercentage: number
}) {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      ...data,
    },
  })
  return settings
} 