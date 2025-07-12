"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskList } from "@/components/task-list"
import { TaskCalendar } from "@/components/task-calendar"
import { LayoutGrid, List, Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddTaskModal } from "@/components/add-task-modal"

type ViewMode = "kanban" | "list" | "calendar"

export default function Tasks() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Aufgabenverwaltung</h1>
          <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Aufgaben und Projekte</p>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Aufgabe hinzufügen</span>
          </Button>

          <div className="flex items-center space-x-2 bg-card rounded-lg p-1 border border-gray-300">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Karten</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <List className="h-4 w-4" />
              <span>Liste</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Kalender</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === "kanban" && <KanbanBoard />}
      {viewMode === "list" && <TaskList />}
      {viewMode === "calendar" && <TaskCalendar />}

      <AddTaskModal 
        open={isAddTaskModalOpen} 
        onOpenChange={setIsAddTaskModalOpen}
      />
    </div>
  )
}
