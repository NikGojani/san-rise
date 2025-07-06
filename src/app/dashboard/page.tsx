'use client';

import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConcertsProvider, useConcerts } from './ConcertsContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
);

// Dummy-Daten
const maxTickets = 300;
const verkauft = 120;
const rest = maxTickets - verkauft;
const tageBisEvent = 10;
const durchschnittProTag = Math.ceil(rest / tageBisEvent);

const metaAds = {
  kampagne: '#1234567890',
  budget: 450,
  conversions: 95,
  cpa: 4.73,
};

const prognoseData = {
  labels: [
    'Tag 1',
    'Tag 2',
    'Tag 3',
    'Tag 4',
    'Tag 5',
    'Tag 6',
    'Tag 7',
    'Tag 8',
    'Tag 9',
    'Tag 10',
  ],
  datasets: [
    {
      label: 'Verkaufte Tickets',
      data: [10, 18, 25, 40, 55, 70, 85, 100, 110, 120],
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.2)',
      tension: 0.4,
    },
  ],
};

// Typisierung für dynamische Zeiträume
const spendConversionData30 = {
  labels: Array.from({ length: 30 }, (_, i) => `Tag ${i + 1}`),
  datasets: [
    {
      label: 'Spend',
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 8)),
      borderColor: '#818cf8',
      backgroundColor: 'rgba(129,140,248,0.2)',
      tension: 0.4,
    },
    {
      label: 'Conversion',
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 6)),
      borderColor: '#22d3ee',
      backgroundColor: 'rgba(34,211,238,0.2)',
      tension: 0.4,
    },
  ],
};

const spendConversionDataSets: Record<string, { labels: string[]; datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string; tension: number; }[] }> = {
  '7': {
    labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    datasets: [
      {
        label: 'Spend',
        data: [2, 3, 4, 3, 5, 6, 7],
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129,140,248,0.2)',
        tension: 0.4,
      },
      {
        label: 'Conversion',
        data: [1, 2, 2, 3, 4, 4, 5],
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.2)',
        tension: 0.4,
      },
    ],
  },
  '30': spendConversionData30,
};

const zeitraumOptions = [
  { value: '7', label: 'Letzte 7 Tage' },
  { value: '30', label: 'Letzte 30 Tage' },
];

// Dummy-Kalenderdaten
const kalenderEvents = [
  {
    woche: 'KW 24',
    thema: 'Anime Night Vol. 1',
    maxKapazitaet: 300,
    ticketsProTag: 18,
  },
  {
    woche: 'KW 25',
    thema: 'Anime Night Vol. 2',
    maxKapazitaet: 350,
    ticketsProTag: 22,
  },
  {
    woche: 'KW 26',
    thema: 'Anime Night Vol. 3',
    maxKapazitaet: 400,
    ticketsProTag: 25,
  },
];

// Dummy-Daten für Konzerte
const TICKETS_PRO_TERMIN = 400;
const TERMINE_PRO_KONZERT = 2;
const TICKETS_PRO_KONZERT = TICKETS_PRO_TERMIN * TERMINE_PRO_KONZERT; // 800
const AUSVERKAUFT_PROZENT = 0.8;
const VERKAUFT_PRO_KONZERT = Math.round(TICKETS_PRO_KONZERT * AUSVERKAUFT_PROZENT); // 640
const TICKET_PREIS = 37;

const KOSTEN_FIX = {
  marketing: 300,
  kuenstler: 1000,
  location: 5000,
  mercher: 500,
  reise: 800,
};

function berechneKosten(umsatz: number) {
  const gema = Math.round(umsatz * 0.09 * 100) / 100;
  const sonstige = KOSTEN_FIX.marketing + KOSTEN_FIX.kuenstler + KOSTEN_FIX.location + KOSTEN_FIX.mercher + KOSTEN_FIX.reise;
  const gesamt = gema + sonstige;
  return { gema, ...KOSTEN_FIX, gesamt };
}

const concerts = [
  {
    id: 'concert1',
    name: 'Harmonic Anime Night Vol. 1',
    maxTickets: TICKETS_PRO_KONZERT,
    verkauft: VERKAUFT_PRO_KONZERT,
    budget: 450,
  },
  {
    id: 'concert2',
    name: 'Harmonic Anime Night Vol. 2',
    maxTickets: TICKETS_PRO_KONZERT,
    verkauft: VERKAUFT_PRO_KONZERT,
    budget: 320,
  },
];

const gesamtUmsatz = concerts.reduce((sum, c) => sum + c.verkauft * TICKET_PREIS, 0);
const gesamtKosten = concerts.reduce((sum, c) => sum + berechneKosten(c.verkauft * TICKET_PREIS).gesamt, 0);
const gesamtGewinn = gesamtUmsatz - gesamtKosten;

function DashboardOverviewInner() {
  const [modus, setModus] = useState<'gesamt' | 'heute'>('gesamt');
  const { concerts } = useConcerts();
  const router = useRouter();
  // Dummywert für heute
  const TICKETS_HEUTE = 12;

  // Hilfsfunktion für die Werte je nach Modus
  function getConcertStats(concert: typeof concerts[0]) {
    if (modus === 'heute') {
      const verkauft = TICKETS_HEUTE;
      const rest = Math.max(concert.maxTickets - verkauft, 0);
      const durchschnitt = verkauft; // heute nur Tageswert
      const prozent = Math.round((verkauft / concert.maxTickets) * 100);
      const umsatz = verkauft * TICKET_PREIS;
      const kosten = berechneKosten(umsatz);
      const gewinn = umsatz - kosten.gesamt;
      return { rest, durchschnitt, prozent, umsatz, kosten, gewinn, verkauft };
    } else {
      const rest = Math.max(concert.maxTickets - concert.verkauft, 0);
      const durchschnitt = Math.ceil(concert.maxTickets / 10); // Dummy: 10 Tage
      const prozent = Math.round((concert.verkauft / concert.maxTickets) * 100);
      const umsatz = concert.verkauft * TICKET_PREIS;
      const kosten = berechneKosten(umsatz);
      const gewinn = umsatz - kosten.gesamt;
      return { rest, durchschnitt, prozent, umsatz, kosten, gewinn, verkauft: concert.verkauft };
    }
  }

  const shareholderData = [
    { name: 'Nik Gojani', percent: 31.5 },
    { name: 'Adrian Henningsen', percent: 31.5 },
    { name: 'Sebastian Tury', percent: 17 },
    { name: 'Team Mexify GmbH', percent: 20 },
  ];

  // Hilfsfunktion für Gesellschafter-Namen: Alle Namen in einer Zeile
  function shareholderName(name: string) {
    return <span className="whitespace-nowrap font-bold text-gray-700">{name}</span>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-6 relative">
      <div className="flex flex-col items-center mb-4 mt-2">
        <img src="/WhatsApp%20Image%202025-07-05%20at%2004.18.38.jpeg" alt="SAN RISE Logo" className="mx-auto mb-2 max-w-xs max-h-40 w-auto h-auto rounded-lg" style={{ filter: 'invert(1)' }} />
      </div>
      <div className="flex justify-center mb-6">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded font-bold shadow ${modus === 'gesamt' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setModus('gesamt')}
          >Übersicht</button>
          <button
            className={`px-4 py-2 rounded font-bold shadow ${modus === 'heute' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setModus('heute')}
          >Heute</button>
        </div>
      </div>
      {/* Gesamtumsatz-Kasten */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-gray-100 rounded-xl p-4 shadow flex flex-col items-center">
          <span className="text-lg font-semibold mb-1">Gesamtumsatz</span>
          <span className="text-3xl font-bold text-green-600 mb-1">{modus === 'heute'
            ? (concerts.length * TICKETS_HEUTE * TICKET_PREIS).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
            : gesamtUmsatz.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
          <span className="text-xs text-gray-500">(Ø Ticketpreis: 37€)</span>
          {modus === 'gesamt' && <>
            <span className="text-lg font-semibold mt-4 mb-1">Gesamtgewinn</span>
            <span className="text-2xl font-bold text-green-600 mb-1">{gesamtGewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </>}
        </div>
      </div>
      {/* Konzertliste */}
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {concerts.map((concert) => {
          const { rest, durchschnitt, prozent, umsatz, kosten, gewinn, verkauft } = getConcertStats(concert);
          return (
            <Link
              key={concert.id}
              href={`/dashboard/${concert.id}?modus=${modus}`}
              className="block bg-gray-100 rounded-xl p-4 shadow hover:bg-gray-200 transition-colors cursor-pointer text-gray-900"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="text-lg font-semibold mb-1">{concert.name}</div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
                    <span>Max Tickets: <span className="text-black font-bold">{concert.maxTickets}</span></span>
                    <span>Verkauft: <span className="text-black font-bold">{verkauft}</span></span>
                    <span>Rest: <span className="text-black font-bold">{rest}</span></span>
                    <span>Ø/Tag: <span className="text-black font-bold">{durchschnitt}</span></span>
                    <span>Prognose: <span className="text-black font-bold">{prozent}% ausverkauft</span></span>
                    <span>Budget: <span className="text-black font-bold">{concert.budget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></span>
                    <span>Umsatz: <span className="text-green-600 font-bold">{umsatz.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></span>
                    {modus === 'gesamt' && <span>Gewinn: <span className="text-green-600 font-bold">{gewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></span>}
                  </div>
                </div>
                <div className="text-right text-gray-500 text-xs md:text-sm mt-2 md:mt-0">Details &rarr;</div>
              </div>
            </Link>
          );
        })}
      </div>
      {/* Gewinnverteilung ganz unten */}
      <div className="bg-gray-100 rounded-xl p-4 shadow flex flex-col items-center mt-10 mb-4">
        <span className="text-lg font-semibold mb-4 text-center w-full">Gewinnverteilung</span>
        <div className="flex flex-col w-full max-w-2xl mx-auto gap-2 items-start justify-center">
          {shareholderData.map((s, i) => {
            const value = Math.round(gesamtGewinn * s.percent / 100);
            const width = s.percent;
            return (
              <div key={s.name} className="grid grid-cols-[minmax(8rem,12rem)_16rem_auto_auto] items-center gap-4 w-full text-left">
                <span className="min-w-32 max-w-xs flex-shrink-0 text-sm font-bold text-gray-700">{shareholderName(s.name)}</span>
                <div className="h-4 w-64 bg-gray-200 rounded relative overflow-hidden max-w-full">
                  <div
                    className="h-4 bg-green-500 rounded"
                    style={{ width: `${width}%`, transition: 'width 0.3s' }}
                  />
                </div>
                <span className="ml-2 text-sm font-bold text-green-600 min-w-[90px] text-left">
                  {value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
                <span className="ml-2 text-xs text-gray-500 text-left">({s.percent}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <ConcertsProvider>
      <DashboardOverviewInner />
    </ConcertsProvider>
  );
}
