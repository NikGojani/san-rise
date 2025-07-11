'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'
import { type AppTask } from '@/lib/supabase'

// Export AppTask als Task für Backward-Compatibility
export type Task = AppTask

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  refreshTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  getTaskById: (id: string) => Task | undefined
  getTasksByStatus: (status: Task['status']) => Task[]
  getTasksByAssignee: (assignedTo: string) => Task[]
  getOverdueTasks: () => Task[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const refreshTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        console.error('Fehler beim Laden der Aufgaben:', response.statusText)
        toast.error('Fehler beim Laden der Aufgaben')
      }
    } catch (error) {
      console.error('Fehler beim Laden der Aufgaben:', error)
      toast.error('Fehler beim Laden der Aufgaben')
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const newTask = await response.json()
        setTasks(prev => [...prev, newTask])
        toast.success('Aufgabe wurde erfolgreich erstellt')
      } else {
        throw new Error('Fehler beim Erstellen der Aufgabe')
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error)
      toast.error('Fehler beim Erstellen der Aufgabe')
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Optimistic update
      const currentTask = tasks.find(task => task.id === id)
      if (!currentTask) return

      const updatedTask = { ...currentTask, ...updates }
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task))

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      })

      if (response.ok) {
        const serverTask = await response.json()
        setTasks(prev => prev.map(task => task.id === id ? serverTask : task))
        toast.success('Aufgabe wurde erfolgreich aktualisiert')
      } else {
        // Revert optimistic update
        setTasks(prev => prev.map(task => task.id === id ? currentTask : task))
        throw new Error('Fehler beim Aktualisieren der Aufgabe')
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Aufgabe:', error)
      toast.error('Fehler beim Aktualisieren der Aufgabe')
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      // Optimistic update
      const taskToDelete = tasks.find(task => task.id === id)
      setTasks(prev => prev.filter(task => task.id !== id))

      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Aufgabe wurde erfolgreich gelöscht')
      } else {
        // Revert optimistic update
        if (taskToDelete) {
          setTasks(prev => [...prev, taskToDelete])
        }
        throw new Error('Fehler beim Löschen der Aufgabe')
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Aufgabe:', error)
      toast.error('Fehler beim Löschen der Aufgabe')
      throw error
    }
  }

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id)
  }

  const getTasksByStatus = (status: Task['status']): Task[] => {
    return tasks.filter(task => task.status === status)
  }

  const getTasksByAssignee = (assignedTo: string): Task[] => {
    return tasks.filter(task => task.assignedTo === assignedTo)
  }

  const getOverdueTasks = (): Task[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today && task.status !== 'done'
    })
  }

  useEffect(() => {
    refreshTasks()
  }, [])

  const value: TaskContextType = {
    tasks,
    loading,
    refreshTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByStatus,
    getTasksByAssignee,
    getOverdueTasks,
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
} 