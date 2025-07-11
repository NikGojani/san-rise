'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type Task, getPriorityText } from '@/lib/schemas/task'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useTask } from '@/lib/task-context'

interface AddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskAdded?: (task: Task) => void
  editTask?: Task
}

export function AddTaskModal({ open, onOpenChange, onTaskAdded, editTask }: AddTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addTask, updateTask } = useTask()

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: editTask || {
      title: '',
      priority: 'medium',
      status: 'todo',
      assignedTo: '',
      dueDate: new Date().toISOString().split('T')[0],
      driveLink: '',
      description: '',
    },
  })

  const handlePriorityChange = (value: string) => {
    setValue('priority', value as Task['priority'])
  }

  const handleStatusChange = (value: string) => {
    setValue('status', value as Task['status'])
  }

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      
      if (editTask) {
        // Bearbeitung über TaskContext
        await updateTask(editTask.id, data)
        onTaskAdded?.({ ...editTask, ...data })
      } else {
        // Neue Aufgabe über TaskContext erstellen
        await addTask(data)
        // onTaskAdded wird nicht benötigt, da der Context automatisch aktualisiert wird
      }

      onOpenChange(false)
      // Success Toast wird bereits im TaskContext angezeigt
    } catch (error) {
      // Error Toast wird bereits im TaskContext angezeigt
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe hinzufügen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-destructive text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorität</Label>
              <Select
                value={watch('priority')}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{getPriorityText('low')}</SelectItem>
                  <SelectItem value="medium">{getPriorityText('medium')}</SelectItem>
                  <SelectItem value="high">{getPriorityText('high')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-destructive text-sm">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-destructive text-sm">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Verantwortlich</Label>
              <Select
                value={watch('assignedTo')}
                onValueChange={(value) => setValue('assignedTo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adrian">Adrian</SelectItem>
                  <SelectItem value="Nik">Nik</SelectItem>
                  <SelectItem value="Sebastian">Sebastian</SelectItem>
                </SelectContent>
              </Select>
              {errors.assignedTo && (
                <p className="text-destructive text-sm">{errors.assignedTo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Deadline</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <p className="text-destructive text-sm">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driveLink">Drive-Link (optional)</Label>
            <Input
              id="driveLink"
              {...register('driveLink')}
            />
            {errors.driveLink && (
              <p className="text-destructive text-sm">{errors.driveLink.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? editTask ? 'Wird aktualisiert...' : 'Wird hinzugefügt...'
                : editTask ? 'Aufgabe aktualisieren' : 'Aufgabe hinzufügen'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 