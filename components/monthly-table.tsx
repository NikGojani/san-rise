"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddAdditionalCostModal } from "@/components/add-additional-cost-modal"
import type { AdditionalCost } from "@/lib/schemas/additional-cost"
import { calculateMonthlyCostImpact } from "@/lib/schemas/additional-cost"
import { toast } from "sonner"
import { calculateMonthlyAmount } from "@/lib/schemas/contract"
import type { Contract } from "@/lib/schemas/contract"

interface MonthlyData {
  month: string
  date: Date
  baseCosts: number
  additionalCosts: number
  totalCosts: number
}

export function MonthlyTable() {
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [employeeCosts, setEmployeeCosts] = useState(0)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0) // 0 = aktueller Monat

  // Dynamische Generierung der monatlichen Basis-Kosten basierend auf Mitarbeiterkosten
  const generateBaseCosts = (date: Date): number => {
    // Verwende die tatsächlichen Mitarbeiterkosten als Basis
    return employeeCosts
  }

  // Generiere Monate basierend auf aktuellem Datum und Offset
  const generateMonthlyData = (): { month: string, date: Date, baseCosts: number }[] => {
    const now = new Date()
    const startMonth = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1)
    
    const months = []
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1)
      const monthName = monthDate.toLocaleDateString('de-DE', { 
        month: 'long', 
        year: 'numeric' 
      })
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
      
      months.push({
        month: capitalizedMonth,
        date: monthDate,
        baseCosts: generateBaseCosts(monthDate)
      })
    }
    
    return months
  }

  const baseMonthlyData = generateMonthlyData()

  useEffect(() => {
    async function loadData() {
      try {
        // Lade zusätzliche Kosten
        const additionalCostsResponse = await fetch('/api/additional-costs')
        if (additionalCostsResponse.ok) {
          const additionalCostsData = await additionalCostsResponse.json()
          setAdditionalCosts(additionalCostsData)
        }

        // Lade Vertragskosten
        const contractsResponse = await fetch('/api/contracts')
        if (contractsResponse.ok) {
          const contractsData = await contractsResponse.json()
          setContracts(contractsData)
        }

        // Lade Mitarbeiterkosten
        const employeeCostsResponse = await fetch('/api/employee-costs')
        if (employeeCostsResponse.ok) {
          const employeeCostsData = await employeeCostsResponse.json()
          setEmployeeCosts(employeeCostsData.totalMonthlyCosts || 0)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    
    // Event-Listener für Updates von anderen Komponenten
    const handleCostsUpdated = () => {
      refreshData()
    }
    
    window.addEventListener('additional-costs-updated', handleCostsUpdated)
    
    return () => {
      window.removeEventListener('additional-costs-updated', handleCostsUpdated)
    }
  }, [])

  const refreshData = async () => {
    try {
      // Lade zusätzliche Kosten
      const additionalCostsResponse = await fetch('/api/additional-costs')
      if (additionalCostsResponse.ok) {
        const additionalCostsData = await additionalCostsResponse.json()
        setAdditionalCosts(additionalCostsData)
      }

      // Lade Vertragskosten
      const contractsResponse = await fetch('/api/contracts')
      if (contractsResponse.ok) {
        const contractsData = await contractsResponse.json()
        setContracts(contractsData)
      }

      // Lade Mitarbeiterkosten
      const employeeCostsResponse = await fetch('/api/employee-costs')
      if (employeeCostsResponse.ok) {
        const employeeCostsData = await employeeCostsResponse.json()
        setEmployeeCosts(employeeCostsData.totalMonthlyCosts || 0)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    }
  }

  const handleCostAdded = (newCost: AdditionalCost) => {
    setAdditionalCosts(prev => [...prev, newCost])
    // Lade die Daten neu, um sicherzustellen, dass alles synchron ist
    refreshData()
  }

  const handleDeleteCost = async (costId: string) => {
    try {
      const response = await fetch(`/api/additional-costs?id=${costId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAdditionalCosts(prev => prev.filter(cost => cost.id !== costId))
        toast.success('Kosten erfolgreich gelöscht')
      } else {
        toast.error('Fehler beim Löschen der Kosten')
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Kosten:', error)
      toast.error('Fehler beim Löschen der Kosten')
    }
  }

  const handlePreviousMonths = () => {
    setCurrentMonthOffset(prev => prev - 6)
  }

  const handleNextMonths = () => {
    setCurrentMonthOffset(prev => prev + 6)
  }

  const handleCurrentMonth = () => {
    setCurrentMonthOffset(0)
  }

  // Berechne monatliche Daten mit zusätzlichen Kosten
  const monthlyData: MonthlyData[] = baseMonthlyData.map(baseData => {
    // Berechne zusätzliche Kosten für diesen Monat
    const monthlyAdditionalCosts = additionalCosts.reduce((total, cost) => {
      return total + calculateMonthlyCostImpact(cost, baseData.date)
    }, 0)

    // Berechne Vertragskosten für diesen Monat
    const monthlyContractCosts = contracts.reduce((total, contract) => {
      return total + calculateMonthlyAmount(contract.amount, contract.interval)
    }, 0)

    const totalAdditionalCosts = monthlyAdditionalCosts + monthlyContractCosts
    
    return {
      month: baseData.month,
      date: baseData.date,
      baseCosts: baseData.baseCosts,
      additionalCosts: totalAdditionalCosts,
      totalCosts: baseData.baseCosts + totalAdditionalCosts,
    }
  })

  // Bestimme den aktuellen Monat für Hervorhebung
  const currentDate = new Date()
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear()
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-8 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">Monatliche Kosten</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-accent rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-xl p-8 border border-border">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold text-foreground">Monatliche Kosten</h3>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePreviousMonths}
                variant="outline"
                size="sm"
                className="bg-transparent border-border text-foreground hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCurrentMonth}
                variant="outline"
                size="sm"
                className="bg-transparent border-border text-foreground hover:bg-accent"
                disabled={currentMonthOffset === 0}
              >
                Heute
              </Button>
              <Button
                onClick={handleNextMonths}
                variant="outline"
                size="sm"
                className="bg-transparent border-border text-foreground hover:bg-accent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Kosten hinzufügen
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-2 text-muted-foreground font-semibold text-sm">Monat</th>
                <th className="text-right py-4 px-2 text-muted-foreground font-semibold text-sm">Basis (€)</th>
                <th className="text-right py-4 px-2 text-muted-foreground font-semibold text-sm">Zusätzlich (€)</th>
                <th className="text-right py-4 px-2 text-muted-foreground font-semibold text-sm">Gesamt (€)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, index) => {
                const isCurrent = isCurrentMonth(row.date)
                return (
                  <tr 
                    key={index} 
                    className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${
                      isCurrent ? 'bg-primary/10 border-primary/30' : ''
                    }`}
                  >
                    <td className={`py-4 px-2 font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                      {row.month}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Aktuell
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-2 text-right text-muted-foreground">€{row.baseCosts.toLocaleString()}</td>
                    <td className="py-4 px-2 text-right text-primary font-medium">
                      {row.additionalCosts > 0 ? `+€${row.additionalCosts.toLocaleString()}` : '€0'}
                    </td>
                    <td className="py-4 px-2 text-right text-foreground font-semibold">€{row.totalCosts.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td className="py-4 px-2 text-foreground font-bold">Gesamt (6 Monate)</td>
                <td className="py-4 px-2 text-right text-muted-foreground font-semibold">
                  €{monthlyData.reduce((sum, row) => sum + row.baseCosts, 0).toLocaleString()}
                </td>
                <td className="py-4 px-2 text-right text-primary font-semibold">
                  +€{monthlyData.reduce((sum, row) => sum + row.additionalCosts, 0).toLocaleString()}
                </td>
                <td className="py-4 px-2 text-right text-foreground font-bold text-lg">
                  €{monthlyData.reduce((sum, row) => sum + row.totalCosts, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Zeitrauminfo */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Zeitraum: {monthlyData[0]?.month} - {monthlyData[5]?.month}
          </div>
          <div>
            {currentMonthOffset < 0 && 'Vergangene Monate'}
            {currentMonthOffset === 0 && 'Aktueller Zeitraum'}
            {currentMonthOffset > 0 && 'Zukünftige Monate'}
          </div>
        </div>

        {additionalCosts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Zusätzliche Kosten diesen Monat:</h4>
            <div className="space-y-2">
              {additionalCosts
                .filter(cost => calculateMonthlyCostImpact(cost, new Date()) > 0)
                .slice(0, 3)
                .map((cost) => (
                  <div key={cost.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{cost.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-primary">
                        €{calculateMonthlyCostImpact(cost, new Date()).toLocaleString()}
                      </span>
                      <button
                        onClick={() => cost.id && handleDeleteCost(cost.id)}
                        className="text-negative hover:text-negative/80 p-1 rounded transition-colors"
                        title="Kosten löschen"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <AddAdditionalCostModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onCostAdded={handleCostAdded}
      />
    </>
  )
}
