'use client';
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';
import { saveAs } from 'file-saver';
import { PencilSquareIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

interface Concert {
  id: string;
  name: string;
  maxTickets: number;
  verkauft: number;
  budget: number;
}

interface DashboardDetailProps {
  concert: Concert;
  modus?: 'gesamt' | 'heute';
  updateConcertName: (id: string, name: string) => void;
}

const metaAds = {
  kampagne: '#1234567890',
  conversions: 95,
  cpa: 4.73,
  budget: 450, // Korrigiert: entspricht dem Wert in der Meta-Box
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
  '30': {
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
  },
};

const zeitraumOptions = [
  { value: '7', label: 'Letzte 7 Tage' },
  { value: '30', label: 'Letzte 30 Tage' },
];

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

// Gewinnverteilung Daten und Hilfsfunktion
const shareholderData = [
  { name: 'Nik Gojani', percent: 31.5 },
  { name: 'Adrian Henningsen', percent: 31.5 },
  { name: 'Sebastian Tury', percent: 17 },
  { name: 'Team Mexify GmbH', percent: 20 },
];
function shareholderName(name: string) {
  return <span className="whitespace-nowrap font-bold text-gray-700">{name}</span>;
}

export default function DashboardDetail({ concert, modus = 'gesamt', updateConcertName }: DashboardDetailProps) {
  const router = useRouter();
  const [zeitraum, setZeitraum] = useState('7');
  const [showKosten, setShowKosten] = useState(false);
  const [kuenstler, setKuenstler] = useState(1000);
  const [location, setLocation] = useState(5000);
  const [mercher, setMercher] = useState(500);
  const [reise, setReise] = useState(800);
  const [editField, setEditField] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState(concert.name);
  const rest = Math.max(concert.maxTickets - concert.verkauft, 0);
  const durchschnittProTag = Math.ceil(concert.maxTickets / 10); // Dummy: 10 Tage
  const prozent = Math.round((concert.verkauft / concert.maxTickets) * 100);

  // Vorstellung-Daten berechnen
  const vorstellungen = modus === 'heute'
    ? [
        { uhrzeit: '18:30', max: 400, verkauft: 6, rest: 394 },
        { uhrzeit: '20:30', max: 400, verkauft: 6, rest: 394 },
      ]
    : [
        { uhrzeit: '18:30', max: 400, verkauft: 320, rest: 80 },
        { uhrzeit: '20:30', max: 400, verkauft: 320, rest: 80 },
      ];

  // Umsatz und Kosten auf Basis der Vorstellungen berechnen
  const umsatz = vorstellungen.reduce((sum, v) => sum + v.verkauft * 37, 0);
  // Kosten auf den Tag runterrechnen im Heute-Modus
  const kosten = modus === 'heute'
    ? {
        gema: Math.round(umsatz * 0.09 * 100) / 100,
        kuenstler: Math.round(kuenstler / 30),
        location: Math.round(location / 30),
        mercher: Math.round(mercher / 30),
        reise: Math.round(reise / 30),
      }
    : {
        gema: Math.round(umsatz * 0.09 * 100) / 100,
        kuenstler,
        location,
        mercher,
        reise,
      };
  const [extraKosten, setExtraKosten] = useState<{ name: string; value: number }[]>([]);
  const [newKostenName, setNewKostenName] = useState('');
  const [newKostenValue, setNewKostenValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [shopifyApiKey, setShopifyApiKey] = useState('');
  const [metaApiKey, setMetaApiKey] = useState('');

  // metaAds.budget ist der aktuelle Marketingwert (Dummy, später API)
  const marketing = metaAds.budget;

  // Hilfsfunktion für Gesamtkosten inkl. Extra
  const kostenSumme = kosten.gema + marketing + kosten.kuenstler + kosten.location + kosten.mercher + kosten.reise + extraKosten.reduce((sum, k) => sum + k.value, 0);
  const gewinn = umsatz - kostenSumme;

  // CSV-Export
  function exportKostenCSV() {
    const rows = [
      ['Kostenpunkt', 'Betrag'],
      ['GEMA (9%)', kosten.gema],
      ['Marketing', marketing],
      ['Künstler', kosten.kuenstler],
      ['Locationmiete', kosten.location],
      ['Mercher/Logistiker', kosten.mercher],
      ['Reisekosten', kosten.reise],
      ...extraKosten.map(k => [k.name, k.value]),
      ['Summe', kostenSumme],
    ];
    const csv = rows.map(r => `${r[0]};${r[1]}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Kosten_${concert.name.replace(/\s+/g, '_')}.csv`);
  }

  // Chart-Optionen für White-Mode
  const chartOptionsWhite = {
    plugins: { legend: { labels: { color: '#222' } } },
    scales: {
      x: { grid: { color: '#eee' }, ticks: { color: '#222' } },
      y: { grid: { color: '#eee' }, ticks: { color: '#222' } },
    },
    maintainAspectRatio: false,
  };

  // State für Meta-IDs
  const [metaIds, setMetaIds] = useState<string[]>([]);
  const [showMetaInput, setShowMetaInput] = useState(false);
  const [metaInput, setMetaInput] = useState('');

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-2 sm:p-4 md:p-6">
      <div className="flex flex-col items-start mb-4 mt-2">
      </div>
      <div className="flex items-center gap-2 mb-6">
        {isEditingTitle ? (
          <input
            type="text"
            className="text-2xl font-bold border-b-2 border-blue-400 focus:outline-none bg-transparent text-left w-full max-w-xs"
            value={editTitleValue}
            autoFocus
            onChange={e => setEditTitleValue(e.target.value)}
            onBlur={() => { setIsEditingTitle(false); updateConcertName(concert.id, editTitleValue); }}
            onKeyDown={e => { if (e.key === 'Enter') { setIsEditingTitle(false); updateConcertName(concert.id, editTitleValue); } }}
            style={{ minWidth: 120 }}
          />
        ) : (
          <h1 className="text-2xl font-bold text-left break-words max-w-xs sm:max-w-md md:max-w-2xl">{concert.name}</h1>
        )}
        <button
          className="ml-2 p-1 rounded hover:bg-gray-200"
          onClick={() => { setIsEditingTitle(true); setEditTitleValue(concert.name); }}
          title="Event-Titel bearbeiten"
        >
          <PencilSquareIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Ticket-Status */}
        <div className="bg-gray-100 rounded-lg p-4 shadow flex flex-col justify-between min-h-[170px] md:col-span-1 w-full">
          <h2 className="text-lg font-semibold mb-2">Ticket-Status</h2>
          <div className="mb-2">
            {vorstellungen.map((v, i) => (
              <div key={i} className="mb-1">
                <div className="font-semibold text-gray-700">Vorstellung {v.uhrzeit}</div>
                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4">
                  <span>Max: <span className="text-black font-bold">{v.max}</span></span>
                  <span>Verkauft: <span className="text-black font-bold">{v.verkauft}</span></span>
                  <span>Rest: <span className="text-black font-bold">{v.rest}</span></span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base">
            <span className="text-gray-500">Max Tickets</span>
            <span>800</span>
            <span className="text-gray-500">Verkauft</span>
            <span>640</span>
            <span className="text-gray-500">Rest</span>
            <span>160</span>
            <span className="text-gray-500">Ø/Tag</span>
            <span>{durchschnittProTag}</span>
          </div>
        </div>
        {/* Prognose */}
        <div className="bg-gray-100 rounded-lg p-4 shadow flex flex-col justify-between min-h-[170px] md:col-span-1 w-full">
          <h2 className="text-lg font-semibold mb-2">Prognose</h2>
          <div className="h-40">
            <Line data={{
              ...prognoseData,
              datasets: [{
                ...prognoseData.datasets[0],
                data: [64, 128, 192, 256, 320, 384, 448, 512, 576, 640],
              }],
            }} options={chartOptionsWhite} />
          </div>
          <div className="mt-2">
            <div className="h-1.5 bg-gray-300 rounded-full w-2/3 mb-1" />
            <p className="text-gray-700 text-sm">Prognose: 80% ausverkauft</p>
          </div>
        </div>
        {/* Meta Ads Übersicht (noch dunkler blau, weiße Schrift) */}
        <div className="bg-blue-700 rounded-lg p-4 shadow flex flex-col justify-between min-h-[170px] md:col-span-1 w-full">
          <div className="flex items-center mb-2 gap-2 justify-between">
            <img src="/pngimg.com%20-%20meta_PNG7.png" alt="Meta Logo" className="h-6 w-auto object-contain" />
            <button
              className="bg-white text-blue-700 font-bold px-3 py-1 rounded shadow hover:bg-blue-100 text-xs ml-auto"
              onClick={() => setShowMetaInput(true)}
            >
              AD HINZUFÜGEN
            </button>
          </div>
          {showMetaInput && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="rounded px-2 py-1 text-sm border border-blue-300 focus:outline-none"
                placeholder="Kampagnen- oder Anzeigengruppen-ID"
                value={metaInput}
                onChange={e => setMetaInput(e.target.value)}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && metaInput.trim()) {
                    setMetaIds(ids => [...ids, metaInput.trim()]);
                    setMetaInput('');
                    setShowMetaInput(false);
                  } else if (e.key === 'Escape') {
                    setShowMetaInput(false);
                    setMetaInput('');
                  }
                }}
                onBlur={() => setShowMetaInput(false)}
              />
              <button
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold"
                onClick={() => {
                  if (metaInput.trim()) {
                    setMetaIds(ids => [...ids, metaInput.trim()]);
                    setMetaInput('');
                    setShowMetaInput(false);
                  }
                }}
              >OK</button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base mt-2">
            <span className="text-white">Kampagne:</span>
            <span className="text-blue-100">{metaIds.length === 0 ? 'Keine Anzeigen verbunden' : `${metaIds.length} Anzeige${metaIds.length > 1 ? 'n' : ''} verbunden`}</span>
            <span className="text-white">Budget {modus === 'heute' ? 'heute' : 'bisher'}:</span>
            <span className="text-blue-100">{modus === 'heute' ? '15,00 €' : concert.budget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
            <span className="text-white">Conversions:</span>
            <span className="text-blue-100">{metaAds.conversions}</span>
            <span className="text-white">CPA:</span>
            <span className="text-blue-100">{metaAds.cpa.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        </div>
        {/* Spend/Conversion und Umsatz nebeneinander, auf Mobil untereinander */}
        <div className="flex flex-col md:flex-row gap-4 min-h-[170px] md:col-span-2 w-full">
          {/* Spend/Conversion */}
          <div className="bg-gray-100 rounded-lg p-4 shadow flex-1 flex flex-col justify-between min-h-[170px] w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Spend / Conversion</h2>
              <select
                className="bg-gray-200 text-gray-900 rounded px-2 py-1 text-sm border border-gray-300 focus:outline-none"
                value={zeitraum}
                onChange={e => setZeitraum(e.target.value)}
              >
                {zeitraumOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="h-40">
              <Line data={{
                ...spendConversionDataSets[zeitraum],
                datasets: spendConversionDataSets[zeitraum].datasets.map(ds => ({
                  ...ds,
                  data: Array(10).fill(64),
                })),
              }} options={chartOptionsWhite} />
            </div>
            <div className="mt-1 text-gray-500 text-xs">
              Zeitraum: {zeitraumOptions.find(opt => opt.value === zeitraum)?.label}
            </div>
          </div>
          {/* Umsatz-Box */}
          <div className="bg-gray-100 rounded-lg p-4 shadow flex flex-col justify-start min-h-[170px] w-full mt-4 md:mt-0 md:w-56 md:min-w-[140px] md:ml-2">
            <div className="flex flex-col items-start">
              <h2 className="text-lg font-semibold mb-1">Umsatz</h2>
              <div className={`text-2xl font-bold mb-1 ${umsatz >= 0 ? 'text-green-600' : 'text-red-500'}`}>{umsatz.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
              {modus === 'gesamt' && <>
                <h2 className="text-lg font-semibold mt-2 mb-1">Gewinn</h2>
                <div className={`text-2xl font-bold mb-1 ${gewinn >= 0 ? 'text-green-600' : 'text-red-500'}`}>{gewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
              </>}
              {modus === 'gesamt' && <>
                <button
                  className="text-xs text-gray-500 mt-2 font-semibold hover:underline focus:outline-none text-left w-full"
                  onClick={() => setShowKosten((v) => !v)}
                >
                  Sonstige Kosten
                </button>
                <div className="text-xs text-gray-500 font-semibold mt-1">
                  -{kostenSumme.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </div>
              </>}
            </div>
            {modus === 'gesamt' && showKosten && (
              <div className="mt-2 text-xs text-gray-700 space-y-1">
                <div>GEMA (9%): -{kosten.gema.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                <div>Marketing: -{marketing.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                <div>
                  Künstler: -{
                    editField === 'kuenstler' ? (
                      <input
                        type="number"
                        className="border rounded px-1 w-20 text-right"
                        autoFocus
                        value={kuenstler}
                        min={0}
                        onChange={e => setKuenstler(Number(e.target.value))}
                        onBlur={() => setEditField(null)}
                        onKeyDown={e => { if (e.key === 'Enter') setEditField(null); }}
                      />
                    ) : (
                      <span onDoubleClick={() => setEditField('kuenstler')} className="cursor-pointer hover:underline">{kuenstler.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    )
                  }
                </div>
                <div>
                  Locationmiete: -{
                    editField === 'location' ? (
                      <input
                        type="number"
                        className="border rounded px-1 w-20 text-right"
                        autoFocus
                        value={location}
                        min={0}
                        onChange={e => setLocation(Number(e.target.value))}
                        onBlur={() => setEditField(null)}
                        onKeyDown={e => { if (e.key === 'Enter') setEditField(null); }}
                      />
                    ) : (
                      <span onDoubleClick={() => setEditField('location')} className="cursor-pointer hover:underline">{location.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    )
                  }
                </div>
                <div>
                  Mercher/Logistiker: -{
                    editField === 'mercher' ? (
                      <input
                        type="number"
                        className="border rounded px-1 w-20 text-right"
                        autoFocus
                        value={mercher}
                        min={0}
                        onChange={e => setMercher(Number(e.target.value))}
                        onBlur={() => setEditField(null)}
                        onKeyDown={e => { if (e.key === 'Enter') setEditField(null); }}
                      />
                    ) : (
                      <span onDoubleClick={() => setEditField('mercher')} className="cursor-pointer hover:underline">{mercher.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    )
                  }
                </div>
                <div>
                  Reisekosten: -{
                    editField === 'reise' ? (
                      <input
                        type="number"
                        className="border rounded px-1 w-20 text-right"
                        autoFocus
                        value={reise}
                        min={0}
                        onChange={e => setReise(Number(e.target.value))}
                        onBlur={() => setEditField(null)}
                        onKeyDown={e => { if (e.key === 'Enter') setEditField(null); }}
                      />
                    ) : (
                      <span onDoubleClick={() => setEditField('reise')} className="cursor-pointer hover:underline">{reise.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    )
                  }
                </div>
                {/* Extra Kostenpunkte */}
                {extraKosten.map((k, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="border rounded px-1 w-24 text-xs"
                      value={k.name}
                      onChange={e => {
                        const arr = [...extraKosten];
                        arr[idx].name = e.target.value;
                        setExtraKosten(arr);
                      }}
                      placeholder="Kostenpunkt"
                    />
                    <input
                      type="number"
                      className="border rounded px-1 w-20 text-right text-xs"
                      value={k.value}
                      min={0}
                      onChange={e => {
                        const arr = [...extraKosten];
                        arr[idx].value = Number(e.target.value);
                        setExtraKosten(arr);
                      }}
                      placeholder="Betrag"
                    />
                    <button
                      className="text-red-500 hover:underline text-xs"
                      onClick={() => setExtraKosten(extraKosten.filter((_, i) => i !== idx))}
                      title="Entfernen"
                    >✕</button>
                  </div>
                ))}
                {/* Hinzufügen-Feld */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    className="border rounded px-1 w-24 text-xs"
                    value={newKostenName}
                    onChange={e => setNewKostenName(e.target.value)}
                    placeholder="Kostenpunkt"
                  />
                  <input
                    type="number"
                    className="border rounded px-1 w-20 text-right text-xs"
                    value={newKostenValue}
                    min={0}
                    onChange={e => setNewKostenValue(e.target.value)}
                    placeholder="Betrag"
                  />
                  <button
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold hover:bg-gray-300"
                    onClick={() => {
                      if (newKostenName.trim() && newKostenValue) {
                        setExtraKosten([...extraKosten, { name: newKostenName.trim(), value: Number(newKostenValue) }]);
                        setNewKostenName('');
                        setNewKostenValue('');
                      }
                    }}
                  >Kostenpunkt hinzufügen</button>
                </div>
                {/* Export-Button */}
                <div className="mt-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700"
                    onClick={exportKostenCSV}
                  >Kostentabelle herunterladen</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Gewinnverteilung mobil als gestapelte Liste */}
      <div className="bg-gray-100 rounded-xl p-4 shadow flex flex-col items-center mt-10 mb-4 w-full max-w-2xl mx-auto">
        <span className="text-lg font-semibold mb-4 text-center w-full">Gewinnverteilung</span>
        <div className="flex flex-col w-full gap-4 items-stretch">
          {shareholderData.map((s, i) => {
            const value = Math.round(gewinn * s.percent / 100);
            return (
              <div key={s.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full text-left bg-white rounded-lg shadow p-3">
                <span className="min-w-32 max-w-xs flex-shrink-0 text-sm font-bold text-gray-700">{shareholderName(s.name)}</span>
                <div className="h-4 w-full bg-gray-200 rounded relative overflow-hidden max-w-full mt-2 sm:mt-0">
                  <div
                    className="h-4 bg-green-500 rounded"
                    style={{ width: `${s.percent}%`, transition: 'width 0.3s' }}
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

      {/* Einstellungsmenü */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-[#f5f5f7]/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">API-Einstellungen</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Shopify API Key</label>
                <input
                  type="password"
                  value={shopifyApiKey}
                  onChange={(e) => setShopifyApiKey(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                  placeholder="Shopify API Key eingeben"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Meta API Key</label>
                <input
                  type="password"
                  value={metaApiKey}
                  onChange={(e) => setMetaApiKey(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                  placeholder="Meta API Key eingeben"
                />
              </div>

              <div className="text-xs text-gray-500">
                Diese API-Keys werden für die Integration mit Shopify (Ticketverkauf) und Meta (Werbekennzahlen) verwendet.
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Schließen
              </button>
              <button
                onClick={() => {
                  // Hier später: API-Keys speichern und testen
                  setShowSettings(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 