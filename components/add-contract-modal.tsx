'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contractSchema, type Contract, calculateMonthlyAmount, calculateYearlyAmount } from '@/lib/schemas/contract'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { toast } from 'sonner'

interface AddContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContractAdded: (contract: Contract) => void
  editContract?: Contract
}

export function AddContractModal({ open, onOpenChange, onContractAdded, editContract }: AddContractModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string }>>(
    editContract?.attachments?.map(att => ({ name: att.name, url: att.url })) || []
  )

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: editContract || {
      name: '',
      amount: 0,
      category: '',
      interval: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      attachments: [],
    },
  })

  const amount = watch('amount')
  const interval = watch('interval')

  const handleIntervalChange = (value: string) => {
    setValue('interval', value as Contract['interval'])
  }

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      
      // Dateien sind bereits in attachments State gespeichert durch FileUpload
      const contractData: Contract = {
        ...data,
        id: editContract?.id || Math.random().toString(36).substr(2, 9),
        attachments: attachments.map(att => ({
          name: att.name,
          type: 'unknown',
          size: 0,
          url: att.url,
          uploadedAt: new Date().toISOString(),
        })),
      }

      // API-Aufruf für neuen oder bestehenden Vertrag
      const response = await fetch('/api/contracts', {
        method: editContract ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Vertrags')
      }

      const savedContract = await response.json()
      onContractAdded(savedContract)
      setAttachments([])
      onOpenChange(false)
      toast.success(editContract ? 'Vertrag wurde erfolgreich aktualisiert' : 'Vertrag wurde erfolgreich hinzugefügt')
    } catch (error) {
      console.error('Error saving contract:', error)
      toast.error(editContract ? 'Fehler beim Aktualisieren des Vertrags' : 'Fehler beim Hinzufügen des Vertrags')
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
          <DialogTitle>{editContract ? 'Vertrag bearbeiten' : 'Neuen Vertrag hinzufügen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vertragsname</Label>
              <Input
                id="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Input
                id="category"
                {...register('category')}
              />
              {errors.category && (
                <p className="text-destructive text-sm">{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Betrag</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-destructive text-sm">{errors.amount.message}</p>
              )}
              {amount > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Monatlich: €{calculateMonthlyAmount(amount, interval).toFixed(2)}</p>
                  <p>Jährlich: €{calculateYearlyAmount(amount, interval).toFixed(2)}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="interval">Intervall</Label>
              <Select
                value={interval}
                onValueChange={handleIntervalChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                  <SelectItem value="once">Einmalig</SelectItem>
                </SelectContent>
              </Select>
              {errors.interval && (
                <p className="text-destructive text-sm">{errors.interval.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum</Label>
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
              <Label htmlFor="endDate">Enddatum (optional)</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-destructive text-sm">{errors.endDate.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dokumente & Anhänge</Label>
            <FileUpload
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              existingFiles={attachments}
              acceptedFileTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt']}
              maxFileSize={20}
              bucketName="contracts"
              folder="documents"
              className="w-full"
            />
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
                ? editContract ? 'Wird aktualisiert...' : 'Wird hinzugefügt...'
                : editContract ? 'Vertrag aktualisieren' : 'Vertrag hinzufügen'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 