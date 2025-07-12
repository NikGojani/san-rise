'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { calculatorEventSchema, type CalculatorEvent, calculateEventRevenue, calculateEventProfit } from '@/lib/schemas/calculator-event'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { Settings } from '@/lib/schemas/settings'

interface EventCalculatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventSaved: (event: CalculatorEvent) => void
  editEvent?: CalculatorEvent
}

export function EventCalculatorModal({ open, onOpenChange, onEventSaved, editEvent }: EventCalculatorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const dummyRef = useRef<HTMLButtonElement>(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    resolver: zodResolver(calculatorEventSchema),
    defaultValues: editEvent || {
      name: '',
      ticketCount: 400,
      ticketPrice: 37,
      vkPercentage: 100,
      termine: 2,
      gemaPercentage: 9,
      marketingCosts: 3000,
      artistCosts: 1000,
      locationCosts: 5000,
      merchandiserCosts: 500,
      travelCosts: 800,
      rabatt: 0,
      aufbauhelfer: 1000,
      variableCosts: 2000,
      ticketingFee: 2300,
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  })

  // Lade Einstellungen
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          setValue('gemaPercentage', data.gemaPercentage)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error)
      }
    }
    
    if (open) {
      loadSettings()
      if (editEvent) {
        reset(editEvent)
      }
    }
  }, [open, editEvent, setValue, reset])

  // Werte beobachten für Live-Berechnungen
  const ticketCount = watch('ticketCount')
  const ticketPrice = watch('ticketPrice')
  const vkPercentage = watch('vkPercentage')
  const termine = watch('termine')
  const gemaPercentage = watch('gemaPercentage')
  const marketingCosts = watch('marketingCosts')
  const artistCosts = watch('artistCosts')
  const locationCosts = watch('locationCosts')
  const merchandiserCosts = watch('merchandiserCosts')
  const travelCosts = watch('travelCosts')
  const rabatt = watch('rabatt')
  const aufbauhelfer = watch('aufbauhelfer')
  const variableCosts = watch('variableCosts')
  const ticketingFee = watch('ticketingFee')

  // Live-Berechnungen pro Termin
  const ticketsProTermin = ticketCount * (vkPercentage / 100)
  const umsatzProTermin = ticketsProTermin * ticketPrice
  
  // Berechne Gesamtwerte
  const gesamtUmsatz = umsatzProTermin * termine
  const rabattBetrag = gesamtUmsatz * (rabatt / 100)
  
  // Berechne GEMA und Shopify pro Termin
  const gemaFee = gesamtUmsatz * (gemaPercentage / 100)
  const shopifyUmsatzGebuehr = umsatzProTermin * 0.019
  const shopifyTicketGebuehr = ticketsProTermin * 0.25
  const shopifyGebuehrProTermin = ticketingFee > 0 ? 0 : (shopifyUmsatzGebuehr + shopifyTicketGebuehr)
  const shopifyFeeAmount = shopifyGebuehrProTermin * termine
  // Hauptkosten NICHT mehr mit termine multiplizieren
  const marketingGesamt = marketingCosts
  const artistGesamt = artistCosts
  const locationGesamt = locationCosts
  const merchGesamt = merchandiserCosts
  const travelGesamt = travelCosts
  // Optionale Kosten weiterhin pro Termin
  const aufbauhelferGesamt = aufbauhelfer * termine
  const variableGesamt = variableCosts * termine
  const ticketingFeeGesamt = ticketingFee * termine

  const basicCosts = gemaFee + marketingGesamt + artistGesamt + locationGesamt + merchGesamt + travelGesamt
  const optionalCosts = aufbauhelferGesamt + variableGesamt + ticketingFeeGesamt
  const totalCosts = basicCosts + optionalCosts + shopifyFeeAmount
  const finalProfit = gesamtUmsatz - totalCosts - rabattBetrag

  const getValueColorClass = (value: number): string => {
    return value < 0 ? 'text-negative' : 'text-positive'
  }

  const formatValue = (value: number): string => {
    return value.toLocaleString()
  }

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      
      const eventData: CalculatorEvent = {
        ...data,
        id: editEvent?.id || crypto.randomUUID(),
        createdAt: editEvent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Calculator-Konfiguration für dieses Event speichern
      const configData = {
        eventId: eventData.id,
        vkPercentage: data.vkPercentage,
        termine: data.termine,
        gemaPercentage: data.gemaPercentage,
        marketingCosts: data.marketingCosts,
        artistCosts: data.artistCosts,
        locationCosts: data.locationCosts,
        merchandiserCosts: data.merchandiserCosts,
        travelCosts: data.travelCosts,
        rabatt: data.rabatt,
        aufbauhelfer: data.aufbauhelfer,
        variableCosts: data.variableCosts,
        ticketingFee: data.ticketingFee,
        createdAt: editEvent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Speichere Calculator-Konfiguration
      const configResponse = await fetch('/api/calculator-configs', {
        method: editEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      })

      if (!configResponse.ok) {
        throw new Error('Fehler beim Speichern der Calculator-Konfiguration')
      }

      // Eventdaten inkl. Kalkulationen an /api/events senden
      const eventApiData = {
        ...eventData,
        revenue: gesamtUmsatz,
        profit: finalProfit,
        expenses: totalCosts + rabattBetrag,
        maxTickets: ticketCount,
        price: ticketPrice,
        termine: termine,
        ticketsSold: Math.round(ticketsProTermin * termine),
      }
      const eventResponse = await fetch('/api/events', {
        method: editEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventApiData),
      })
      if (!eventResponse.ok) {
        throw new Error('Fehler beim Speichern des Events')
      }
      const savedEvent = await eventResponse.json()

      toast.success('Event erfolgreich gespeichert')
      onEventSaved(savedEvent)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Fehler beim Speichern der Event-Daten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editEvent ? 'Event bearbeiten' : 'Neues Event erstellen'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Linke Spalte: Event Konfiguration */}
            <div className="xl:col-span-1">
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Event Konfiguration</h3>
                
                <div className="space-y-4">
                  {/* Event Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Event Info</h4>
                    <div className="space-y-3">
                      {/* Datum entfernt */}
                    </div>
                  </div>

                  {/* Basis-Werte */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Basis-Werte</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="ticketCount">Tickets pro Termin</Label>
                        <Input
                          id="ticketCount"
                          type="number"
                          {...register('ticketCount', { valueAsNumber: true })}
                          readOnly
                          className="bg-muted cursor-not-allowed"
                          title="Dieser Wert wird von der Events-Seite übernommen"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ticketPrice">Preis €</Label>
                        <Input
                          id="ticketPrice"
                          type="number"
                          step="0.01"
                          {...register('ticketPrice', { valueAsNumber: true })}
                        />
                        {errors.ticketPrice && <p className="text-destructive text-sm">{errors.ticketPrice.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="vkPercentage">VK %</Label>
                        <Input
                          id="vkPercentage"
                          type="number"
                          {...register('vkPercentage', { valueAsNumber: true })}
                        />
                        {errors.vkPercentage && <p className="text-destructive text-sm">{errors.vkPercentage.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="termine">Termine</Label>
                        <Input
                          id="termine"
                          type="number"
                          {...register('termine', { valueAsNumber: true })}
                          readOnly
                          className="bg-muted cursor-not-allowed"
                          title="Dieser Wert wird von der Events-Seite übernommen"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="gemaPercentage">GEMA %</Label>
                        <Input
                          id="gemaPercentage"
                          type="number"
                          step="0.1"
                          {...register('gemaPercentage', { valueAsNumber: true })}
                        />
                        {errors.gemaPercentage && <p className="text-destructive text-sm">{errors.gemaPercentage.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Hauptkosten */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Hauptkosten</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="marketingCosts">Marketing</Label>
                        <Input
                          id="marketingCosts"
                          type="number"
                          {...register('marketingCosts', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="artistCosts">Künstler</Label>
                        <Input
                          id="artistCosts"
                          type="number"
                          {...register('artistCosts', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="locationCosts">Location</Label>
                        <Input
                          id="locationCosts"
                          type="number"
                          {...register('locationCosts', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="merchandiserCosts">Merchandise</Label>
                        <Input
                          id="merchandiserCosts"
                          type="number"
                          {...register('merchandiserCosts', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="travelCosts">Reisekosten</Label>
                        <Input
                          id="travelCosts"
                          type="number"
                          {...register('travelCosts', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="rabatt">Rabatt %</Label>
                        <Input
                          id="rabatt"
                          type="number"
                          {...register('rabatt', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Kosten */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Optional Kosten</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="aufbauhelfer">Aufbauhelfer</Label>
                        <Input
                          id="aufbauhelfer"
                          type="number"
                          {...register('aufbauhelfer', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="variableCosts">Variable Kosten</Label>
                        <Input
                          id="variableCosts"
                          type="number"
                          {...register('variableCosts', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="ticketingFee">Ticketing Fee</Label>
                        <Input
                          id="ticketingFee"
                          type="number"
                          {...register('ticketingFee', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rechte Spalten: Event Vorschau */}
            <div className="xl:col-span-2">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-2xl font-bold text-center text-foreground mb-6">{watch('name') || 'Event Vorschau'}</h3>
                
                <div className="space-y-3 text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <span className="text-xl font-bold text-foreground">{ticketCount}</span> Tickets
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <span className="text-xl font-bold text-foreground">{termine}</span> Termine
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <span className="text-xl font-bold text-foreground">{ticketPrice}</span> € x <span className="text-xl font-bold text-foreground">{vkPercentage}</span>% VK
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="text-muted-foreground">{Math.round(ticketCount * termine * vkPercentage / 100)} verkauft</span>
                    <span className={`text-xl font-bold ${getValueColorClass(gesamtUmsatz)}`}>{formatValue(gesamtUmsatz)} €</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">GEMA ({gemaPercentage}%)</span>
                      <span className="text-foreground">{gemaFee.toLocaleString()} €</span>
                    </div>
                    {ticketingFee === 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">SHOPIFY (1,9% + 0,25€ pro Ticket)</span>
                        <span className="text-foreground">{shopifyFeeAmount.toLocaleString()} €</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">MARKETING</span>
                      <span className="text-foreground">{marketingGesamt.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">KÜNSTLER</span>
                      <span className="text-foreground">{artistGesamt.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">LOCATION</span>
                      <span className="text-foreground">{locationGesamt.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">MERCHER</span>
                      <span className="text-foreground">{merchGesamt.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">REISEKOSTEN</span>
                      <span className="text-foreground">{travelGesamt.toLocaleString()} €</span>
                    </div>
                    {rabatt > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Rabatt ({rabatt}%)</span>
                        <span className="text-foreground">- {rabattBetrag.toLocaleString()} €</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground text-lg">GEWINN</span>
                      <span className={`font-bold text-xl ${getValueColorClass(finalProfit)}`}>{formatValue(finalProfit)} €</span>
                    </div>
                  </div>

                  {(aufbauhelfer > 0 || variableCosts > 0 || ticketingFee > 0) && (
                    <div className="mt-6">
                      <div className="text-base font-bold text-foreground mb-3">OPTIONAL</div>
                      <div className="space-y-2 text-sm">
                        {aufbauhelfer > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">AUFBAU</span>
                            <span className="text-foreground">{aufbauhelferGesamt.toLocaleString()} €</span>
                          </div>
                        )}
                        {variableCosts > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">VARIABLE</span>
                            <span className="text-foreground">{variableGesamt.toLocaleString()} €</span>
                          </div>
                        )}
                        {ticketingFee > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">TICKETING</span>
                            <span className="text-foreground">{ticketingFeeGesamt.toLocaleString()} €</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground text-lg">GEWINN OHNE OPTIONAL</span>
                          <span className={`font-bold text-xl ${getValueColorClass(finalProfit - optionalCosts)}`}>{formatValue(finalProfit - optionalCosts)} €</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? editEvent ? 'Wird gespeichert...' : 'Wird gespeichert...'
                : editEvent ? 'Event speichern' : 'Event speichern & erstellen'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 