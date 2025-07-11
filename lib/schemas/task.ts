import { z } from 'zod'
import { type AppTask } from '@/lib/supabase'

export const taskSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Bitte wählen Sie eine gültige Priorität' }),
  }),
  status: z.enum(['todo', 'in-progress', 'done'], {
    errorMap: () => ({ message: 'Bitte wählen Sie einen gültigen Status' }),
  }),
  assignedTo: z.string().min(1, 'Verantwortlicher ist erforderlich'),
  dueDate: z.string().min(1, 'Deadline ist erforderlich'),
  driveLink: z.string().optional(),
  description: z.string().optional(),
})

// Use AppTask from supabase for consistency
export type Task = AppTask

export const getStatusText = (status: Task['status']) => {
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

export const getPriorityText = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'Hoch'
    case 'medium':
      return 'Mittel'
    case 'low':
      return 'Niedrig'
    default:
      return priority
  }
}

export const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'priority-high'
    case 'medium':
      return 'priority-medium'
    case 'low':
      return 'priority-low'
    default:
      return 'priority-low'
  }
}

export const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'todo':
      return 'bg-green-600 text-green-100'
    case 'in-progress':
      return 'bg-yellow-600 text-yellow-100'
    case 'done':
      return 'bg-gray-600 text-gray-100'
    default:
      return 'bg-gray-600 text-gray-100'
  }
} 