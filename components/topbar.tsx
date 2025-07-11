"use client"

import { Bell, User, LogOut, Settings, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import Link from "next/link"

export function Topbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
  }

  const getUserInitials = (username: string) => {
    return username.slice(0, 1).toUpperCase()
  }

  const formatUsername = (username: string) => {
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-[#CF9033] text-black text-xs font-medium'
      case 'team':
        return 'bg-yellow-500 text-black text-xs font-medium'
      default:
        return 'bg-gray-500 text-white text-xs font-medium'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'team':
        return 'Team'
      default:
        return 'User'
    }
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-end px-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-auto rounded-lg px-3 py-2 hover:bg-accent">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {user ? getUserInitials(user.username) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2 hidden sm:flex">
                  <span className="text-foreground text-sm font-medium">
                    {user ? formatUsername(user.username) : 'Benutzer'}
                  </span>
                  {user && (
                    <span className={`px-2 py-1 rounded-md ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  )}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
            <DropdownMenuLabel className="text-muted-foreground">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {user ? getUserInitials(user.username) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{user ? formatUsername(user.username) : 'Benutzer'}</p>
                  <span className={`inline-block px-2 py-1 rounded-md mt-1 ${getRoleColor(user?.role || '')}`}>
                    {getRoleText(user?.role || '')}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="text-foreground hover:bg-accent cursor-pointer">
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Einstellungen
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
