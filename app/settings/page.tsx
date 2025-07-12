'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChangePasswordForm } from '@/components/change-password-form'

// Vereinfachtes Settings-Schema ohne Logo-Felder
const settingsSchema = z.object({
  companyName: z.string().min(1, 'Firmenname ist erforderlich'),
  gemaPercentage: z.number().min(0).max(100),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  profitDistribution: z.object({
    nik: z.number().min(0).max(100),
    adrian: z.number().min(0).max(100),
    sebastian: z.number().min(0).max(100),
    mexify: z.number().min(0).max(100),
  }).refine((data) => {
    const total = data.nik + data.adrian + data.sebastian + data.mexify
    return total === 100
  }, 'Die Gewinnverteilung muss insgesamt 100% ergeben'),
})

type Settings = z.infer<typeof settingsSchema>

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: 'SAN RISE GMBH',
      gemaPercentage: 9,
      currency: 'EUR',
      profitDistribution: {
        nik: 31.5,
        adrian: 31.5,
        sebastian: 17,
        mexify: 20,
      },
    },
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) throw new Error('Fehler beim Laden der Einstellungen')
        const data = await response.json()
        
        if (data) {
          reset({
            companyName: data.companyName,
            gemaPercentage: data.gemaPercentage,
            currency: data.currency,
            profitDistribution: {
              nik: data.nikPercentage,
              adrian: data.adrianPercentage,
              sebastian: data.sebastianPercentage,
              mexify: data.mexifyPercentage,
            },
          })
        }
      } catch (error) {
        toast.error('Fehler beim Laden der Einstellungen')
      }
    }

    loadSettings()
  }, [reset])

  const onSubmit = async (data: Settings) => {
    try {
      setIsLoading(true)
      
      // Erweitere die Daten mit festen Logo-Werten
      const fullData = {
        ...data,
        logoUrl: null,
        logoText: 'SAN RISE GMBH',
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Einstellungen')
      }

      toast.success('Einstellungen wurden erfolgreich gespeichert')
    } catch (error) {
      toast.error('Fehler beim Speichern der Einstellungen')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-muted-foreground mt-2">Konfigurieren Sie Ihre Dashboard-Einstellungen</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Allgemeine Einstellungen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Firmenname</label>
                <input
                  {...register('companyName')}
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.companyName && (
                  <p className="text-destructive text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Standard GEMA Prozentsatz</label>
                <input
                  {...register('gemaPercentage', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.gemaPercentage && (
                  <p className="text-destructive text-sm mt-1">{errors.gemaPercentage.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Währung</label>
                <select
                  {...register('currency')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
                {errors.currency && (
                  <p className="text-destructive text-sm mt-1">{errors.currency.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Gewinnverteilung</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nik (%)</label>
                <input
                  {...register('profitDistribution.nik', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Adrian (%)</label>
                <input
                  {...register('profitDistribution.adrian', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sebastian (%)</label>
                <input
                  {...register('profitDistribution.sebastian', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mexify (%)</label>
                <input
                  {...register('profitDistribution.mexify', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.profitDistribution && (
                <p className="text-destructive text-sm mt-1">{errors.profitDistribution.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Wird gespeichert...' : 'Einstellungen speichern'}
          </button>
        </div>
      </form>

      {/* Passwort-Änderung */}
      <ChangePasswordForm />
    </div>
  )
}
