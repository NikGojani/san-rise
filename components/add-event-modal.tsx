'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { FileUpload } from '@/components/ui/file-upload'
import { toast } from 'sonner'
import { type AppEvent } from '@/lib/supabase'

const eventSchema = z.object({
  name: z.string().min(1, 'Event-Name ist erforderlich'),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.string().min(1, 'Datum ist erforderlich'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['upcoming', 'active', 'completed', 'cancelled']),
  price: z.number().min(0, 'Preis muss 0 oder größer sein'),
  maxTickets: z.number().min(1, 'Maximale Tickets muss mindestens 1 sein'),
  termine: z.number().min(1, 'Mindestens 1 Termin pro Monat erforderlich'),
  ticketsSold: z.number().min(0, 'Tickets verkauft muss 0 oder größer sein'),
  syncWithShopify: z.boolean(),
  imageUrl: z.string().optional(),
})

type EventFormData = z.infer<typeof eventSchema>

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventAdded: (event: AppEvent) => void
  editEvent?: AppEvent
}

export function AddEventModal({ isOpen, onClose, onEventAdded, editEvent }: AddEventModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string }>>([])

  const handleFileUpload = (fileUrl: string, fileName: string) => {
    setAttachments(prev => [...prev, { name: fileName, url: fileUrl }])
  }

  const handleFileRemove = (fileName: string) => {
    setAttachments(prev => prev.filter(att => att.name !== fileName))
  }

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: editEvent ? {
      name: editEvent.name,
      description: editEvent.description || '',
      location: editEvent.location || '',
      date: editEvent.date,
      startTime: editEvent.startTime || '',
      endTime: editEvent.endTime || '',
      status: editEvent.status,
      price: editEvent.price,
      maxTickets: editEvent.maxTickets,
      termine: editEvent.termine || 2,
      ticketsSold: editEvent.ticketsSold,
      syncWithShopify: editEvent.syncWithShopify,
      imageUrl: editEvent.imageUrl || '',
    } : {
      name: '',
      description: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      status: 'upcoming',
      price: 0,
      maxTickets: 400,
      termine: 2,
      ticketsSold: 0,
      syncWithShopify: false,
      imageUrl: '',
    },
  })

  const price = watch('price')
  const ticketsSold = watch('ticketsSold')
  const termine = watch('termine')
  const syncWithShopify = watch('syncWithShopify')
  
  // Automatische Berechnung
  const revenue = price * ticketsSold // ticketsSold ist bereits die Gesamtzahl
  const profit = revenue // Expenses werden im Calculator berechnet

  const handleStatusChange = (value: string) => {
    setValue('status', value as AppEvent['status'])
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsLoading(true)
      
      // Automatische Berechnung von Revenue und Profit
      const calculatedRevenue = data.price * data.ticketsSold // ticketsSold ist bereits die Gesamtzahl
      
      const eventData: Partial<AppEvent> = {
        ...data,
        revenue: calculatedRevenue,
        expenses: 0, // Wird später im Calculator berechnet
        profit: calculatedRevenue, // Wird später im Calculator neu berechnet
      }

      const response = await fetch('/api/events', {
        method: editEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEvent ? { ...eventData, id: editEvent.id } : eventData),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Events')
      }

      const savedEvent: AppEvent = await response.json()
      onEventAdded(savedEvent)
      reset()
      onClose()
      toast.success(editEvent ? 'Event wurde erfolgreich aktualisiert' : 'Event wurde erfolgreich hinzugefügt')
    } catch (error) {
      toast.error(editEvent ? 'Fehler beim Aktualisieren des Events' : 'Fehler beim Hinzufügen des Events')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editEvent ? 'Event bearbeiten' : 'Neues Event hinzufügen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basis Event Informationen */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Event Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Event-Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="z.B. Summer Festival 2024"
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Beschreibung des Events..."
                rows={3}
              />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Veranstaltungsort</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="z.B. Stadtpark Berlin"
              />
              {errors.location && (
                <p className="text-destructive text-sm">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Datum & Zeit */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Datum & Zeit</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-destructive text-sm">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start-Zeit</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                />
                {errors.startTime && (
                  <p className="text-destructive text-sm">{errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End-Zeit</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register('endTime')}
                />
                {errors.endTime && (
                  <p className="text-destructive text-sm">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status & Tickets */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tickets & Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="upcoming">Geplant</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="cancelled">Abgesagt</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-destructive text-sm">{errors.status.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Ticket-Preis (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="45.00"
                />
                {errors.price && (
                  <p className="text-destructive text-sm">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTickets">Max. Tickets pro Termin</Label>
                <Input
                  id="maxTickets"
                  type="number"
                  {...register('maxTickets', { valueAsNumber: true })}
                  placeholder="400"
                />
                {errors.maxTickets && (
                  <p className="text-destructive text-sm">{errors.maxTickets.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="termine">Termine</Label>
                <Input
                  id="termine"
                  type="number"
                  {...register('termine', { valueAsNumber: true })}
                  placeholder="2"
                />
                {errors.termine && (
                  <p className="text-destructive text-sm">{errors.termine.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Anzahl der Termine für dieses Event</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticketsSold">Tickets verkauft</Label>
                <Input
                  id="ticketsSold"
                  type="number"
                  {...register('ticketsSold', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.ticketsSold && (
                  <p className="text-destructive text-sm">{errors.ticketsSold.message}</p>
                )}
              </div>
            </div>

            {/* Berechnung Anzeige */}
            <div className="bg-muted/50 p-3 rounded-lg border">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets pro Termin:</span>
                  <span className="font-medium">{watch('maxTickets') || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anzahl Termine:</span>
                  <span className="font-medium">{watch('termine') || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-medium">Tickets gesamt verfügbar:</span>
                  <span className="font-bold text-primary">{(watch('maxTickets') || 0) * (watch('termine') || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live-Finanzvorschau */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Live-Vorschau Umsatz</h3>
            
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preis pro Ticket:</span>
                  <span className="font-medium">€{price || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tickets verkauft:</span>
                  <span className="font-medium">{ticketsSold || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Anzahl Termine:</span>
                  <span className="font-medium">{termine || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-foreground">Erwarteter Umsatz:</span>
                  <span className="font-bold text-positive text-lg">
                    €{revenue.toFixed(2)}
                </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Berechnung: {ticketsSold || 0} × €{price || 0} × {termine || 0} Termine
                </p>
              </div>
            </div>
          </div>

          {/* Shopify Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">E-Commerce Integration</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="syncWithShopify"
                checked={syncWithShopify}
                onCheckedChange={(checked) => setValue('syncWithShopify', checked)}
              />
              <Label htmlFor="syncWithShopify">Mit Shopify synchronisieren</Label>
            </div>
            
            {syncWithShopify && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  📦 Dieses Event wird automatisch als Shopify-Produkt erstellt und synchronisiert.
                  Ticket-Verkäufe werden in Echtzeit zwischen beiden Systemen abgeglichen.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Event-Bild URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                {...register('imageUrl')}
                placeholder="https://example.com/event-image.jpg"
              />
              {errors.imageUrl && (
                <p className="text-destructive text-sm">{errors.imageUrl.message}</p>
              )}
            </div>
          </div>

          {/* Dokumente & Anhänge */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dokumente & Medien</h3>
            <FileUpload
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              existingFiles={attachments}
              acceptedFileTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt', '.mp4', '.mp3']}
              maxFileSize={50}
              bucketName="events"
              folder="media"
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Speichern...' : (editEvent ? 'Aktualisieren' : 'Hinzufügen')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 