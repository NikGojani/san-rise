"use client"

import { useState, useEffect } from "react"
import { Plus, User, Mail, Phone, Trash2, FileText, Edit, Pause, Play } from "lucide-react"
import { AddEmployeeModal } from "@/components/add-employee-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { Employee } from "@/lib/schemas/employee"
import { calculateAdditionalCosts, calculateTotalMonthlyCosts } from "@/lib/schemas/employee"
import { useAuth } from "@/lib/auth-context"

export default function Employees() {
  const { hasPermission } = useAuth()
  const [employees, setEmployees] = useState<any[]>([]) // Verwende any für API-Response mit berechneten Feldern
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false)

  const canEdit = hasPermission('edit_employees')

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        if (response.ok) {
          const data = await response.json()
          setEmployees(data)
        } else {
          console.error('Fehler beim Laden der Mitarbeiter:', response.statusText)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Mitarbeiter:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const handleAddEmployee = async (employee: Employee) => {
    try {
      if (selectedEmployee) {
        // Bearbeitung über API
        const response = await fetch('/api/employees', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employee)
        })
        
        if (response.ok) {
          const updatedEmployee = await response.json()
          setEmployees((prev) =>
            prev.map((e) => (e.id === employee.id ? updatedEmployee : e))
          )
          setSelectedEmployee(null)
          toast.success('Mitarbeiter wurde erfolgreich aktualisiert')
          
          // Sende ein Event, um andere Komponenten zu benachrichtigen
          window.dispatchEvent(new CustomEvent('employee-updated'))
        } else {
          toast.error('Fehler beim Aktualisieren des Mitarbeiters')
        }
      } else {
        // Neu hinzufügen über API
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employee)
        })
        
        if (response.ok) {
          const newEmployee = await response.json()
          setEmployees((prev) => [...prev, newEmployee])
          toast.success('Mitarbeiter wurde erfolgreich hinzugefügt')
          
          // Sende ein Event, um andere Komponenten zu benachrichtigen
          window.dispatchEvent(new CustomEvent('employee-updated'))
        } else {
          toast.error('Fehler beim Hinzufügen des Mitarbeiters')
        }
      }
    } catch (error) {
      toast.error('Fehler beim Speichern des Mitarbeiters')
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsAddModalOpen(true)
  }

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedEmployee) return
    
    try {
      const response = await fetch(`/api/employees?id=${selectedEmployee.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee.id))
        setIsDeleteDialogOpen(false)
        setSelectedEmployee(null)
        toast.success('Mitarbeiter wurde erfolgreich gelöscht')
      } else {
        toast.error('Fehler beim Löschen des Mitarbeiters')
      }
    } catch (error) {
      toast.error('Fehler beim Löschen des Mitarbeiters')
    }
  }

  const showFiles = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsFilesDialogOpen(true)
  }

  const handleToggleEmployeeStatus = async (employee: Employee) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: employee.id,
          isActive: !employee.isActive
        })
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployees(prev => 
          prev.map(emp => emp.id === employee.id ? updatedEmployee : emp)
        )
        toast.success(
          `Mitarbeiter wurde ${updatedEmployee.isActive ? 'aktiviert' : 'pausiert'}`
        )
        
        // Sende ein Event, um andere Komponenten zu benachrichtigen
        window.dispatchEvent(new CustomEvent('employee-updated'))
      } else {
        throw new Error('Fehler beim Ändern des Status')
      }
    } catch (error) {
      toast.error('Fehler beim Ändern des Mitarbeiter-Status')
    }
  }

  const calculateTotalMonthlyCosts = () => {
    return employees
      .filter(employee => employee.isActive)
      .reduce((total, employee) => {
        // Sichere Number-Konvertierung um NaN zu vermeiden
        const grossSalary = Number(employee.grossSalary) || 0
        const additionalCosts = Number(employee.additionalCosts) || 0
        return total + grossSalary + additionalCosts
      }, 0)
  }

  const getActiveEmployeesCount = () => {
    return employees.filter(employee => employee.isActive).length
  }

  const getInactiveEmployeesCount = () => {
    return employees.filter(employee => !employee.isActive).length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mitarbeiterverwaltung</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Mitarbeiter und Gehaltskosten</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-6 border border-gray-300 animate-pulse">
              <div className="h-6 bg-accent rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-accent rounded"></div>
                <div className="h-4 bg-accent rounded"></div>
                <div className="h-4 bg-accent rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mitarbeiterverwaltung</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Mitarbeiter und Gehaltskosten</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Mitarbeiter hinzufügen
          </Button>
        )}
      </div>

      {/* Gesamtkosten und Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-gray-300">
          <h3 className="text-lg font-semibold text-foreground mb-2">Aktive Monatskosten</h3>
                          <p className="text-3xl font-bold text-positive">€{calculateTotalMonthlyCosts().toLocaleString()}</p>
          <p className="text-muted-foreground mt-1">Nur aktive Mitarbeiter</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border border-gray-300">
          <h3 className="text-lg font-semibold text-foreground mb-2">Aktive Mitarbeiter</h3>
          <p className="text-3xl font-bold text-blue-500">{getActiveEmployeesCount()}</p>
          <p className="text-muted-foreground mt-1">Von {employees.length} Gesamt</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border border-gray-300">
          <h3 className="text-lg font-semibold text-foreground mb-2">Pausierte Mitarbeiter</h3>
                          <p className="text-3xl font-bold text-negative">{getInactiveEmployeesCount()}</p>
          <p className="text-muted-foreground mt-1">Nicht in Kostenberechnung</p>
        </div>
      </div>

      {/* Mitarbeiter Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className={`bg-card rounded-lg p-6 border transition-all ${employee.isActive ? 'border-gray-300' : 'border-red-500/50 bg-card/50 opacity-75'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${employee.isActive ? 'bg-indigo-600' : 'bg-red-600'}`}>
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-lg font-semibold ${employee.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{employee.name}</h3>
                    {!employee.isActive && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-600 text-red-100 rounded-full">
                        Pausiert
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{employee.role}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => showFiles(employee)}
                  className="h-8 w-8 bg-transparent border-gray-300 text-foreground hover:bg-accent"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                {canEdit && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleEmployeeStatus(employee)}
                      className={`h-8 w-8 bg-transparent border-gray-300 text-foreground ${
                        employee.isActive 
                          ? 'hover:bg-red-900/20 hover:border-red-800' 
                          : 'hover:bg-green-900/20 hover:border-green-800'
                      }`}
                      title={employee.isActive ? 'Mitarbeiter pausieren' : 'Mitarbeiter aktivieren'}
                    >
                      {employee.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditEmployee(employee)}
                      className="h-8 w-8 bg-transparent border-gray-300 text-foreground hover:bg-blue-900/20 hover:border-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteEmployee(employee)}
                      className="h-8 w-8 bg-transparent border-gray-300 text-foreground hover:bg-red-900/20 hover:border-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Bruttogehalt</span>
                <span className={`font-medium ${employee.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>€{employee.grossSalary?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Zusatzkosten</span>
                <span className={`font-medium ${employee.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>€{employee.additionalCosts?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span className="text-muted-foreground text-sm font-medium">Gesamtkosten</span>
                <span className={`font-bold ${employee.isActive ? 'text-positive' : 'text-muted-foreground'}`}>€{employee.totalMonthlyCosts?.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{employee.phone}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span>Eingetreten: {new Date(employee.startDate).toLocaleDateString("de-DE")}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span>{employee.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddEmployeeModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open)
          if (!open) {
            setSelectedEmployee(null)
          }
        }}
        onEmployeeAdded={handleAddEmployee}
        editEmployee={selectedEmployee}
      />

      {/* Löschen Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-gray-300 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Mitarbeiter löschen</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Sind Sie sicher, dass Sie {selectedEmployee?.name} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-transparent border-gray-300 text-foreground hover:bg-accent"
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
        <DialogContent className="bg-card border-gray-300 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Dokumente - {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          {selectedEmployee?.files.length === 0 ? (
            <p className="text-muted-foreground">Keine Dokumente vorhanden</p>
          ) : (
            <div className="space-y-2">
              {selectedEmployee?.files.map((file: { name: string; size: number }, index: number) => (
                <div key={index} className="flex items-center justify-between bg-accent p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{file.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
            </div>
          )}
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

