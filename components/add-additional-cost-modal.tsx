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
import { toast } from 'sonner'

interface AddAdditionalCostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCostAdded: (cost: AdditionalCost) => void
}

export function AddAdditionalCostModal({ open, onOpenChange, onCostAdded }: AddAdditionalCostModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(additionalCostSchema),
    defaultValues: {
      name: '',
      amount: 0,
      category: '',
      type: 'one-time' as const,
      date: new Date().toISOString().split('T')[0],
      description: '',
      attachments: [],
    },
  })

  const watchedType = watch('type')

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      
      // Hier würden wir normalerweise die Dateien hochladen und URLs erhalten
      const uploadedFiles = selectedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      }))

      const response = await fetch('/api/additional-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          attachments: uploadedFiles,
        }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Hinzufügen der Kosten')
      }

      const newCost = await response.json()
      onCostAdded(newCost)
      reset()
      setSelectedFiles([])
      onOpenChange(false)
      toast.success('Zusätzliche Kosten wurden erfolgreich hinzugefügt')
    } catch (error) {
      toast.error('Fehler beim Hinzufügen der zusätzlichen Kosten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
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
              <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                    >
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
              <Label htmlFor="type">Art der Kosten</Label>
              <Select value={watchedType} onValueChange={(value: any) => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue />
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
            <Label htmlFor="files">Belege/Dokumente (optional)</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            {selectedFiles.length > 0 && (
              <ul className="text-sm text-muted-foreground">
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                ))}
              </ul>
            )}
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
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Wird hinzugefügt...' : 'Kosten hinzufügen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 