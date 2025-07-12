"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"

type TimeRange = "today" | "7days" | "30days"

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

interface AdditionalCost {
  id: string
  name: string
  amount: number
  type: "one-time" | "monthly" | "yearly"
  category: string
  date: string
  description?: string
}

export function DashboardStats() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days")
  const [liveData, setLiveData] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    totalTickets: 0,
    loading: true
  })

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        // Lade alle Daten parallel
        const [contractsRes, employeesRes, costsRes, eventsRes, additionalCostsRes] = await Promise.all([
          fetch('/api/contracts', { cache: 'no-store' }),
          fetch('/api/employees', { cache: 'no-store' }),
          fetch('/api/employee-costs', { cache: 'no-store' }),
          fetch('/api/events', { cache: 'no-store' }),
          fetch('/api/additional-costs', { cache: 'no-store' })
        ])

        const contracts = contractsRes.ok ? await contractsRes.json() : []
        const employees = employeesRes.ok ? await employeesRes.json() : []
        const employeeCosts = costsRes.ok ? await costsRes.json() : { totalMonthlyCosts: 0 }
        const events: Event[] = eventsRes.ok ? await eventsRes.json() : []
        const additionalCosts: AdditionalCost[] = additionalCostsRes.ok ? await additionalCostsRes.json() : []

        // Berechne monatliche Vertragskosten
        const monthlyContractCosts = contracts.reduce((total: number, contract: any) => {
          if (contract.interval === "monthly") {
            return total + contract.amount
          } else if (contract.interval === "yearly") {
            return total + contract.amount / 12
          }
          return total
        }, 0)

        // Berechne monatliche zusätzliche Kosten
        const monthlyAdditionalCosts = additionalCosts.reduce((total: number, cost: AdditionalCost) => {
          if (cost.type === "monthly") {
            return total + cost.amount
          } else if (cost.type === "yearly") {
            return total + cost.amount / 12
          }
          // Einmalige Kosten werden nicht in monatliche Gesamtkosten einberechnet
          return total
        }, 0)

        // Berechne Kosten basierend auf Zeitraum
        const monthlyTotalCosts = employeeCosts.totalMonthlyCosts + monthlyContractCosts + monthlyAdditionalCosts
        let timeBasedCosts = 0
        
        switch (timeRange) {
          case "today":
            timeBasedCosts = Math.round(monthlyTotalCosts / 30) // Tägliche Kosten
            break
          case "7days":
            timeBasedCosts = Math.round((monthlyTotalCosts / 30) * 7) // Kosten für 7 Tage
            break
          case "30days":
            timeBasedCosts = Math.round(monthlyTotalCosts) // Monatliche Kosten
            break
          default:
            timeBasedCosts = Math.round(monthlyTotalCosts)
        }

        // Filter Events basierend auf Zeitraum
        const now = new Date()
        const filteredEvents = events.filter(event => {
          const eventDate = new Date(event.date)
          const daysDiff = Math.ceil((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))
          
          switch (timeRange) {
            case "today":
              return daysDiff === 0
            case "7days":
              return daysDiff >= 0 && daysDiff <= 7
            case "30days":
              return daysDiff >= 0 && daysDiff <= 30
            default:
              return true
          }
        })

        // Berechne Event-Statistiken
        const totalRevenue = filteredEvents.reduce((sum, event) => sum + event.revenue, 0)
        const totalTickets = filteredEvents.reduce((sum, event) => sum + event.ticketsSold, 0)

        setLiveData({
          totalRevenue,
          totalCosts: timeBasedCosts,
          totalTickets,
          loading: false
        })
      } catch (error) {
        console.error('Fehler beim Laden der Live-Daten:', error)
        setLiveData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchLiveData()
    // Aktualisiere alle 15 Sekunden für bessere Live-Darstellung
    const interval = setInterval(fetchLiveData, 15000)
    return () => clearInterval(interval)
  }, [timeRange])

  const getTimeRangeText = () => {
    switch (timeRange) {
      case "today":
        return "heute"
      case "7days":
        return "letzte 7 Tage"
      case "30days":
        return "letzte 30 Tage"
      default:
        return ""
    }
  }

  const stats = [
    {
      name: "Gesamtumsatz",
      value: liveData.loading ? "Laden..." : `€${liveData.totalRevenue.toLocaleString()}`,
      change: `${getTimeRangeText()}`,
      changeType: "positive" as const,
      icon: TrendingUp,
      subtitle: "aus Events",
    },
    {
      name: "Tickets verkauft",
      value: liveData.loading ? "..." : liveData.totalTickets.toLocaleString(),
      change: `${getTimeRangeText()}`,
      changeType: "positive" as const,
      icon: Ticket,
      subtitle: "bei Events",
    },
    {
      name: "KOSTEN", 
      value: liveData.loading ? "Laden..." : `€${liveData.totalCosts.toLocaleString()}`,
      change: `${getTimeRangeText()}`,
      changeType: "negative" as const,
      icon: DollarSign,
      subtitle: "Mitarbeiter + Verträge + Zusätzliche",
    },
  ]

  const timeRangeButtons = [
    { key: "today" as TimeRange, label: "Heute" },
    { key: "7days" as TimeRange, label: "Letzte 7 Tage" },
    { key: "30days" as TimeRange, label: "Letzte 30 Tage" },
  ]

  return (
    <div className="space-y-6">
      {/* Zeitraum Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Übersicht</h2>
        <div className="flex items-center space-x-2">
          {timeRangeButtons.map((button) => (
            <Button
              key={button.key}
              variant={timeRange === button.key ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(button.key)}
              className="text-sm"
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistik Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-card rounded-xl p-8 border border-gray-300 hover:border-accent transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-sm font-medium mb-3 truncate">{stat.name}</p>
                <p className="text-3xl font-bold text-foreground leading-tight">{stat.value}</p>
              </div>
              <div className={`rounded-xl p-4 ml-4 flex-shrink-0 ${
                stat.name === "KOSTEN"
                  ? "bg-transparent border-2 border-negative" 
                  : stat.name === "Gesamtumsatz" || stat.name === "Tickets verkauft"
                  ? "bg-positive"
                  : "bg-positive"
              }`}>
                <stat.icon className={`h-7 w-7 ${
                  stat.name === "KOSTEN" 
                    ? "text-negative" 
                    : "text-positive-foreground"
                }`} />
              </div>
            </div>
            <div className="flex items-center pt-2">
              <span className="text-sm font-semibold text-muted-foreground">
                {stat.change}
              </span>
              <span className="text-muted-foreground text-sm ml-2">{stat.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
