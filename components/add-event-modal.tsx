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

export interface AddEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventAdded: (event: any) => void
  editEvent?: AppEvent
}

export function AddEventModal({
  open,
  onOpenChange,
  onEventAdded,
  editEvent
}: AddEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>(() => {
    if (editEvent) {
      return {
        name: editEvent.name,
        description: editEvent.description || '',
        location: editEvent.location || '',
        date: editEvent.date,
        startTime: editEvent.startTime || '',
        endTime: editEvent.endTime || '',
        status: editEvent.status || 'upcoming',
        maxTickets: editEvent.maxTickets || 100,
        price: editEvent.price || 0,
        ticketsSold: editEvent.ticketsSold || 0,
        termine: editEvent.termine || 1,
        syncWithShopify: editEvent.syncWithShopify || false,
        imageUrl: editEvent.imageUrl || '',
      }
    }
    return {
      name: '',
      description: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      status: 'upcoming',
      maxTickets: 100,
      price: 0,
      ticketsSold: 0,
      termine: 1,
      syncWithShopify: false,
      imageUrl: '',
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Erstellen des Events')
      }

      const newEvent = await response.json()
      onEventAdded(newEvent)
      onOpenChange(false)
      toast.success('Event wurde erfolgreich erstellt')
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Fehler beim Erstellen des Events')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Event erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Event Name"
              />
            </div>
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event Beschreibung"
              />
            </div>
            <div>
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Event Ort"
              />
            </div>
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="startTime">Startzeit</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endTime">Endzeit</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'upcoming' | 'active' | 'completed' | 'cancelled') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Bevorstehend</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="cancelled">Abgesagt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxTickets">Maximale Tickets</Label>
              <Input
                id="maxTickets"
                type="number"
                value={formData.maxTickets}
                onChange={(e) => setFormData({ ...formData, maxTickets: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="price">Ticketpreis</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="termine">Anzahl Termine</Label>
              <Input
                id="termine"
                type="number"
                value={formData.termine}
                onChange={(e) => setFormData({ ...formData, termine: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="syncWithShopify"
                checked={formData.syncWithShopify}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, syncWithShopify: checked })
                }
              />
              <Label htmlFor="syncWithShopify">Mit Shopify synchronisieren</Label>
            </div>
            <div>
              <Label htmlFor="imageUrl">Bild URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="URL zum Event-Bild"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">Event erstellen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 