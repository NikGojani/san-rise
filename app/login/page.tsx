'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, type User } from '@/lib/schemas/user'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User as UserIcon, Lock, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<User>({
    resolver: zodResolver(userSchema),
  })

  const onSubmit = async (data: User) => {
    setIsLoading(true)
    try {
      const success = await login(data.username, data.password)
      if (success) {
        toast.success('Erfolgreich angemeldet!')
      } else {
        setError('root', {
          message: 'Ungültiger Benutzername oder Passwort'
        })
      }
    } catch (error) {
      setError('root', {
        message: 'Ungültiger Benutzername oder Passwort'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">SAN RISE GMBH</h1>
            <p className="text-muted-foreground mt-2">Management Dashboard</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-center">Anmelden</CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Melden Sie sich mit Ihren Zugangsdaten an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {errors.root.message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Benutzername</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="Benutzername eingeben"
                    className="pl-10 bg-background border-border text-foreground"
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-destructive text-sm">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Passwort eingeben"
                    className="pl-10 bg-background border-border text-foreground"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Anmelden...' : 'Anmelden'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
} 