import { z } from 'zod'

export const calculatorEventSchema = z.object({
  name: z.string().min(1, 'Event-Name ist erforderlich'),
  ticketCount: z.number().min(1, 'Ticket-Anzahl muss größer 0 sein'),
  ticketPrice: z.number().min(0, 'Ticket-Preis muss positiv sein'),
  vkPercentage: z.number().min(0).max(100, 'VK-Prozent muss zwischen 0 und 100 liegen'),
  termine: z.number().min(1, 'Mindestens 1 Termin pro Monat'),
  gemaPercentage: z.number().min(0).max(100, 'GEMA-Prozent muss zwischen 0 und 100 liegen'),
  marketingCosts: z.number().min(0, 'Marketing-Kosten müssen positiv sein'),
  artistCosts: z.number().min(0, 'Künstler-Kosten müssen positiv sein'),
  locationCosts: z.number().min(0, 'Location-Kosten müssen positiv sein'),
  merchandiserCosts: z.number().min(0, 'Merchandiser-Kosten müssen positiv sein'),
  travelCosts: z.number().min(0, 'Reise-Kosten müssen positiv sein'),
  rabatt: z.number().min(0, 'Rabatt muss positiv sein'),
  aufbauhelfer: z.number().min(0, 'Aufbauhelfer-Kosten müssen positiv sein'),
  variableCosts: z.number().min(0, 'Variable Kosten müssen positiv sein'),
  ticketingFee: z.number().min(0, 'Ticketing Fee muss positiv sein'),
  description: z.string().optional(),
  date: z.string().min(1, 'Datum ist erforderlich'),
})

export type CalculatorEvent = z.infer<typeof calculatorEventSchema> & {
  id: string
  createdAt: string
  updatedAt: string
}

// Berechnungs-Hilfsfunktionen
export const calculateEventRevenue = (event: CalculatorEvent) => {
  // Berechne die Anzahl der verkauften Tickets (für alle Termine zusammen)
  const verkaufteTickets = event.ticketCount * event.termine * (event.vkPercentage / 100)
  
  // Berechne den Gesamtumsatz
  return verkaufteTickets * event.ticketPrice
}

export const calculateEventGemaFee = (event: CalculatorEvent) => {
  const revenue = calculateEventRevenue(event)
  return revenue * (event.gemaPercentage / 100)
}

export const calculateEventShopifyFee = (event: CalculatorEvent) => {
  // Wenn Ticketing Fee gesetzt ist, keine Shopify-Gebühr
  if (event.ticketingFee > 0) return 0
  
  // Berechne die Anzahl der verkauften Tickets pro Termin
  const ticketsProTermin = event.ticketCount * (event.vkPercentage / 100)
  
  // Berechne den Umsatz pro Termin
  const umsatzProTermin = ticketsProTermin * event.ticketPrice
  
  // Shopify-Gebühr pro Termin: 1,9% vom Umsatz + 0,25€ pro Ticket
  const umsatzGebuehrProTermin = umsatzProTermin * 0.019
  const ticketGebuehrProTermin = ticketsProTermin * 0.25
  const shopifyGebuehrProTermin = umsatzGebuehrProTermin + ticketGebuehrProTermin
  
  // Multipliziere mit der Anzahl der Termine
  return shopifyGebuehrProTermin * event.termine
}

export const calculateEventBasicCosts = (event: CalculatorEvent) => {
  const gemaFee = calculateEventGemaFee(event)
  return gemaFee + event.marketingCosts + event.artistCosts + 
         event.locationCosts + event.merchandiserCosts + event.travelCosts
}

export const calculateEventOptionalCosts = (event: CalculatorEvent) => {
  return event.aufbauhelfer + event.variableCosts + event.ticketingFee
}

export const calculateEventProfit = (event: CalculatorEvent) => {
  const revenue = calculateEventRevenue(event)
  const basicCosts = calculateEventBasicCosts(event)
  const optionalCosts = calculateEventOptionalCosts(event)
  const shopifyFee = calculateEventShopifyFee(event)
  // Rabatt als Prozentwert abziehen
  const rabattBetrag = revenue * (event.rabatt / 100)
  return revenue - basicCosts - optionalCosts - shopifyFee - rabattBetrag
}

export const calculateEventMonthlyRevenue = (event: CalculatorEvent) => {
  // Der Profit ist bereits der Gesamtgewinn für alle Termine
  return calculateEventProfit(event)
} 