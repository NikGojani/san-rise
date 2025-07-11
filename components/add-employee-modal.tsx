'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeSchema, type Employee } from '@/lib/schemas/employee'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { toast } from 'sonner'

interface AddEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEmployeeAdded: (employee: Employee) => void
  editEmployee?: Employee | null
}

export function AddEmployeeModal({ open, onOpenChange, onEmployeeAdded, editEmployee }: AddEmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string }>>(
    editEmployee?.files?.map(file => ({ name: file.name, url: file.url })) || []
  )

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Employee>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      role: '',
      grossSalary: 0,
      netSalary: 0,
      additionalCostsPercentage: 20, // 20% Standard
      address: '',
      startDate: new Date().toISOString().split('T')[0],
      email: '',
      phone: '',
      isActive: true,
      files: [],
    },
  })

  // Setze Werte für Bearbeitung
  useEffect(() => {
    if (editEmployee) {
      setValue('name', editEmployee.name)
      setValue('role', editEmployee.role)
      setValue('grossSalary', editEmployee.grossSalary)
      setValue('netSalary', editEmployee.netSalary)
      setValue('additionalCostsPercentage', editEmployee.additionalCostsPercentage)
      setValue('address', editEmployee.address)
      setValue('startDate', editEmployee.startDate)
      setValue('email', editEmployee.email)
      setValue('phone', editEmployee.phone)
      setValue('isActive', editEmployee.isActive)
      setAttachments(editEmployee?.files?.map(file => ({ name: file.name, url: file.url })) || [])
    } else {
      reset()
      setAttachments([])
    }
  }, [editEmployee, setValue, reset])

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      
      const employee: Employee = {
        ...data,
        id: editEmployee ? editEmployee.id : Math.random().toString(36).substr(2, 9),
        files: attachments.map(att => ({
          name: att.name,
          type: 'unknown',
          size: 0,
          url: att.url,
          uploadedAt: new Date().toISOString(),
        })),
      }

      onEmployeeAdded(employee)
      reset()
      setAttachments([])
      onOpenChange(false)
    } catch (error) {
      toast.error(editEmployee ? 'Fehler beim Aktualisieren des Mitarbeiters' : 'Fehler beim Hinzufügen des Mitarbeiters')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (fileUrl: string, fileName: string) => {
    setAttachments(prev => [...prev, { name: fileName, url: fileUrl }])
  }

  const handleFileRemove = (fileName: string) => {
    setAttachments(prev => prev.filter(att => att.name !== fileName))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editEmployee ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter hinzufügen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Position</Label>
              <Input
                id="role"
                {...register('role')}
              />
              {errors.role && (
                <p className="text-destructive text-sm">{errors.role.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="grossSalary">Bruttogehalt</Label>
              <Input
                id="grossSalary"
                type="number"
                {...register('grossSalary', { valueAsNumber: true })}
              />
              {errors.grossSalary && (
                <p className="text-destructive text-sm">{errors.grossSalary.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="netSalary">Nettogehalt</Label>
              <Input
                id="netSalary"
                type="number"
                {...register('netSalary', { valueAsNumber: true })}
              />
              {errors.netSalary && (
                <p className="text-destructive text-sm">{errors.netSalary.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalCostsPercentage">Lohnnebenkosten (%)</Label>
              <div className="relative">
                <Input
                  id="additionalCostsPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register('additionalCostsPercentage', { valueAsNumber: true })}
                  className="pr-8"
                  placeholder="20.0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Prozentsatz der Lohnnebenkosten vom Bruttogehalt</p>
              {errors.additionalCostsPercentage && (
                <p className="text-destructive text-sm">{errors.additionalCostsPercentage.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Eintrittsdatum</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-destructive text-sm">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-destructive text-sm">{errors.phone.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              {...register('address')}
            />
            {errors.address && (
              <p className="text-destructive text-sm">{errors.address.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Dokumente & Dateien</Label>
            <FileUpload
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              existingFiles={attachments}
              acceptedFileTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt']}
              maxFileSize={15}
              bucketName="employees"
              folder="documents"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Wird gespeichert...' : (editEmployee ? 'Aktualisieren' : 'Hinzufügen')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 