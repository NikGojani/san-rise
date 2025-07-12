"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useState, useEffect } from "react"

export function CostChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lade Vertragskosten
        const contractsResponse = await fetch('/api/contracts')
        const contractsData = contractsResponse.ok ? await contractsResponse.json() : []

        // Berechne monatliche Vertragskosten
        const monthlyContractCosts = contractsData.reduce((total: number, contract: any) => {
          if (contract.interval === "monthly") {
            return total + contract.amount
          } else if (contract.interval === "yearly") {
            return total + contract.amount / 12
          }
          return total
        }, 0)

        // Lade Mitarbeiterkosten (nur aktive)
        const employeeCostsResponse = await fetch('/api/employee-costs')
        const employeeCostsData = employeeCostsResponse.ok ? await employeeCostsResponse.json() : { totalMonthlyCosts: 0 }

        // Lade zusätzliche Kosten
        const additionalCostsResponse = await fetch('/api/additional-costs')
        const additionalCostsData = additionalCostsResponse.ok ? await additionalCostsResponse.json() : []
        
        // Berechne monatliche zusätzliche Kosten für aktuellen Monat
        const currentMonth = new Date()
        const monthlyAdditionalCosts = additionalCostsData.reduce((total: number, cost: any) => {
          // Einfache Berechnung basierend auf cost.type
          if (cost.type === "monthly") {
            return total + cost.amount
          } else if (cost.type === "yearly") {
            return total + cost.amount / 12
          } else if (cost.type === "one-time") {
            // Nur wenn im aktuellen Monat
            const costDate = new Date(cost.date)
            if (costDate.getMonth() === currentMonth.getMonth() && 
                costDate.getFullYear() === currentMonth.getFullYear()) {
              return total + cost.amount
            }
          }
          return total
        }, 0)

        const chartData = [
          { name: "Vertragskosten", value: monthlyContractCosts, color: "hsl(var(--chart-5))" },
          { name: "Mitarbeiterkosten", value: employeeCostsData.totalMonthlyCosts, color: "hsl(var(--chart-2))" },
          { name: "Zusätzliche Kosten", value: monthlyAdditionalCosts, color: "hsl(var(--chart-1))" },
        ]

        setData(chartData)
      } catch (error) {
        console.error('Fehler beim Laden der Kostendaten:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-8 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">Kostenverteilung (Monatlich)</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Lade Kostendaten...</div>
        </div>
      </div>
    )
  }

  // Berechne Gesamtkosten
  const totalCosts = data.reduce((total, item) => total + item.value, 0)

  return (
    <div className="bg-card rounded-xl p-8 border border-border">
      <h3 className="text-xl font-semibold text-foreground mb-6">Monatliche Kosten</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value" stroke="transparent">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`€${value.toLocaleString()}`, ""]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                color: "hsl(var(--primary-foreground))",
                fontSize: "14px",
                padding: "8px 12px",
              }}
              itemStyle={{
                color: "hsl(var(--primary-foreground))",
              }}
              labelStyle={{
                color: "hsl(var(--primary-foreground))",
                fontWeight: "bold",
              }}
            />
            <Legend
              wrapperStyle={{
                color: "hsl(var(--foreground))",
                fontSize: "14px",
                paddingTop: "20px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        {data.map((item, index) => (
          <div key={index} className="bg-accent/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">{item.name}</div>
            <div className="text-lg font-bold text-foreground">€{item.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
      
      {/* Gesamtsumme */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">Gesamtkosten pro Monat</div>
          <div className="text-2xl font-bold text-primary">€{totalCosts.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
