"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Paperclip, Download, Upload } from "lucide-react"
import { AddContractModal } from "@/components/add-contract-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { Contract } from "@/lib/schemas/contract"
import { calculateMonthlyAmount, calculateYearlyAmount } from "@/lib/schemas/contract"
import { useAuth } from "@/lib/auth-context"

export default function Contracts() {
  const { hasPermission } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false)

  const canEdit = hasPermission('edit_contracts')

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/contracts')
        if (response.ok) {
          const data = await response.json()
          setContracts(data)
        } else {
          console.error('Fehler beim Laden der Verträge:', response.statusText)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Verträge:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [])

  const handleAddContract = async (contract: Contract) => {
    // Das Modal ruft jetzt direkt die API auf, hier aktualisieren wir nur die lokale State
    if (selectedContract) {
      // Update existing contract in local state
      setContracts((prev) =>
        prev.map((c) => (c.id === contract.id ? contract : c))
      )
      setSelectedContract(null)
    } else {
      // Add new contract to local state
      setContracts((prev) => [...prev, contract])
    }
  }

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract)
    setIsAddModalOpen(true)
  }

  const handleDeleteContract = (contract: Contract) => {
    setSelectedContract(contract)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedContract) return
    
    try {
      const response = await fetch(`/api/contracts?id=${selectedContract.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setContracts((prev) => prev.filter((c) => c.id !== selectedContract.id))
        setIsDeleteDialogOpen(false)
        setSelectedContract(null)
        toast.success('Vertrag wurde erfolgreich gelöscht')
      } else {
        toast.error('Fehler beim Löschen des Vertrags')
      }
    } catch (error) {
      toast.error('Fehler beim Löschen des Vertrags')
    }
  }

  const showFiles = (contract: Contract) => {
    setSelectedContract(contract)
    setIsFilesDialogOpen(true)
  }

  const getIntervalText = (interval: string) => {
    switch (interval) {
      case "monthly":
        return "Monatlich"
      case "yearly":
        return "Jährlich"
      case "once":
        return "Einmalig"
      default:
        return interval
    }
  }

  const calculateTotalMonthlyCosts = () => {
    return contracts.reduce((total, contract) => {
      return total + calculateMonthlyAmount(contract.amount, contract.interval)
    }, 0)
  }

  const calculateTotalYearlyCosts = () => {
    return contracts.reduce((total, contract) => {
      return total + calculateYearlyAmount(contract.amount, contract.interval)
    }, 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vertragskosten</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Verträge und Kosten</p>
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
          <h1 className="text-3xl font-bold text-foreground">Vertragskosten</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Verträge und Kosten</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Vertrag hinzufügen
          </Button>
        )}
      </div>

      {/* Gesamtkosten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2">Monatliche Gesamtkosten</h3>
                          <p className="text-3xl font-bold text-positive">€{calculateTotalMonthlyCosts().toFixed(2)}</p>
          <p className="text-muted-foreground text-sm mt-1">Durchschnittliche monatliche Belastung</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2">Jährliche Gesamtkosten</h3>
          <p className="text-3xl font-bold text-blue-500">€{calculateTotalYearlyCosts().toFixed(2)}</p>
          <p className="text-muted-foreground text-sm mt-1">Gesamte jährliche Belastung</p>
        </div>
      </div>

      {/* Verträge Tabelle */}
      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Vertragsname</th>
                <th className="text-right py-4 px-6 text-muted-foreground font-medium">Betrag (€)</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Kategorie</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Intervall</th>
                <th className="text-right py-4 px-6 text-muted-foreground font-medium">Monatlich (€)</th>
                <th className="text-right py-4 px-6 text-muted-foreground font-medium">Jährlich (€)</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Startdatum</th>
                <th className="text-center py-4 px-6 text-muted-foreground font-medium">Anhänge</th>
                <th className="text-center py-4 px-6 text-muted-foreground font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 px-6 text-foreground font-medium">{contract.name}</td>
                  <td className="py-4 px-6 text-right text-foreground">€{contract.amount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-foreground">{contract.category}</td>
                  <td className="py-4 px-6 text-foreground">{getIntervalText(contract.interval)}</td>
                  <td className="py-4 px-6 text-right text-foreground">
                    €{calculateMonthlyAmount(contract.amount, contract.interval).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-right text-foreground">
                    €{calculateYearlyAmount(contract.amount, contract.interval).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-foreground">
                    {new Date(contract.startDate).toLocaleDateString("de-DE")}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {contract.attachments && contract.attachments.length > 0 ? (
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showFiles(contract)}
                          className="h-8 text-primary hover:text-primary/80"
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          <span>{contract.attachments.length}</span>
                        </Button>
                      </div>
                    ) : canEdit ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContract(contract)}
                        className="h-8 text-muted-foreground hover:text-foreground"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {canEdit ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditContract(contract)}
                          className="h-8 text-primary hover:text-primary/80"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContract(contract)}
                          className="h-8 text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddContractModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onContractAdded={handleAddContract}
        editContract={selectedContract || undefined}
      />

      {/* Löschen Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Vertrag löschen</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Sind Sie sicher, dass Sie den Vertrag "{selectedContract?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className=""
            >
              Abbrechen
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dateien Dialog */}
      <Dialog open={isFilesDialogOpen} onOpenChange={setIsFilesDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Dokumente - {selectedContract?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {selectedContract?.attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{file.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                    className="h-8 text-primary hover:text-primary/80"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsFilesDialogOpen(false)}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
