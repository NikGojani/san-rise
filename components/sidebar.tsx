"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { LayoutDashboard, CheckSquare, Calculator, FileText, Users, Calendar, TrendingUp, Building2 } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Aufgaben", href: "/tasks", icon: CheckSquare },
  { name: "Kostenrechner", href: "/calculator", icon: Calculator },
  { name: "Verträge", href: "/contracts", icon: FileText },
  { name: "Mitarbeiter", href: "/employees", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Marketing", href: "/marketing", icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const renderLogo = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
        </div>
      )
    }

    if (settings?.logoUrl) {
      return (
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src={settings.logoUrl}
              alt="Logo"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          {settings.logoText && (
            <h1 className="text-xl font-bold text-foreground truncate">{settings.logoText}</h1>
          )}
        </div>
      )
    }

    if (settings?.logoText) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground truncate">{settings.logoText}</h1>
        </div>
      )
    }

    // Fallback: Platzhalter Logo
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-muted-foreground">Logo hier</h1>
      </div>
    )
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        {renderLogo()}
      </div>
      <nav className="mt-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
