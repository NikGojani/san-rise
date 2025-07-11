import { NextResponse } from 'next/server'
import { supabase, mapSupabaseEventToApp, mapAppEventToSupabase, type AppEvent, type SupabaseEvent } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Loading events from Supabase...')
    
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Events' },
        { status: 500 }
      )
    }

    const appEvents = events.map(mapSupabaseEventToApp)
    return NextResponse.json(appEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Events' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const newEvent: Partial<AppEvent> = await request.json()
    console.log('Creating event with data:', {
      price: newEvent.price,
      ticketsSold: newEvent.ticketsSold,
      termine: newEvent.termine,
      revenue: newEvent.revenue,
      maxTickets: newEvent.maxTickets
    })

    const supabaseEvent = mapAppEventToSupabase(newEvent)
    console.log('Mapped to Supabase event:', {
      price: supabaseEvent.price,
      tickets_sold: supabaseEvent.tickets_sold,
      termine: supabaseEvent.termine,
      revenue: supabaseEvent.revenue,
      max_tickets: supabaseEvent.max_tickets
    })
    
    const { data, error } = await supabase
      .from('events')
      .insert([supabaseEvent])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Erstellen des Events' },
        { status: 500 }
      )
    }

    const appEvent = mapSupabaseEventToApp(data as SupabaseEvent)
    console.log('Final mapped event:', {
      price: appEvent.price,
      ticketsSold: appEvent.ticketsSold,
      termine: appEvent.termine,
      revenue: appEvent.revenue,
      maxTickets: appEvent.maxTickets
    })
    
    // TODO: Wenn syncWithShopify true ist, hier Shopify-Produkt erstellen
    if (appEvent.syncWithShopify) {
      console.log('TODO: Sync new event with Shopify product:', appEvent.name)
    }
    
    return NextResponse.json(appEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Events' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const updatedEvent: AppEvent = await request.json()
    console.log('Updating event:', updatedEvent)
    
    if (!updatedEvent.id) {
      return NextResponse.json(
        { error: 'Event-ID erforderlich' },
        { status: 400 }
      )
    }

    const supabaseEvent = mapAppEventToSupabase(updatedEvent)
    
    const { data, error } = await supabase
      .from('events')
      .update(supabaseEvent)
      .eq('id', updatedEvent.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Events' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      )
    }

    const appEvent = mapSupabaseEventToApp(data as SupabaseEvent)
    
    // TODO: Wenn syncWithShopify true ist, hier Shopify-Produkt aktualisieren
    if (appEvent.syncWithShopify && appEvent.shopifyProductId) {
      console.log('TODO: Sync updated event with Shopify product:', appEvent.shopifyProductId)
    }
    
    return NextResponse.json(appEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Events' },
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
        { error: 'Event-ID erforderlich' },
        { status: 400 }
      )
    }

    console.log('Deleting event:', id)
    
    // Zuerst Event laden für Shopify-Cleanup
    const { data: eventToDelete } = await supabase
      .from('events')
      .select('shopify_product_id, sync_with_shopify, name')
      .eq('id', id)
      .single()
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Events' },
        { status: 500 }
      )
    }

    // TODO: Wenn das Event mit Shopify synchronisiert war, Produkt auch dort löschen
    if (eventToDelete?.sync_with_shopify && eventToDelete.shopify_product_id) {
      console.log('TODO: Delete Shopify product:', eventToDelete.shopify_product_id, 'for event:', eventToDelete.name)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Events' },
      { status: 500 }
    )
  }
} 