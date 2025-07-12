"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { useTask, type Task } from "@/lib/task-context"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

export function TaskCalendar() {
  const { tasks, loading, updateTask } = useTask()
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Montag = 0
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
  }

  const getTasksForDate = (date: string) => {
    return tasks.filter((task) => task.dueDate.startsWith(date))
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-negative"
      case "medium":
        return "bg-primary"
      case "low":
        return "bg-positive"
      default:
        return "bg-muted"
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const taskId = result.draggableId
    const sourceDate = result.source.droppableId
    const destinationDate = result.destination.droppableId

    // Nur aktualisieren wenn das Datum sich geändert hat
    if (sourceDate === destinationDate) return

    try {
      await updateTask(taskId, { dueDate: destinationDate })
    } catch (error) {
      console.error('Fehler beim Verschieben der Aufgabe:', error)
    }
  }

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ]

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-gray-300">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Lade Kalender...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-gray-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center">
          <Calendar className="mr-2 h-6 w-6" />
          Aufgaben Kalender
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h4 className="text-lg font-semibold text-foreground min-w-[200px] text-center">
            {monthNames[month]} {year}
          </h4>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div key={day} className="text-center font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-2">
          {/* Leere Zellen für Tage vor dem ersten Tag des Monats */}
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={index} className="h-24 bg-accent/50 rounded-lg"></div>
          ))}

          {/* Tage des Monats */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dateString = formatDate(year, month, day)
            const dayTasks = getTasksForDate(dateString)
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

            return (
              <Droppable key={day} droppableId={dateString}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`h-24 rounded-lg border border-gray-300 p-2 ${
                      isToday ? "bg-primary/10 border-primary" : "bg-accent/30"
                    } hover:bg-accent/50 transition-colors ${
                      snapshot.isDraggingOver ? "bg-primary/20 border-primary/50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                        {day}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs bg-muted text-muted-foreground px-1 rounded">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.map((task, taskIndex) => (
                        <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`text-xs p-1 rounded bg-card border border-gray-300 truncate group relative cursor-grab active:cursor-grabbing ${
                                snapshot.isDragging ? "shadow-lg rotate-2 scale-105 z-50" : ""
                              } ${taskIndex >= 2 ? "hidden" : ""}`}
                              title={`${task.title} - ${task.assignedTo} (Zum Verschieben ziehen)`}
                            >
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                                <span className="truncate text-foreground">{task.title}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayTasks.length - 2} weitere
                        </div>
                      )}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-negative rounded-full"></div>
            <span>Hoch</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Mittel</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-positive rounded-full"></div>
            <span>Niedrig</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>Gesamt: {tasks.length} Aufgaben</span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-accent/50 rounded-lg border border-gray-300">
        <p className="text-xs text-muted-foreground text-center">
          💡 <strong>Tipp:</strong> Ziehe Aufgaben per Drag & Drop zwischen den Kalendertagen, um das Datum zu ändern
        </p>
      </div>
    </div>
  )
}
