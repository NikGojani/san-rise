"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Upload, File, X, Download, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface FileUploadProps {
  onFileUpload?: (fileUrl: string, fileName: string) => void
  onFileRemove?: (fileName: string) => void
  existingFiles?: Array<{ name: string; url: string }>
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  multiple?: boolean
  className?: string
  bucketName?: string
  folder?: string
}

interface UploadedFile {
  name: string
  url: string
  size: number
  type: string
  isUploading?: boolean
  progress?: number
}

export function FileUpload({
  onFileUpload,
  onFileRemove,
  existingFiles = [],
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'],
  maxFileSize = 10, // 10MB default
  multiple = true,
  className = '',
  bucketName = 'documents',
  folder = 'uploads'
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(
    existingFiles.map(f => ({ ...f, size: 0, type: 'unknown' }))
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload fehlgeschlagen: ${error.message}`)
    }

    // Öffentliche URL generieren
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles)

    // Validierung
    for (const file of newFiles) {
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`Datei "${file.name}" ist zu groß. Maximum: ${maxFileSize}MB`)
        return
      }

      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!acceptedFileTypes.includes(fileExt)) {
        toast.error(`Dateityp "${fileExt}" wird nicht unterstützt`)
        return
      }
    }

    // Upload-Prozess starten
    for (const file of newFiles) {
      const tempFile: UploadedFile = {
        name: file.name,
        url: '',
        size: file.size,
        type: file.type,
        isUploading: true,
        progress: 0
      }

      setFiles(prev => [...prev, tempFile])

      try {
        // Simuliere Upload-Progress (Supabase hat keinen built-in Progress)
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += Math.random() * 30
          if (progress > 90) progress = 90
          
          setFiles(prev => prev.map(f => 
            f.name === file.name && f.isUploading 
              ? { ...f, progress } 
              : f
          ))
        }, 200)

        const fileUrl = await uploadToSupabase(file)
        
        clearInterval(progressInterval)

        // Upload erfolgreich
        setFiles(prev => prev.map(f => 
          f.name === file.name && f.isUploading 
            ? { ...f, url: fileUrl, isUploading: false, progress: 100 }
            : f
        ))

        onFileUpload?.(fileUrl, file.name)
        toast.success(`"${file.name}" erfolgreich hochgeladen`)

      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Upload fehlgeschlagen: ${file.name}`)
        
        // Entferne fehlgeschlagene Datei
        setFiles(prev => prev.filter(f => !(f.name === file.name && f.isUploading)))
      }
    }
  }, [maxFileSize, acceptedFileTypes, onFileUpload, bucketName, folder])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = async (fileName: string, fileUrl: string) => {
    try {
      // Datei aus Supabase löschen
      if (fileUrl) {
        const filePath = fileUrl.split('/').pop()
        if (filePath) {
          await supabase.storage
            .from(bucketName)
            .remove([`${folder}/${filePath}`])
        }
      }

      setFiles(prev => prev.filter(f => f.name !== fileName))
      onFileRemove?.(fileName)
      toast.success('Datei entfernt')
    } catch (error) {
      console.error('Error removing file:', error)
      toast.error('Fehler beim Entfernen der Datei')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-accent/20'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFileTypes.join(',')}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragOver ? 'Dateien hier ablegen' : 'Dateien hochladen'}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Drag & Drop oder klicken zum Auswählen
            </p>
            <p className="text-xs text-muted-foreground">
              Unterstützt: {acceptedFileTypes.join(', ')} • Max. {maxFileSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Dateiliste */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Hochgeladene Dateien:</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <File className="w-4 h-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {file.size > 0 && <span>{formatFileSize(file.size)}</span>}
                      {file.isUploading && (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300 rounded-full"
                              style={{ width: `${file.progress || 0}%` }}
                            />
                          </div>
                          <span>{Math.round(file.progress || 0)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Vorschau/Download Button */}
                  {file.url && !file.isUploading && (
                    <>
                      {file.type.startsWith('image/') ? (
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                          title="Vorschau"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ) : (
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                          title="Herunterladen"
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Entfernen Button */}
                  {!file.isUploading && (
                    <button
                      onClick={() => removeFile(file.name, file.url)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                      title="Entfernen"
                    >
                      <X className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 