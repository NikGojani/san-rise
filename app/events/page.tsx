"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, TrendingUp, DollarSign, Trash2, ShoppingCart, Edit } from "lucide-react"
import { toast } from "sonner"
import { AddEventModal } from "@/components/add-event-modal"
import { type AppEvent } from "@/lib/supabase"

export default function Events() {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<AppEvent | null>(null)
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        } else {
          console.error('Fehler beim Laden der Events:', response.statusText)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const deleteEvent = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Event löschen möchten?')) {
      return
    }

    setDeletingId(id)
    try {
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

  const handleEventAdded = async (newEvent: AppEvent) => {
    // Event zur lokalen Liste hinzufügen
    setEvents(prevEvents => [...prevEvents, newEvent])
    setIsAddEventModalOpen(false)
    toast.success('Event erfolgreich hinzugefügt')
  }

  const handleEventUpdated = async (updatedEvent: AppEvent) => {
    // Event in der lokalen Liste aktualisieren
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
    setIsEditEventModalOpen(false)
    setEditEvent(null)
    toast.success('Event erfolgreich aktualisiert')
  }

  const openEditModal = (event: AppEvent) => {
    setEditEvent(event)
    setIsEditEventModalOpen(true)
  }

  const filteredEvents = events.filter((event) => {
    if (!dateFilter) return true
    return event.date.includes(dateFilter)
  })

  const totalStats = events.reduce(
    (acc, event) => ({
      revenue: acc.revenue + event.revenue,
      expenses: acc.expenses + event.expenses,
      profit: acc.profit + event.profit,
      tickets: acc.tickets + event.ticketsSold,
    }),
    { revenue: 0, expenses: 0, profit: 0, tickets: 0 },
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events Übersicht</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Events und deren Performance</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events Übersicht</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Events und deren Performance mit Shopify-Integration</p>
        </div>
        <button 
          onClick={() => setIsAddEventModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Event hinzufügen</span>
        </button>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Gesamtumsatz</p>
                              <p className="text-2xl font-bold text-positive">€{(totalStats.revenue || 0).toLocaleString()}</p>
            </div>
            <div className="bg-positive rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-positive-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Gesamtgewinn</p>
              <p className="text-2xl font-bold text-blue-500">€{(totalStats.profit || 0).toLocaleString()}</p>
            </div>
            <div className="bg-positive rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-positive-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Tickets verkauft</p>
              <p className="text-2xl font-bold text-purple-500">{(totalStats.tickets || 0).toLocaleString()}</p>
            </div>
            <div className="bg-positive rounded-lg p-3">
              <Calendar className="h-6 w-6 text-positive-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Events gesamt</p>
              <p className="text-2xl font-bold text-primary">{events.length}</p>
            </div>
            <div className="bg-[#6575a2] rounded-lg p-3">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center space-x-4">
          <label className="text-foreground font-medium">Filter nach Datum:</label>
          <input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter("")} className="text-muted-foreground hover:text-foreground transition-colors">
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Events Tabelle */}
      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Eventname</th>
                <th className="text-center py-4 px-6 text-muted-foreground font-medium">Status</th>
                <th className="text-center py-4 px-6 text-muted-foreground font-medium">Shopify</th>
                <th className="text-right py-4 px-6 text-muted-foreground font-medium">Preis (€)</th>
                <th className="text-right py-4 px-6 text-muted-foreground font-medium">Tickets</th>
                <th className="text-right py-4 px-6 text-muted-foreground font-medium">Umsatz (€)</th>
                <th className="text-right py-4 px-6 text-muted-foreground font-medium">Gewinn (€)</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Datum</th>
                <th className="text-center py-4 px-6 text-muted-foreground font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'upcoming':
                      return 'bg-blue-600 text-blue-100'
                    case 'active':
                      return 'bg-green-600 text-green-100'
                    case 'completed':
                      return 'bg-muted text-muted-foreground'
                    case 'cancelled':
                      return 'bg-red-600 text-red-100'
                    default:
                      return 'bg-muted text-muted-foreground'
                  }
                }

                const getStatusText = (status: string) => {
                  switch (status) {
                    case 'upcoming':
                      return 'Geplant'
                    case 'active':
                      return 'Aktiv'
                    case 'completed':
                      return 'Abgeschlossen'
                    case 'cancelled':
                      return 'Abgesagt'
                    default:
                      return status
                  }
                }

                return (
                  <tr key={event.id} className="border-b border-border hover:bg-accent/50">
                    <td className="py-4 px-6">
                      <div className="text-foreground font-medium">{event.name}</div>
                      {event.location && (
                        <div className="text-sm text-muted-foreground">{event.location}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {event.syncWithShopify ? (
                        <div className="flex items-center justify-center space-x-1">
                          <ShoppingCart className="h-4 w-4 text-positive" />
                          {event.shopifyProductId && (
                            <span className="text-xs text-positive">Sync</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right text-foreground">€{event.price.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right text-foreground">
                      <div className="space-y-1">
                        <div>
                          {(event.ticketsSold || 0).toLocaleString()}/{(event.maxTickets * (event.termine || 1)).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((event.ticketsSold || 0) / (event.termine || 1)).toLocaleString()} von {event.maxTickets.toLocaleString()} pro Termin × {event.termine || 1} Termine
                        </div>
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${((event.ticketsSold || 0) / (event.termine || 1) / event.maxTickets) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-foreground">€{(event.revenue || 0).toLocaleString()}</td>
                    <td
                      className={`py-4 px-6 text-right font-medium ${
                        event.profit >= 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      €{(event.profit || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      <div>{new Date(event.date).toLocaleDateString('de-DE')}</div>
                      {event.startTime && (
                        <div className="text-sm text-muted-foreground">{event.startTime}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="text-primary hover:text-primary/80 p-2 rounded-lg hover:bg-accent transition-colors"
                          title="Event bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        disabled={deletingId === event.id}
                        className="text-negative hover:text-negative/80 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-accent transition-colors"
                        title="Event löschen"
                      >
                        {deletingId === event.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onEventAdded={handleEventAdded}
      />

      {/* Edit Event Modal */}
      {editEvent && (
        <AddEventModal
          isOpen={isEditEventModalOpen}
          onClose={() => {
            setIsEditEventModalOpen(false)
            setEditEvent(null)
          }}
          onEventAdded={handleEventUpdated}
          editEvent={editEvent}
        />
      )}
    </div>
  )
}
