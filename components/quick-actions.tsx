"use client"

import { useState } from "react"
import { FileText, CheckSquare, Calendar, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AddContractModal } from "@/components/add-contract-modal"
import { AddTaskModal } from "@/components/add-task-modal"
import { AddEmployeeModal } from "@/components/add-employee-modal"
import { AddEventModal } from "@/components/add-event-modal"
import { useTask } from "@/lib/task-context"
import { toast } from "sonner"

export function QuickActions() {
  const { hasPermission } = useAuth()
  const { refreshTasks } = useTask()
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  const handleEventAction = () => {
    setIsEventModalOpen(true)
  }

  const handleContractAdded = (contract: any) => {
    setIsContractModalOpen(false)
    toast.success('Vertrag wurde erfolgreich hinzugefügt')
    // Refresh könnte hier hinzugefügt werden wenn nötig
  }

  const handleTaskAdded = (task: any) => {
    setIsTaskModalOpen(false)
    toast.success('Aufgabe wurde erfolgreich hinzugefügt')
    refreshTasks() // Aktualisiere Tasks im Context
  }

  const handleEmployeeAdded = (employee: any) => {
    setIsEmployeeModalOpen(false)
    toast.success('Mitarbeiter wurde erfolgreich hinzugefügt')
    // Refresh könnte hier hinzugefügt werden wenn nötig
  }

  const handleEventAdded = (event: any) => {
    setIsEventModalOpen(false)
    toast.success('Event wurde erfolgreich hinzugefügt')
  }

  const actions = [
    {
      name: "Vertrag hinzufügen",
      action: () => setIsContractModalOpen(true),
      icon: FileText,
      color: "bg-[#A86B22] hover:bg-[#8A5A1F]",
      show: hasPermission('edit_contracts'),
    },
    {
      name: "Aufgabe anlegen", 
      action: () => setIsTaskModalOpen(true),
      icon: CheckSquare,
      color: "bg-[#A86B22] hover:bg-[#8A5A1F]",
      show: true,
    },
    {
      name: "Event erstellen",
      action: handleEventAction,
      icon: Calendar,
      color: "bg-[#A86B22] hover:bg-[#8A5A1F]",
      show: hasPermission('edit_contracts'),
    },
    {
      name: "Mitarbeiter hinzufügen",
      action: () => setIsEmployeeModalOpen(true),
      icon: Plus,
      color: "bg-[#A86B22] hover:bg-[#8A5A1F]",
      show: hasPermission('edit_employees'),
    },
  ].filter(action => action.show)

  return (
    <>
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Schnellaktionen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.name}
              onClick={action.action}
              className={`${action.color} rounded-lg p-4 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="bg-white/20 rounded-lg p-2 group-hover:bg-white/30 transition-colors">
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-sm block">{action.name}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddContractModal
        open={isContractModalOpen}
        onOpenChange={setIsContractModalOpen}
        onContractAdded={handleContractAdded}
      />

      <AddTaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        onTaskAdded={handleTaskAdded}
      />

      <AddEmployeeModal
        open={isEmployeeModalOpen}
        onOpenChange={setIsEmployeeModalOpen}
        onEmployeeAdded={handleEmployeeAdded}
      />

      <AddEventModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        onEventAdded={handleEventAdded}
      />
    </>
  )
}
