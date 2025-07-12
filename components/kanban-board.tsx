"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Calendar, User, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTask, type Task } from "@/lib/task-context"
import { EditTaskModal } from "./edit-task-modal"
import { AddTaskModal } from "./add-task-modal"

const columns = [
  { id: "todo", title: "To Do", color: "border-positive" },
  { id: "in-progress", title: "In Progress", color: "border-primary" },
  { id: "done", title: "Done", color: "border-neutral" },
]

export function KanbanBoard() {
  const { tasks, loading, updateTask, deleteTask } = useTask()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    if (source.droppableId !== destination.droppableId) {
      await updateTask(result.draggableId, { 
        status: destination.droppableId as Task["status"] 
      })
    }
  }

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

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    // Verhindere Edit wenn auf die Action-Buttons geklickt wird
    const target = e.target as HTMLElement
    if (target.closest('.task-actions')) {
      return
    }
    handleEditTask(task)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedTask(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Lade Aufgaben...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-card rounded-lg p-4 border border-gray-300">
              <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${column.color}`}>
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <span className="bg-accent text-muted-foreground px-2 py-1 rounded-full text-xs">
                  {tasks.filter((task) => task.status === column.id).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-[200px]">
                    {tasks
                      .filter((task) => task.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={(e) => handleTaskClick(e, task)}
                              className="bg-accent rounded-lg p-4 border border-gray-300 hover:border-primary transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-foreground flex-1">{task.title}</h4>
                                <div className="task-actions flex items-center space-x-1 ml-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditTask(task)
                                    }}
                                    className="p-1 rounded text-muted-foreground hover:text-blue-400 hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteTask(task)
                                    }}
                                    className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-accent transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{task.assignedTo}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(task.dueDate).toLocaleDateString("de-DE")}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>


            </div>
          ))}
        </div>
      </DragDropContext>

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
