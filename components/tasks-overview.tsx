"use client"

import { Calendar, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useTask, type Task } from "@/lib/task-context"

export function TasksOverview() {
  const { tasks, loading } = useTask()

  // Filter nur offene Aufgaben (nicht "done")
  const openTasks = tasks.filter(task => task.status !== 'done')

  // Gruppiere Aufgaben nach Person
  const tasksByPerson = openTasks.reduce((acc, task) => {
    if (!acc[task.assignedTo]) {
      acc[task.assignedTo] = []
    }
    acc[task.assignedTo].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-negative bg-negative/20'
      case 'medium':
        return 'text-primary bg-primary/20'
      case 'low':
        return 'text-positive bg-positive/20'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'text-positive bg-positive/20'
      case 'in-progress':
        return 'text-primary bg-primary/20'
      case 'done':
        return 'text-neutral bg-neutral/20'
      default:
        return 'text-neutral bg-neutral/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do'
      case 'in-progress':
        return 'In Progress'
      case 'done':
        return 'Done'
      default:
        return status
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-gray-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">Offene Aufgaben</h3>
          <p className="text-muted-foreground">Überblick der ausstehenden Aufgaben pro Person</p>
        </div>
        <Link
          href="/tasks"
          className="text-primary hover:text-primary/90 text-sm font-medium transition-colors"
        >
          Alle anzeigen →
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Lade Aufgaben...</p>
        </div>
      ) : Object.keys(tasksByPerson).length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Keine offenen Aufgaben vorhanden</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByPerson).map(([person, personTasks]) => (
            <div key={person} className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">{person}</h4>
                    <p className="text-muted-foreground text-sm">
                      {personTasks.length} offene Aufgabe{personTasks.length !== 1 ? 'n' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {personTasks.filter(t => t.priority === 'high').length} hoch
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {personTasks.filter(t => t.priority === 'medium').length} mittel
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {personTasks.filter(t => t.priority === 'low').length} niedrig
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {personTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="bg-secondary rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-foreground text-sm flex-1">{task.title}</h5>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
                        </div>
                        {isOverdue(task.dueDate) && (
                          <div className="flex items-center space-x-1 text-negative">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Überfällig</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {personTasks.length > 3 && (
                  <div className="text-center py-2">
                    <Link
                      href="/tasks"
                      className="text-sm text-primary hover:text-primary/90 font-medium"
                    >
                      +{personTasks.length - 3} weitere Aufgaben anzeigen
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 