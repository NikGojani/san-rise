"use client"

import { useState, useEffect } from "react"
import { Calendar, TrendingUp, DollarSign, Target, Plus, Edit, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Event {
  id: string
  name: string
  ticketsSold: number
  maxTickets: number
  revenue: number
  expenses: number
  profit: number
  date: string
  status: "upcoming" | "active" | "completed" | "cancelled"
}

interface MetaCampaign {
  id: string
  name: string
  adGroupIds: string[]
  spendToday: number
  spend7Days: number
  spend30Days: number
}

interface ShopifyData {
  ticketsSoldToday: number
  ticketsSold7Days: number
  ticketsSold30Days: number
  dailyAverageNeeded: number
  daysUntilEvent: number
}

// Fake data für die Diagramme
const conversionData = [
  { day: 'Mo', currentWeek: 45, lastWeek: 38 },
  { day: 'Di', currentWeek: 52, lastWeek: 41 },
  { day: 'Mi', currentWeek: 48, lastWeek: 45 },
  { day: 'Do', currentWeek: 61, lastWeek: 52 },
  { day: 'Fr', currentWeek: 55, lastWeek: 49 },
  { day: 'Sa', currentWeek: 67, lastWeek: 58 },
  { day: 'So', currentWeek: 43, lastWeek: 40 },
]

const spendData = [
  { day: 'Mo', currentWeek: 280, lastWeek: 245 },
  { day: 'Di', currentWeek: 320, lastWeek: 290 },
  { day: 'Mi', currentWeek: 310, lastWeek: 275 },
  { day: 'Do', currentWeek: 380, lastWeek: 340 },
  { day: 'Fr', currentWeek: 420, lastWeek: 385 },
  { day: 'Sa', currentWeek: 450, lastWeek: 410 },
  { day: 'So', currentWeek: 290, lastWeek: 260 },
]

type TimeFilter = "today" | "7days" | "30days" | "all"

export default function Marketing() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaign[]>([])
  const [shopifyData, setShopifyData] = useState<ShopifyData | null>(null)
  const [newCampaignId, setNewCampaignId] = useState("")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Filter events based on selected time range
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    const now = new Date()
    
    switch (timeFilter) {
      case "today":
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        return eventDate >= today && eventDate < tomorrow
      
      case "7days":
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(now.getDate() - 7)
        return eventDate >= sevenDaysAgo && eventDate <= now
      
      case "30days":
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(now.getDate() - 30)
        return eventDate >= thirtyDaysAgo && eventDate <= now
      
      case "all":
        return true
      
      default:
        return true
    }
  })

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
    
    // Fake Meta-Kampagnen für dieses Event laden
    setMetaCampaigns([
      {
        id: "1",
        name: `${event.name} - Hauptkampagne`,
        adGroupIds: ["adgroup_001", "adgroup_002"],
        spendToday: 125.50,
        spend7Days: 890.30,
        spend30Days: 3245.80
      }
    ])

    // Fake Shopify-Daten für dieses Event berechnen
    const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const remainingTickets = event.maxTickets - event.ticketsSold
    
    setShopifyData({
      ticketsSoldToday: Math.floor(Math.random() * 20) + 5,
      ticketsSold7Days: Math.floor(Math.random() * 100) + 50,
      ticketsSold30Days: event.ticketsSold,
      dailyAverageNeeded: daysUntilEvent > 0 ? Math.ceil(remainingTickets / daysUntilEvent) : 0,
      daysUntilEvent: Math.max(0, daysUntilEvent)
    })
  }

  const addMetaCampaign = () => {
    if (!newCampaignId.trim()) {
      toast.error("Bitte geben Sie eine Kampagnen-ID ein")
      return
    }

    const newCampaign: MetaCampaign = {
      id: newCampaignId,
      name: `Kampagne ${newCampaignId}`,
      adGroupIds: [newCampaignId],
      spendToday: Math.random() * 200,
      spend7Days: Math.random() * 1000,
      spend30Days: Math.random() * 4000
    }

    setMetaCampaigns([...metaCampaigns, newCampaign])
    setNewCampaignId("")
    toast.success("Kampagne erfolgreich hinzugefügt")
  }

  const getTimeFilterLabel = (filter: TimeFilter): string => {
    switch (filter) {
      case "today":
        return "Heute"
      case "7days":
        return "Letzte 7 Tage"
      case "30days":
        return "Letzte 30 Tage"
      case "all":
        return "ALLE"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketing Dashboard</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Event-Marketing-Kampagnen</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketing Dashboard</h1>
        <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Event-Marketing-Kampagnen</p>
      </div>

      {/* Zeitfilter */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center space-x-4">
          <label className="text-foreground font-medium">Zeitraum:</label>
          <div className="flex space-x-2">
            {(["today", "7days", "30days", "all"] as TimeFilter[]).map((filter) => (
              <Button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                variant={timeFilter === filter ? "default" : "outline"}
                size="sm"
                className="transition-colors"
              >
                {getTimeFilterLabel(filter)}
              </Button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            ({filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} gefunden)
          </div>
        </div>
      </div>

      {/* Events als Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Keine Events gefunden
                </h3>
                <p className="text-muted-foreground">
                  Für den ausgewählten Zeitraum "{getTimeFilterLabel(timeFilter)}" wurden keine Events gefunden.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow border border-border"
              onClick={() => openEventDetails(event)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {event.name}
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  {new Date(event.date).toLocaleDateString('de-DE')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tickets verkauft</span>
                    <span className="font-medium">{event.ticketsSold.toLocaleString()}/{event.maxTickets.toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(event.ticketsSold / event.maxTickets) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Umsatz</span>
                    <span className="font-medium text-positive">€{event.revenue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gewinn</span>
                    <span className={`font-medium ${event.profit >= 0 ? 'text-positive' : 'text-negative'}`}>
                      €{event.profit.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-center pt-2">
                    <Button size="sm" variant="outline" className="w-full">
                      Marketing Details ansehen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name} - Marketing Details</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              
              {/* Meta Kampagnen Karte (Blau) */}
              <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <CardHeader className="bg-blue-500 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span>Meta Kampagnen</span>
                    <Target className="h-5 w-5" />
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Facebook & Instagram Werbeanzeigen verwalten
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Kampagne hinzufügen */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Kampagnen-ID oder Anzeigengruppen-ID eingeben"
                        value={newCampaignId}
                        onChange={(e) => setNewCampaignId(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={addMetaCampaign}
                        className="bg-white text-blue-500 hover:bg-gray-100 border border-blue-500"
                      >
                        Kampagne hinzufügen
                      </Button>
                    </div>

                    {/* Verbundene Kampagnen */}
                    <div className="space-y-3">
                      <p className="font-medium text-foreground">
                        {metaCampaigns.length} Kampagne(n) verbunden
                      </p>
                      
                      {metaCampaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-border">
                          <h4 className="font-medium text-foreground mb-2">{campaign.name}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Heute:</span>
                              <p className="font-medium">€{campaign.spendToday.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">7 Tage:</span>
                              <p className="font-medium">€{campaign.spend7Days.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">30 Tage:</span>
                              <p className="font-medium">€{campaign.spend30Days.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shopify Ticket-Verkäufe Karte */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ticket-Verkäufe (Shopify)</span>
                    <DollarSign className="h-5 w-5" />
                  </CardTitle>
                  <CardDescription>
                    Live-Daten für {selectedEvent.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {shopifyData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{shopifyData.ticketsSoldToday}</p>
                          <p className="text-sm text-muted-foreground">Heute verkauft</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-500">{shopifyData.ticketsSold7Days}</p>
                          <p className="text-sm text-muted-foreground">7 Tage</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-positive">{shopifyData.ticketsSold30Days}</p>
                          <p className="text-sm text-muted-foreground">30 Tage</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-500">{shopifyData.dailyAverageNeeded}</p>
                          <p className="text-sm text-muted-foreground">Pro Tag nötig</p>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-center text-foreground">
                          <span className="font-medium">{shopifyData.daysUntilEvent}</span> Tage bis zum Event • 
                          <span className="font-medium"> {selectedEvent.maxTickets - selectedEvent.ticketsSold}</span> Tickets verbleibend
                        </p>
                        <p className="text-center text-sm text-muted-foreground mt-1">
                          Durchschnitt von <span className="font-medium">{shopifyData.dailyAverageNeeded} Tickets/Tag</span> für ausverkauft
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Conversion / Spend Diagramme */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Conversion Rate</span>
                    </CardTitle>
                    <CardDescription>Aktuelle Woche vs. Vorwoche</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={conversionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value}%`, 
                            name === 'currentWeek' ? 'Aktuelle Woche' : 'Vorwoche'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="currentWeek" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="currentWeek"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="lastWeek" 
                          stroke="#94a3b8" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="lastWeek"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Werbeausgaben</span>
                    </CardTitle>
                    <CardDescription>Tägliche Ausgaben in Euro</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={spendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `€${value}`, 
                            name === 'currentWeek' ? 'Aktuelle Woche' : 'Vorwoche'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="currentWeek" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          name="currentWeek"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="lastWeek" 
                          stroke="#94a3b8" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="lastWeek"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 