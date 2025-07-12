'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { additionalCostSchema, type AdditionalCost } from '@/lib/schemas/additional-cost'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { toast } from 'sonner'

interface AddAdditionalCostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCostAdded: (cost: AdditionalCost) => void
}

type FormValues = {
  name: string
  amount: number
  category: string
  type: 'one-time' | 'monthly' | 'yearly'
  date: string
  description?: string
  attachments: Array<{
    name: string
    type: string
    size: number
    url: string
    uploadedAt: string
  }>
}

export function AddAdditionalCostModal({ open, onOpenChange, onCostAdded }: AddAdditionalCostModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string }>>([])

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(additionalCostSchema),
    defaultValues: {
      name: '',
      amount: 0,
      category: '',
      type: 'one-time',
      date: new Date().toISOString().split('T')[0],
      description: '',
      attachments: [],
    },
  })

  const handleFileUpload = (fileUrl: string, fileName: string) => {
    setAttachments(prev => [...prev, { name: fileName, url: fileUrl }])
  }

  const handleFileRemove = (fileName: string) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName))
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      
      // Konvertiere die Anhänge in das richtige Format
      const formattedAttachments = attachments.map(file => ({
        name: file.name,
        url: file.url,
        type: file.name.split('.').pop() || 'unknown',
        size: 0, // Wird nicht benötigt für die Anzeige
        uploadedAt: new Date().toISOString(),
      }))

      const response = await fetch('/api/additional-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          attachments: formattedAttachments,
        }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Hinzufügen der Kosten')
      }

      const newCost = await response.json()
      onCostAdded(newCost)
      reset()
      setAttachments([])
      onOpenChange(false)
      toast.success('Zusätzliche Kosten wurden erfolgreich hinzugefügt')
    } catch (error) {
      toast.error('Fehler beim Hinzufügen der zusätzlichen Kosten')
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    'Fahrzeuge',
    'Equipment',
    'Versicherung',
    'Marketing',
    'Software',
    'Büroausstattung',
    'Sonstiges'
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Zusätzliche Kosten hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name/Bezeichnung</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="z.B. Sprinter Kauf"
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Betrag (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-destructive text-sm">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-destructive text-sm">{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Kostentyp</Label>
              <Select
                value={watch('type')}
                onValueChange={(value: 'one-time' | 'monthly' | 'yearly') => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kostentyp wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">Einmalig</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-destructive text-sm">{errors.type.message}</p>
              )}
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-destructive text-sm">{errors.date.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Zusätzliche Informationen..."
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Belege/Dokumente (optional)</Label>
            <FileUpload
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              existingFiles={attachments}
              acceptedFileTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
              maxFileSize={15}
              bucketName="additional-costs"
              folder="receipts"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Wird gespeichert...' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 