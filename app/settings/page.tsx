'use client'

import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsSchema, type Settings } from '@/lib/schemas/settings'
import { toast } from 'sonner'
import Image from 'next/image'
import { Building2 } from 'lucide-react'
import { ChangePasswordForm } from '@/components/change-password-form'

function LogoPreview({ control }: { control: any }) {
  const logoUrl = useWatch({ control, name: 'logoUrl' })
  const logoText = useWatch({ control, name: 'logoText' })

  if (logoUrl) {
    return (
      <div className="flex items-center space-x-3">
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image
            src={logoUrl}
            alt="Logo Vorschau"
            fill
            className="object-contain"
            sizes="32px"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
        {logoText && (
          <h1 className="text-lg font-bold text-foreground truncate">{logoText}</h1>
        )}
      </div>
    )
  }

  if (logoText) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-lg font-bold text-foreground truncate">{logoText}</h1>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 border-2 border-dashed border-muted rounded-lg flex items-center justify-center flex-shrink-0">
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-bold text-muted-foreground">Firmenname wird angezeigt</h1>
    </div>
  )
}

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: 'SAN RISE GMBH',
      gemaPercentage: 9,
      currency: 'EUR',
      logoUrl: '',
      logoText: 'SAN RISE GMBH',
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
            logoUrl: data.logoUrl || '',
            logoText: data.logoText || '',
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
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
        {/* Logo-Einstellungen */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Logo-Einstellungen (Optional)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Logo URL (Optional)</label>
                <input
                  {...register('logoUrl')}
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL zu Ihrem transparenten Logo (PNG empfohlen). Wenn leer, wird nur der Text verwendet.
                </p>
                {errors.logoUrl && (
                  <p className="text-destructive text-sm mt-1">{errors.logoUrl.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Logo-Text (Optional)</label>
                <input
                  {...register('logoText')}
                  type="text"
                  placeholder="Firmenname (falls abweichend)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Überschreibt den Firmennamen in der Navigation. Wenn leer, wird der Firmenname verwendet.
                </p>
                {errors.logoText && (
                  <p className="text-destructive text-sm mt-1">{errors.logoText.message}</p>
                )}
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Vorschau</h4>
              <div className="bg-card rounded-lg p-4 border border-border">
                <LogoPreview control={control} />
              </div>
            </div>
          </div>
        </div>

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
