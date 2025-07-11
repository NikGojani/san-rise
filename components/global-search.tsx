'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Calendar, Users, FileText, Settings, Calculator, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface SearchResult {
  id: string
  title: string
  description: string
  path: string
  category: string
  icon: any
  keywords: string[]
}

const searchData: SearchResult[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Übersicht über alle wichtigen Kennzahlen und Statistiken',
    path: '/',
    category: 'Navigation',
    icon: FileText,
    keywords: ['dashboard', 'übersicht', 'start', 'home', 'statistiken', 'kennzahlen']
  },
  {
    id: 'calculator',
    title: 'Kostenrechner',
    description: 'Berechnen Sie Event-Kosten und Gewinnverteilung',
    path: '/calculator',
    category: 'Tools',
    icon: Calculator,
    keywords: ['rechner', 'kosten', 'calculator', 'gewinn', 'event', 'berechnung']
  },
  {
    id: 'tasks',
    title: 'Aufgabenverwaltung',
    description: 'Verwalten Sie Aufgaben und Projekte im Kanban-Board',
    path: '/tasks',
    category: 'Verwaltung',
    icon: FileText,
    keywords: ['aufgaben', 'tasks', 'kanban', 'projekte', 'todo', 'karten']
  },
  {
    id: 'employees',
    title: 'Mitarbeiterverwaltung',
    description: 'Verwalten Sie Ihr Team und Mitarbeiterinformationen',
    path: '/employees',
    category: 'Personal',
    icon: Users,
    keywords: ['mitarbeiter', 'team', 'personal', 'employees', 'verwaltung']
  },
  {
    id: 'contracts',
    title: 'Vertragskosten',
    description: 'Verwalten Sie wiederkehrende Verträge und Kosten',
    path: '/contracts',
    category: 'Finanzen',
    icon: FileText,
    keywords: ['verträge', 'contracts', 'kosten', 'abonnements', 'wiederkehrend']
  },
  {
    id: 'events',
    title: 'Eventkalender',
    description: 'Planen und verwalten Sie kommende Events',
    path: '/events',
    category: 'Events',
    icon: Calendar,
    keywords: ['events', 'kalender', 'termine', 'veranstaltungen', 'planung']
  },
  {
    id: 'settings',
    title: 'Einstellungen',
    description: 'Konfigurieren Sie Systemeinstellungen und Präferenzen',
    path: '/settings',
    category: 'System',
    icon: Settings,
    keywords: ['einstellungen', 'settings', 'konfiguration', 'präferenzen']
  }
]

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (query.trim() === '') {
      setResults(searchData.slice(0, 5)) // Zeige Top 5 wenn leer
      setSelectedIndex(0)
      return
    }

    const searchQuery = query.toLowerCase()
    const filtered = searchData
      .filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchQuery)
        const descriptionMatch = item.description.toLowerCase().includes(searchQuery)
        const keywordMatch = item.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchQuery)
        )
        const categoryMatch = item.category.toLowerCase().includes(searchQuery)
        
        return titleMatch || descriptionMatch || keywordMatch || categoryMatch
      })
      .sort((a, b) => {
        // Priorität: Titel-Match > Keyword-Match > Beschreibung-Match
        const aTitle = a.title.toLowerCase().includes(searchQuery) ? 3 : 0
        const aKeyword = a.keywords.some(k => k.toLowerCase().includes(searchQuery)) ? 2 : 0
        const aDesc = a.description.toLowerCase().includes(searchQuery) ? 1 : 0
        
        const bTitle = b.title.toLowerCase().includes(searchQuery) ? 3 : 0
        const bKeyword = b.keywords.some(k => k.toLowerCase().includes(searchQuery)) ? 2 : 0
        const bDesc = b.description.toLowerCase().includes(searchQuery) ? 1 : 0
        
        return (bTitle + bKeyword + bDesc) - (aTitle + aKeyword + aDesc)
      })

    setResults(filtered)
    setSelectedIndex(0)
  }, [query])

  const handleNavigate = (path: string) => {
    router.push(path)
    onOpenChange(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleNavigate(results[selectedIndex].path)
        }
        break
      case 'Escape':
        e.preventDefault()
        onOpenChange(false)
        setQuery('')
        break
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Navigation': return 'text-primary'
      case 'Tools': return 'text-positive'
      case 'Verwaltung': return 'text-primary'
      case 'Personal': return 'text-positive'
      case 'Finanzen': return 'text-primary'
      case 'Events': return 'text-positive'
      case 'System': return 'text-neutral'
      default: return 'text-muted-foreground'
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-primary text-primary-foreground px-0.5 rounded">
          {part}
        </span>
      ) : part
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Navigation': return <FileText className="h-4 w-4" />
      case 'Tools': return <Calculator className="h-4 w-4" />
      case 'Verwaltung': return <FileText className="h-4 w-4" />
      case 'Personal': return <Users className="h-4 w-4" />
      case 'Finanzen': return <FileText className="h-4 w-4" />
      case 'Events': return <Calendar className="h-4 w-4" />
      case 'System': return <Settings className="h-4 w-4" />
      default: return <Building2 className="h-4 w-4" />
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'Navigation': return 'Navigation'
      case 'Tools': return 'Tools'
      case 'Verwaltung': return 'Verwaltung'
      case 'Personal': return 'Personal'
      case 'Finanzen': return 'Finanzen'
      case 'Events': return 'Events'
      case 'System': return 'System'
      default: return 'Sonstiges'
    }
  }

  const handleSelect = (result: SearchResult) => {
    handleNavigate(result.path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Suchen Sie nach Verträgen, Mitarbeitern, Aufgaben oder Events..."
            className="flex h-10 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        {results.length > 0 && (
          <>
            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(result)}
                  className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-accent transition-colors text-left ${
                    selectedIndex === index ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getCategoryIcon(result.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {result.title}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full bg-muted ${getCategoryColor(result.category)}`}>
                        {getCategoryText(result.category)}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground border-t">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
                  <span>zu navigieren</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd>
                  <span>zu öffnen</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
                  <span>zu schließen</span>
                </div>
              </div>
            </div>
          </>
        )}
        
        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Keine Ergebnisse gefunden
          </div>
        )}
        
        {!query && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Beginnen Sie mit der Eingabe um zu suchen...
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 