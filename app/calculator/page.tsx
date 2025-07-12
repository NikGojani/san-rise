"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Calendar, TrendingUp, Edit, Trash2, Download } from "lucide-react"
import { toast } from "sonner"
import { EventCalculatorModal } from "@/components/event-calculator-modal"
import { type CalculatorEvent, calculateEventRevenue, calculateEventProfit, calculateEventMonthlyRevenue } from "@/lib/schemas/calculator-event"
import { type AppEvent } from "@/lib/supabase"
import { type CalculatorConfig } from "@/app/api/calculator-configs/route"
import type { Contract } from "@/lib/schemas/contract"
import { calculateMonthlyAmount } from "@/lib/schemas/contract"
import type { Settings } from "@/lib/schemas/settings"
import type { AdditionalCost } from "@/lib/schemas/additional-cost"
import { calculateMonthlyCostImpact } from "@/lib/schemas/additional-cost"
import * as XLSX from 'xlsx'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// Mapping-Funktionen zwischen AppEvent und CalculatorEvent
const mapAppEventToCalculatorEvent = (appEvent: AppEvent, config?: CalculatorConfig): CalculatorEvent => {
  // Wenn Config vorhanden, verwende sie; ansonsten ableiten aus Event-Daten
  const ticketPrice = appEvent.price || 0
  const ticketCount = appEvent.maxTickets || 100
  const defaultVkPercentage = appEvent.ticketsSold > 0 ? Math.round((appEvent.revenue / (ticketCount * ticketPrice)) * 100) : 100
  
  return {
    id: appEvent.id,
    name: appEvent.name,
    ticketCount: ticketCount,
    ticketPrice: ticketPrice,
    vkPercentage: config?.vkPercentage ?? Math.min(100, Math.max(0, defaultVkPercentage)),
    termine: config?.termine ?? (appEvent.termine || 1),
    gemaPercentage: config?.gemaPercentage ?? 9,
    marketingCosts: config?.marketingCosts ?? 0,
    artistCosts: config?.artistCosts ?? (appEvent.expenses * 0.6 || 0),
    locationCosts: config?.locationCosts ?? (appEvent.expenses * 0.3 || 0),
    merchandiserCosts: config?.merchandiserCosts ?? 0,
    travelCosts: config?.travelCosts ?? (appEvent.expenses * 0.1 || 0),
    rabatt: config?.rabatt ?? 0,
    aufbauhelfer: config?.aufbauhelfer ?? 0,
    variableCosts: config?.variableCosts ?? 0,
    ticketingFee: config?.ticketingFee ?? 0,
    description: appEvent.description,
    date: appEvent.date,
    createdAt: config?.createdAt ?? new Date().toISOString(),
    updatedAt: config?.updatedAt ?? new Date().toISOString(),
  }
}

const mapCalculatorEventToAppEvent = (calculatorEvent: CalculatorEvent): Partial<AppEvent> => {
  const revenue = calculateEventRevenue(calculatorEvent)
  const profit = calculateEventProfit(calculatorEvent)
  const expenses = revenue - profit
  
  return {
    name: calculatorEvent.name,
    description: calculatorEvent.description,
    date: calculatorEvent.date,
    price: calculatorEvent.ticketPrice,
    maxTickets: calculatorEvent.ticketCount,
    termine: calculatorEvent.termine,
    ticketsSold: Math.round(calculatorEvent.ticketCount * (calculatorEvent.vkPercentage / 100)),
    revenue: revenue,
    expenses: expenses,
    profit: profit,
    status: 'upcoming' as const,
    syncWithShopify: calculatorEvent.ticketingFee > 0,
  }
}

export default function Calculator() {
  const [events, setEvents] = useState<CalculatorEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalculatorEvent | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingCostsId, setEditingCostsId] = useState<string | null>(null)
  
  // Zeit-Filter für Berechnungen
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1) // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  
  // Monatliche Fixkosten
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState({
    corporateCost: false,
    corporateCostAmount: 0,
    vertragskosten: false,
    vertragskostenAmount: 0,
    zusaetzlicheKosten: false,
    zusaetzlicheKostenAmount: 0,
    steuerberater: 500,
    steuern: 0,
  })

  // Utility-Funktionen
  const getValueColorClass = (value: number): string => {
    return value < 0 ? 'text-negative' : 'text-positive'
  }

  const formatValue = (value: number): string => {
    return Math.round(value).toLocaleString()
  }

  const loadData = useCallback(async () => {
      try {
      // Lade Events
        const eventsResponse = await fetch('/api/events')
      // Lade alle Calculator-Konfigurationen
      const configsResponse = await fetch('/api/calculator-configs?all=true')
        
      let calculatorEvents: CalculatorEvent[] = []
      if (eventsResponse.ok && configsResponse.ok) {
          const appEvents: AppEvent[] = await eventsResponse.json()
        const configs: CalculatorConfig[] = await configsResponse.json()
        // Verknüpfe Events mit passender Config
        calculatorEvents = appEvents.map(appEvent => {
          const config = configs.find(cfg => cfg.eventId === appEvent.id)
          return mapAppEventToCalculatorEvent(appEvent, config)
          })
      }
          setEvents(calculatorEvents)

        // Lade Vertragskosten
        const contractsResponse = await fetch('/api/contracts')
        if (contractsResponse.ok) {
          const contracts: Contract[] = await contractsResponse.json()
          const monthlyContractCosts = contracts.reduce((total, contract) => {
            return total + calculateMonthlyAmount(contract.amount, contract.interval)
          }, 0)

          // Lade zusätzliche Kosten
          const additionalCostsResponse = await fetch('/api/additional-costs')
          if (additionalCostsResponse.ok) {
            const additionalCosts: AdditionalCost[] = await additionalCostsResponse.json()
            const currentMonth = new Date()
            const monthlyAdditionalCostsValue = additionalCosts.reduce((total, cost) => {
              return total + calculateMonthlyCostImpact(cost, currentMonth)
            }, 0)

            // Lade Mitarbeiterkosten
            const employeeCostsResponse = await fetch('/api/employee-costs')
            if (employeeCostsResponse.ok) {
              const employeeCosts = await employeeCostsResponse.json()

              setMonthlyFixedCosts(prev => ({
                ...prev,
              vertragskosten: monthlyContractCosts > 0,
              vertragskostenAmount: monthlyContractCosts,
              zusaetzlicheKosten: monthlyAdditionalCostsValue > 0,
              zusaetzlicheKostenAmount: monthlyAdditionalCostsValue,
                corporateCost: employeeCosts.totalMonthlyCosts > 0,
                corporateCostAmount: employeeCosts.totalMonthlyCosts,
              }))
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error)
        toast.error('Fehler beim Laden der Daten')
      } finally {
        setLoading(false)
      }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateFixedCosts = (field: string, value: number | boolean) => {
    setMonthlyFixedCosts(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEventSaved = async (event: CalculatorEvent) => {
    try {
      // Wandle Calculator Event in App Event um
      const appEventData = mapCalculatorEventToAppEvent(event)
      
      let response
      let eventId = event.id
      
      if (editingEvent && editingEvent.id) {
        // Update existing event - verwende die ID vom editingEvent
        response = await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...appEventData, id: editingEvent.id }),
        })
        eventId = editingEvent.id
      } else {
        // Create new event
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appEventData),
        })
        
        if (response.ok) {
          const newAppEvent: AppEvent = await response.json()
          eventId = newAppEvent.id
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Fehler beim Speichern des Events')
        return
      }
      
      // Update lokale State
      const finalEvent = { ...event, id: eventId }
      if (editingEvent && editingEvent.id) {
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? finalEvent : e))
        toast.success('Event erfolgreich aktualisiert')
      } else {
        setEvents(prev => [...prev, finalEvent])
        toast.success('Event erfolgreich erstellt')
      }
      
    } catch (error) {
      console.error('Fehler beim Speichern des Events:', error)
      toast.error('Fehler beim Speichern des Events')
      return
    }
    setEditingEvent(undefined)
    setIsEventModalOpen(false)
    // Nach dem Speichern Events und Kalkulationen neu laden
    loadData()
  }

  const handleEditEvent = (event: CalculatorEvent) => {
    setEditingEvent(event)
    setIsEventModalOpen(true)
  }

  const handleUpdateEventCosts = async (eventId: string, costs: Partial<CalculatorEvent>) => {
    try {
      // Aktualisiere lokalen State sofort
      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, ...costs } : e
      ))

      // Speichere Änderungen in Event (expenses werden basierend auf den Kosten berechnet)
      const event = events.find(e => e.id === eventId)
      if (!event) return

      const updatedEvent = { ...event, ...costs }
      const revenue = calculateEventRevenue(updatedEvent)
      const profit = calculateEventProfit(updatedEvent)
      const expenses = revenue - profit

      const appEventData = {
        ...mapCalculatorEventToAppEvent(updatedEvent),
        expenses: expenses,
        id: eventId
      }

      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appEventData),
      })

      if (!response.ok) {
        // Rückgängig machen bei Fehler
        setEvents(prev => prev.map(e => 
          e.id === eventId ? event : e
        ))
        throw new Error('Fehler beim Speichern')
      }

      toast.success('Kosten erfolgreich aktualisiert')
    } catch (error) {
      console.error('Error updating event costs:', error)
      toast.error('Fehler beim Aktualisieren der Kosten')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Event löschen möchten?')) {
      return
    }

    setDeletingId(id)
    try {
      // Lösche zuerst die Calculator-Konfiguration (wird automatisch gelöscht durch CASCADE)
      // aber wir können es trotzdem explizit machen für bessere Kontrolle
      try {
        await fetch(`/api/calculator-configs?eventId=${id}`, {
          method: 'DELETE',
        })
      } catch (configError) {
        console.warn('Fehler beim Löschen der Calculator-Konfiguration:', configError)
      }
      
      // Lösche das Event
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEvents(events.filter(event => event.id !== id))
        toast.success('Event erfolgreich gelöscht')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Fehler beim Löschen des Events')
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Events:', error)
      toast.error('Fehler beim Löschen des Events')
    } finally {
      setDeletingId(null)
    }
  }

  // Berechnungen für alle Events zusammen basierend auf Event-Daten
  const aggregateCalculations = () => {
    // Events nach Monaten und Jahren gruppieren
    const eventsByMonth = new Map<string, CalculatorEvent[]>()
    const eventsByQuarter = new Map<number, CalculatorEvent[]>()
    
    // Alle Events für das ausgewählte Jahr sammeln
    const yearEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === selectedYear
    })
    
    yearEvents.forEach(event => {
      const eventDate = new Date(event.date)
      const month = eventDate.getMonth() + 1 // 1-12
      const quarter = Math.ceil(month / 3)
      
      const monthKey = `${selectedYear}-${month.toString().padStart(2, '0')}`
      
      if (!eventsByMonth.has(monthKey)) {
        eventsByMonth.set(monthKey, [])
      }
      eventsByMonth.get(monthKey)!.push(event)
      
      if (!eventsByQuarter.has(quarter)) {
        eventsByQuarter.set(quarter, [])
      }
      eventsByQuarter.get(quarter)!.push(event)
    })

    // Monatliche Berechnungen für den ausgewählten Monat
    const selectedMonthKey = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
    const selectedMonthEvents = eventsByMonth.get(selectedMonthKey) || []
    
    const selectedMonthRevenue = selectedMonthEvents.reduce((total, event) => {
      return total + calculateEventMonthlyRevenue(event)
    }, 0)
    
    // Durchschnittliche monatliche Einnahmen für das Jahr
    let totalMonthlyRevenue = 0
    const monthlyRevenues = new Map<string, number>()
    
    eventsByMonth.forEach((monthEvents, monthKey) => {
      const monthRevenue = monthEvents.reduce((total, event) => {
        return total + calculateEventMonthlyRevenue(event)
      }, 0)
      monthlyRevenues.set(monthKey, monthRevenue)
      totalMonthlyRevenue += monthRevenue
    })
    
    const averageMonthlyRevenue = totalMonthlyRevenue / 12

    const monthlyAdditionalCosts = 
      (monthlyFixedCosts.corporateCost ? monthlyFixedCosts.corporateCostAmount : 0) + 
      (monthlyFixedCosts.vertragskosten ? monthlyFixedCosts.vertragskostenAmount : 0) + 
      monthlyFixedCosts.steuerberater

    // Berechnungen für den ausgewählten Monat
    const selectedMonthBasicProfit = selectedMonthRevenue - monthlyAdditionalCosts
    const selectedMonthTaxAmount = selectedMonthBasicProfit * (monthlyFixedCosts.steuern / 100)
    const selectedMonthOptionalProfit = selectedMonthBasicProfit - selectedMonthTaxAmount

    // Durchschnittliche monatliche Berechnungen für das Jahr
    const monthlyBasicProfit = averageMonthlyRevenue - monthlyAdditionalCosts
    const monthlyTaxAmount = monthlyBasicProfit * (monthlyFixedCosts.steuern / 100)
    const monthlyOptionalProfit = monthlyBasicProfit - monthlyTaxAmount

    // Quartalsberechnungen basierend auf tatsächlichen Event-Daten
    const quarterlyProfits = new Map<number, number>()
    for (let q = 1; q <= 4; q++) {
      const quarterEvents = eventsByQuarter.get(q) || []
      // Alle Monate, in denen im Quartal Events stattfinden
      const monthsInQuarter = Array.from(new Set(quarterEvents.map(event => (new Date(event.date).getMonth() + 1))))
      // Summe aller Gewinne der Events im Quartal
      const quarterRevenue = quarterEvents.reduce((total, event) => {
        return total + calculateEventMonthlyRevenue(event)
      }, 0)
      // Kosten nur für Monate mit Events im Quartal
      const quarterCosts = monthsInQuarter.length * monthlyAdditionalCosts
      const quarterBasicProfit = quarterRevenue - quarterCosts
      const quarterTaxAmount = quarterBasicProfit * (monthlyFixedCosts.steuern / 100)
      const quarterProfit = quarterBasicProfit - quarterTaxAmount
      quarterlyProfits.set(q, quarterProfit)
    }

    const yearlyOptionalProfit = Array.from(quarterlyProfits.values()).reduce((sum, profit) => sum + profit, 0)

    return {
      totalMonthlyRevenue: averageMonthlyRevenue,
      selectedMonthRevenue,
      selectedMonthOptionalProfit,
      selectedMonthTaxAmount,
      selectedMonthEvents,
      monthlyAdditionalCosts,
      monthlyBasicProfit,
      monthlyTaxAmount,
      monthlyOptionalProfit,
      yearlyOptionalProfit,
      quarterlyProfits,
      eventsByMonth,
      eventsByQuarter
    }
  }

  const calculations = aggregateCalculations()

  const exportToExcel = () => {
    const data = [
      ['Kostenrechner Übersicht - Alle Events', ''],
      ['', ''],
      ['PRO MONAT', ''],
      ['Gesamt Event-Gewinne', `€${calculations.totalMonthlyRevenue.toLocaleString()}`],
      ['Mitarbeiterkosten', `€${monthlyFixedCosts.corporateCostAmount.toLocaleString()}`],
      ['Vertragskosten', `€${monthlyFixedCosts.vertragskostenAmount.toLocaleString()}`],
      ['Steuerberater', `€${monthlyFixedCosts.steuerberater.toLocaleString()}`],
      ['Grundgewinn', `€${calculations.monthlyBasicProfit.toLocaleString()}`],
      ['Endgewinn', `€${calculations.monthlyOptionalProfit.toLocaleString()}`],
      ['', ''],
      ['PRO JAHR', ''],
      ['Jahresgewinn', `€${calculations.yearlyOptionalProfit.toLocaleString()}`],
      ['', ''],
      ['EINZELNE EVENTS', ''],
      ...events.map(event => [
        event.name,
        `€${calculateEventMonthlyRevenue(event).toLocaleString()}`
      ])
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Kostenrechner')
    XLSX.writeFile(wb, 'kostenrechner.xlsx')
    toast.success('Excel-Datei wurde heruntergeladen')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">Kostenrechner</h1>
              <p className="text-muted-foreground text-lg">Event-basierte Kostenplanung und Gewinnberechnung</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-3">Kostenrechner</h1>
            <p className="text-muted-foreground text-lg">Event-basierte Kostenplanung und Gewinnberechnung</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => {
                setEditingEvent(undefined)
                setIsEventModalOpen(true)
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Event hinzufügen</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Event Cards */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Events</h2>
            {events.length === 0 ? (
              <div className="bg-card rounded-lg p-8 border border-border text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Keine Events vorhanden</h3>
                <p className="text-muted-foreground mb-4">Erstellen Sie Ihr erstes Event um mit der Kostenplanung zu beginnen.</p>
                <button
                  onClick={() => {
                    setEditingEvent(undefined)
                    setIsEventModalOpen(true)
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Erstes Event erstellen</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const revenue = calculateEventRevenue(event)
                  const profit = calculateEventProfit(event)
                  const monthlyRevenue = calculateEventMonthlyRevenue(event)
                  
                  return (
                    <div key={event.id} className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('de-DE')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deletingId === event.id}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Tickets gesamt:</span>
                          <span className="font-medium">{event.ticketCount * event.termine} ({event.ticketCount} x {event.termine}) x {event.ticketPrice}€</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Termine/Monat:</span>
                          <span className="font-medium">{event.termine}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Gewinn pro Termin:</span>
                          <span className={`font-bold ${getValueColorClass(profit)}`}>
                            {formatValue(profit)} €
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-3">
                          <span className="font-semibold text-foreground">Gewinn für alle Termine:</span>
                          <span className={`font-bold text-lg ${getValueColorClass(monthlyRevenue)}`}>
                            {formatValue(monthlyRevenue)} €
                          </span>
                        </div>
                        
                        {/* Kosten bearbeiten Toggle und erweiterte Kostenbearbeitung entfernen */}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">
                          {event.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* PRO MONAT und PRO JAHR - nur anzeigen wenn Events vorhanden */}
          {events.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PRO MONAT */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-2xl font-bold text-center text-foreground mb-4">PRO MONAT</h2>
                
                {/* Monat und Jahr Auswahl */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Monat</label>
                    <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Monat wählen" />
                      </SelectTrigger>
                      <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={String(month)}>
                          {new Date(2024, month - 1).toLocaleDateString('de-DE', { month: 'long' })}
                          </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Jahr</label>
                    <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Jahr wählen" />
                      </SelectTrigger>
                      <SelectContent>
                      {(() => {
                        const eventYears = Array.from(new Set(events.map(event => new Date(event.date).getFullYear())))
                        const currentYear = new Date().getFullYear()
                        const allYears = [...new Set([...eventYears, currentYear])].sort()
                        return allYears.map(year => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))
                      })()}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3 text-base">
                  <div className="text-center mb-5">
                    <div className="text-3xl font-bold text-foreground">
                      {calculations.selectedMonthEvents.length} Events
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Monatsgewinn {new Date(2024, selectedMonth - 1).toLocaleDateString('de-DE', { month: 'long' })} {selectedYear} = {formatValue(calculations.selectedMonthRevenue)} €
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Events in diesem Monat: {calculations.selectedMonthEvents.map(e => e.name).join(', ') || 'Keine Events'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Corporate Cost Checkbox - nicht bearbeitbar */}
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={monthlyFixedCosts.corporateCost} 
                        onChange={(e) => handleUpdateFixedCosts("corporateCost", e.target.checked)}
                        className="rounded border-gray-300 text-gray-600 focus:ring-gray-500" 
                      />
                      <span className="text-foreground font-medium text-sm">CORPORATE</span>
                      <span className="text-foreground text-sm ml-auto">{monthlyFixedCosts.corporateCostAmount.toLocaleString()} €</span>
                    </div>
                    
                    {/* Vertragskosten mit Checkbox */}
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={monthlyFixedCosts.vertragskosten} 
                        onChange={(e) => handleUpdateFixedCosts("vertragskosten", e.target.checked)}
                        className="rounded border-gray-300 text-gray-600 focus:ring-gray-500" 
                      />
                      <span className="text-foreground font-medium text-sm">VERTRÄGE</span>
                      <span className="text-foreground text-sm ml-auto">{monthlyFixedCosts.vertragskostenAmount.toLocaleString()} €</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">STEUERBERATER</span>
                      <input
                        type="number"
                        value={monthlyFixedCosts.steuerberater}
                        onChange={(e) => handleUpdateFixedCosts("steuerberater", Number(e.target.value))}
                        className="w-20 px-1 py-1 bg-input border border-border rounded text-foreground text-xs"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">STEUERN</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={monthlyFixedCosts.steuern}
                          onChange={(e) => handleUpdateFixedCosts("steuern", Number(e.target.value))}
                          className="w-16 px-1 py-1 bg-input border border-border rounded text-foreground text-xs"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                        <span className="text-foreground text-sm ml-2">{formatValue(calculations.selectedMonthTaxAmount)} €</span>
                      </div>
                    </div>
                  </div>

                  <div className={`${calculations.selectedMonthOptionalProfit >= 0 ? 'bg-positive' : 'bg-negative'} text-white text-center py-3 rounded-lg mt-5`}>
                    <div className="text-xl font-bold">GEWINN {formatValue(calculations.selectedMonthOptionalProfit)} €</div>
                  </div>
                </div>
              </div>

              {/* PRO JAHR */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-2xl font-bold text-center text-foreground mb-4">PRO JAHR</h2>
                
                {/* Jahr Auswahl */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Jahr</label>
                  <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Jahr wählen" />
                    </SelectTrigger>
                    <SelectContent>
                    {(() => {
                      const eventYears = Array.from(new Set(events.map(event => new Date(event.date).getFullYear())))
                      const currentYear = new Date().getFullYear()
                      const allYears = [...new Set([...eventYears, currentYear])].sort()
                      return allYears.map(year => (
                          <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))
                    })()}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Events {selectedYear}</span>
                      <span className="text-2xl font-bold text-foreground">{events.filter(e => new Date(e.date).getFullYear() === selectedYear).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Quartalssumme</span>
                      <span className={`text-2xl font-bold ${getValueColorClass(calculations.yearlyOptionalProfit)}`}>
                        {formatValue(calculations.yearlyOptionalProfit)} €
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Steuern/Jahr</span>
                      <span className="text-xl font-bold text-foreground">{(calculations.monthlyTaxAmount * 12).toLocaleString()} €</span>
                    </div>
                  </div>

                  <div className={`${calculations.yearlyOptionalProfit >= 0 ? 'bg-positive' : 'bg-negative'} text-white text-center py-4 rounded-lg mt-6`}>
                    <div className="text-xl font-bold">JAHRESGEWINN {formatValue(calculations.yearlyOptionalProfit)} €</div>
                  </div>

                  {/* Quartals-Übersicht Karten */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => {
                      const quarterNumber = index + 1
                      const quarterAmount = calculations.quarterlyProfits?.get(quarterNumber) || 0
                      const quarterEvents = calculations.eventsByQuarter?.get(quarterNumber) || []
                      
                      return (
                        <div key={quarter} className={`${quarterAmount >= 0 ? 'bg-positive/10 border-positive/20' : 'bg-negative/10 border-negative/20'} rounded-lg p-3 border`}>
                          <div className="text-center">
                            <div className={`text-xs font-medium ${quarterAmount >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {quarter} Gewinn ({quarterEvents.length} Events)
                            </div>
                            <div className={`text-lg font-bold ${quarterAmount >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {formatValue(quarterAmount)} €
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Event Calculator Modal */}
        <EventCalculatorModal
          open={isEventModalOpen}
          onOpenChange={(open) => {
            setIsEventModalOpen(open)
            if (!open) setEditingEvent(undefined)
          }}
          onEventSaved={handleEventSaved}
          editEvent={editingEvent}
        />
      </div>
    </div>
  )
} 