"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface AdditionalCost {
  id: string
  name: string
  description?: string
  amount: number
  type: "one-time" | "monthly" | "yearly"
  category: string
  date: string
  attachments?: any[]
}

export function CostManagement() {
  const { hasPermission } = useAuth()
  const [costs, setCosts] = useState<AdditionalCost[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCost, setSelectedCost] = useState<AdditionalCost | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: 0,
    type: "one-time" as "one-time" | "monthly" | "yearly",
    category: "",
    date: new Date().toISOString().slice(0, 10)
  })

  const canEdit = hasPermission('edit_contracts')

  useEffect(() => {
    fetchCosts()
  }, [])

  const fetchCosts = async () => {
    try {
      const response = await fetch('/api/additional-costs')
      if (response.ok) {
        const data = await response.json()
        setCosts(data)
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Kosten')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.amount || !formData.category) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    try {
      const method = selectedCost ? 'PUT' : 'POST'
      const url = '/api/additional-costs'
      
      const payload = selectedCost 
        ? { ...formData, id: selectedCost.id }
        : formData
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchCosts()
        resetForm()
        toast.success(selectedCost ? 'Kosten wurden aktualisiert' : 'Kosten wurden hinzugefügt')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      toast.error('Fehler beim Speichern')
    }
  }

  const handleEdit = (cost: AdditionalCost) => {
    setSelectedCost(cost)
    setFormData({
      name: cost.name,
      description: cost.description,
      amount: cost.amount,
      type: cost.type,
      category: cost.category,
      date: cost.date
    })
    setIsAddModalOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCost) return

    try {
      const response = await fetch(`/api/additional-costs?id=${selectedCost.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCosts()
        setIsDeleteDialogOpen(false)
        setSelectedCost(null)
        toast.success('Kosten wurden gelöscht')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      amount: 0,
      type: "one-time",
      category: "",
      date: new Date().toISOString().slice(0, 10)
    })
    setSelectedCost(null)
    setIsAddModalOpen(false)
  }

  const getFilteredCosts = () => {
    const [year, month] = selectedMonth.split('-')
    return costs.filter(cost => {
      const costDate = new Date(cost.date)
      const costYear = costDate.getFullYear().toString()
      const costMonth = (costDate.getMonth() + 1).toString().padStart(2, '0')
      
      if (cost.type === 'monthly' || cost.type === 'yearly') {
        return true // Wiederkehrende Kosten immer anzeigen
      }
      
      return costYear === year && costMonth === month
    })
  }

  const getTotalMonthlyCosts = () => {
    const [year, month] = selectedMonth.split('-')
    const currentDate = new Date(parseInt(year), parseInt(month) - 1)
    
    return costs.reduce((total, cost) => {
      if (cost.type === 'monthly') {
        return total + cost.amount
      } else if (cost.type === 'yearly') {
        return total + cost.amount / 12
      } else if (cost.type === 'one-time') {
        const costDate = new Date(cost.date)
        if (costDate.getMonth() === currentDate.getMonth() && 
            costDate.getFullYear() === currentDate.getFullYear()) {
          return total + cost.amount
        }
      }
      return total
    }, 0)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'bg-blue-500/20 text-blue-400'
              case 'yearly': return 'bg-positive/20 text-positive'
      case 'one-time': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'monthly': return 'Monatlich'
      case 'yearly': return 'Jährlich'
      case 'one-time': return 'Einmalig'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-accent rounded w-1/3"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-accent rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Kostenverwaltung</h3>
          <p className="text-muted-foreground text-sm">Verwalten Sie zusätzliche Kosten</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Kosten hinzufügen
          </Button>
        )}
      </div>

      {/* Monatsauswahl und Gesamtkosten */}
      <div className="flex items-center justify-between mb-6 p-4 bg-accent/20 rounded-lg">
        <div className="flex items-center space-x-4">
          <Label htmlFor="month">Monat:</Label>
          <Input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Gesamtkosten</div>
          <div className="text-2xl font-bold text-primary">
            €{getTotalMonthlyCosts().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Kosten Liste */}
      <div className="space-y-3">
        {getFilteredCosts().length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Kosten für diesen Monat gefunden
          </div>
        ) : (
          getFilteredCosts().map((cost) => (
            <div key={cost.id} className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-border">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-foreground">{cost.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(cost.type)}`}>
                    {getTypeText(cost.type)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-accent text-accent-foreground">
                    {cost.category}
                  </span>
                </div>
                {cost.description && (
                  <p className="text-sm text-muted-foreground mb-2">{cost.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>€{cost.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(cost.date).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </div>
              {canEdit && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cost)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCost(cost)
                      setIsDeleteDialogOpen(true)
                    }}
                    className="text-negative hover:text-negative/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={resetForm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedCost ? 'Kosten bearbeiten' : 'Neue Kosten hinzufügen'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Equipment-Miete"
              />
            </div>
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optionale Beschreibung"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Betrag * (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategorie *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="z.B. Equipment, Versicherung"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Typ *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">Einmalig</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Datum *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit}>
              {selectedCost ? 'Aktualisieren' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Kosten löschen</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Sind Sie sicher, dass Sie "{selectedCost?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 