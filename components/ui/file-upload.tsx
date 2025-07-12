'use client'

import { useState } from 'react'
import { Input } from './input'
import { Label } from './label'
import { Button } from './button'
import { Trash2, Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface FileUploadProps {
  onFileUpload: (fileUrl: string, fileName: string) => void
  onFileRemove?: (fileName: string) => void
  existingFiles?: Array<{ name: string; url: string }>
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  bucketName: string
  folder: string
  className?: string
}

export function FileUpload({
  onFileUpload,
  onFileRemove,
  existingFiles = [],
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  maxFileSize = 15, // Default 15MB
  bucketName,
  folder,
  className = '',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validiere Dateityp
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFileTypes.includes(fileExtension)) {
      toast.error(`Ungültiger Dateityp. Erlaubte Typen: ${acceptedFileTypes.join(', ')}`)
      return
    }

    // Validiere Dateigröße
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`Datei zu groß. Maximale Größe: ${maxFileSize}MB`)
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Generiere einen eindeutigen Dateinamen
      const timestamp = new Date().getTime()
      const randomString = Math.random().toString(36).substring(2, 15)
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${timestamp}-${randomString}-${sanitizedFileName}`
      const filePath = `${folder}/${fileName}`

      // Upload zur Supabase Storage mit Fortschrittsanzeige
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100
            setUploadProgress(Math.round(percentage))
          },
        })

      if (error) {
        throw error
      }

      // Hole die öffentliche URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      onFileUpload(publicUrl, file.name)
      toast.success('Datei erfolgreich hochgeladen')
    } catch (error: any) {
      console.error('Fehler beim Hochladen:', error)
      toast.error(error.message || 'Fehler beim Hochladen der Datei')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset das Input-Feld
      e.target.value = ''
    }
  }

  const handleRemove = async (fileName: string) => {
    try {
      if (onFileRemove) {
        onFileRemove(fileName)
        toast.success('Datei erfolgreich entfernt')
      }
    } catch (error: any) {
      console.error('Fehler beim Entfernen der Datei:', error)
      toast.error(error.message || 'Fehler beim Entfernen der Datei')
    }
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            onChange={handleFileChange}
            accept={acceptedFileTypes.join(',')}
            disabled={isUploading}
            className="flex-1"
          />
          {isUploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                {uploadProgress}%
              </span>
            </div>
          )}
        </div>

        {existingFiles.length > 0 && (
          <ul className="space-y-2">
            {existingFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {file.name}
                </a>
                {onFileRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(file.name)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          Erlaubte Dateitypen: {acceptedFileTypes.join(', ')} (max. {maxFileSize}MB)
        </p>
      </div>
    </div>
  )
} 