import { NextResponse } from 'next/server'
import { supabase, mapSupabaseTaskToApp, mapAppTaskToSupabase, type AppTask, type SupabaseTask } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Loading tasks from Supabase...')
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Aufgaben' },
        { status: 500 }
      )
    }

    const appTasks = tasks.map(mapSupabaseTaskToApp)
    return NextResponse.json(appTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Aufgaben' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const newTask: Partial<AppTask> = await request.json()
    console.log('Creating task:', newTask)

    const supabaseTask = mapAppTaskToSupabase(newTask)
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([supabaseTask])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Erstellen der Aufgabe' },
        { status: 500 }
      )
    }

    const appTask = mapSupabaseTaskToApp(data as SupabaseTask)
    return NextResponse.json(appTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Aufgabe' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const updatedTask: AppTask = await request.json()
    console.log('Updating task:', updatedTask)
    
    if (!updatedTask.id) {
      return NextResponse.json(
        { error: 'Aufgaben-ID erforderlich' },
        { status: 400 }
      )
    }

    const supabaseTask = mapAppTaskToSupabase(updatedTask)
    
    const { data, error } = await supabase
      .from('tasks')
      .update(supabaseTask)
      .eq('id', updatedTask.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der Aufgabe' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Aufgabe nicht gefunden' },
        { status: 404 }
      )
    }

    const appTask = mapSupabaseTaskToApp(data as SupabaseTask)
    return NextResponse.json(appTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Aufgabe' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Aufgaben-ID erforderlich' },
        { status: 400 }
      )
    }

    console.log('Deleting task:', id)
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Löschen der Aufgabe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Aufgabe' },
      { status: 500 }
    )
  }
} 