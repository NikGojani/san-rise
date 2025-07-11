"use client"

import { useState } from "react"
import { CheckCircle, Circle, ExternalLink, Plus, ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTask, type Task } from "@/lib/task-context"
import { EditTaskModal } from "./edit-task-modal"
import { AddTaskModal } from "./add-task-modal"

export function TaskList() {
  const { tasks, loading, updateTask, deleteTask } = useTask()
  const [sortField, setSortField] = useState<keyof Task>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "priority-low"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-green-600 text-green-100"
      case "in-progress":
        return "bg-yellow-600 text-yellow-100"
      case "done":
        return "bg-gray-600 text-gray-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do"
      case "in-progress":
        return "In Progress"
      case "done":
        return "Done"
      default:
        return status
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: keyof Task) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof Task) => {
    if (field !== sortField) return null
    return sortDirection === "asc" ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const handleTaskStatusToggle = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done"
    await updateTask(task.id, { status: newStatus })
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedTask) {
      try {
        await deleteTask(selectedTask.id)
        setIsDeleteDialogOpen(false)
        setSelectedTask(null)
      } catch (error) {
        // Error is handled in the context
      }
    }
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedTask(null)
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Aufgaben Liste</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Aufgaben Liste</h3>
            <button 
              onClick={() => setIsAddTaskModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Neue Aufgabe</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th
                  className="text-left py-4 px-6 text-muted-foreground font-medium cursor-pointer hover:text-foreground flex items-center"
                  onClick={() => handleSort("title")}
                >
                  Titel
                  {getSortIcon("title")}
                </th>
                <th
                  className="text-left py-4 px-6 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center">
                    Priorität
                    {getSortIcon("priority")}
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon("status")}
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("assignedTo")}
                >
                  <div className="flex items-center">
                    Verantwortlich
                    {getSortIcon("assignedTo")}
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("dueDate")}
                >
                  <div className="flex items-center">
                    Deadline
                    {getSortIcon("dueDate")}
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-muted-foreground font-medium">
                  Drive
                </th>
                <th className="text-center py-4 px-6 text-muted-foreground font-medium">
                  Aktionen
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedTasks.map((task) => (
                <tr key={task.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleTaskStatusToggle(task)}
                        className="transition-colors"
                      >
                        {task.status === "done" ? (
                          <CheckCircle className="h-5 w-5 text-positive" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      <div>
                        <p className={`font-medium ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-foreground">{task.assignedTo}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm ${isOverdue(task.dueDate) && task.status !== "done" ? "text-negative font-medium" : "text-muted-foreground"}`}>
                      {new Date(task.dueDate).toLocaleDateString("de-DE")}
                      {isOverdue(task.dueDate) && task.status !== "done" && (
                        <span className="ml-2 text-xs bg-negative text-negative-foreground px-1 py-0.5 rounded">
                          Überfällig
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {task.driveLink ? (
                      <a
                        href={task.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/90 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1 rounded text-muted-foreground hover:text-blue-400 hover:bg-accent transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-accent transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Keine Aufgaben vorhanden</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        onTaskAdded={() => setIsAddTaskModalOpen(false)}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aufgabe löschen</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Sind Sie sicher, dass Sie die Aufgabe "{selectedTask?.title}" löschen möchten?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
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
    </>
  )
}
