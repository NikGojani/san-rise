"use client";
import React, { useState } from "react";
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const initial = {
  ticketsProTermin: 400,
  termine: 2,
  vkProzent: 80,
  ticketPreis: 37,
  gema: 2231.10,
  marketing: 3000,
  kuenstler: 1000,
  location: 5000,
  mercher: 500,
  reise: 800,
  optionalAufbau: 1000,
  optionalVariabel: 2000,
  optionalTicketing: 2300,
  corporate: 3300,
  steuer: 500,
};

function exportCSV(data: any, verkauft: number, umsatz: number, kosten: number, gewinn: number, kostenOpt: number, gewinnOpt: number, monatGewinn: number, monatGewinnOpt: number, jahrUmsatz: number, jahrUmsatzOpt: number) {
  const rows = [
    ['Kategorie', 'Betrag'],
    ['Tickets pro Termin', data.ticketsProTermin],
    ['Termine', data.termine],
    ['VK-Prozent', data.vkProzent],
    ['Verkauft', verkauft],
    ['Ticketpreis', data.ticketPreis],
    ['Umsatz', umsatz],
    ['GEMA', data.gema],
    ['Marketing', data.marketing],
    ['Künstler', data.kuenstler],
    ['Locationmiete', data.location],
    ['Mercher/Logistiker', data.mercher],
    ['Reisekosten', data.reise],
    ['Gesamtkosten', kosten],
    ['Gewinn', gewinn],
    ['OPTIONAL Aufbauhelfer', data.optionalAufbau],
    ['OPTIONAL Variable Kosten', data.optionalVariabel],
    ['OPTIONAL Ticketing Fee', data.optionalTicketing],
    ['Gesamtkosten (opt)', kostenOpt],
    ['Gewinn (opt)', gewinnOpt],
    ['Monatsgewinn', monatGewinn],
    ['Monatsgewinn (opt)', monatGewinnOpt],
    ['Jahresgewinn', jahrUmsatz],
    ['Jahresgewinn (opt)', jahrUmsatzOpt],
  ];
  const csv = rows.map(r => `${r[0]};${r[1]}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Kostenaufstellung.csv';
  a.click();
}

export default function KostenTool() {
  const [data, setData] = useState(initial);
  const [optionalCorporate, setOptionalCorporate] = useState<number | undefined>(undefined);
  const [optionalSteuer, setOptionalSteuer] = useState<number | undefined>(undefined);

  // Automatische Berechnung
  const ticketsTotal = data.ticketsProTermin * data.termine;
  const verkauft = Math.round(ticketsTotal * (data.vkProzent / 100));
  const umsatz = data.ticketPreis * verkauft;
  const gema = Math.round(umsatz * 0.09 * 100) / 100;
  const shopifyFee = Math.round((umsatz * 0.019 + verkauft * 0.25) * 100) / 100;
  const shopifyActive = data.optionalTicketing <= 0;
  const kosten = gema + data.marketing + data.kuenstler + data.location + data.mercher + data.reise + (shopifyActive ? shopifyFee : 0);
  const gewinn = umsatz - kosten;
  const kostenOpt = kosten + data.optionalAufbau + data.optionalVariabel + data.optionalTicketing;
  const gewinnOpt = umsatz - kostenOpt;

  // Monat/Jahr
  const monatUmsatz = 2 * gewinn;
  const monatGewinn = monatUmsatz - data.corporate - data.steuer;
  const monatUmsatzOpt = 2 * gewinnOpt;
  const monatGewinnOpt = monatUmsatzOpt - (optionalCorporate ?? data.corporate) - (optionalSteuer ?? data.steuer);
  const jahrUmsatz = 12 * monatGewinn;
  const jahrUmsatzOpt = 12 * monatGewinnOpt;

  function handleChange(key: keyof typeof data, value: string) {
    setData(d => ({ ...d, [key]: Number(value) }));
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-[system-ui,sans-serif] flex flex-col items-center justify-center p-8">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mt-8">
        {/* Einzeltermin */}
        <div className="bg-white rounded-2xl p-8 flex-1 w-full lg:w-1/3 border border-gray-200 shadow-xl flex flex-col" style={{ minHeight: 400 }}>
          <div className="text-lg font-bold mb-2 tracking-tight">SAMSTAGSTERMIN</div>
          <div className="flex flex-col gap-0 mb-4">
            <div className="font-bold text-2xl flex items-center gap-2">
              <input type="number" className="w-20 bg-transparent border-b border-gray-100/30 text-gray-900 text-center font-bold focus:ring-2 focus:ring-blue-200" value={data.ticketsProTermin} onChange={e => handleChange('ticketsProTermin', e.target.value)} /> TICKETS
            </div>
            <div className="font-bold text-2xl flex items-center gap-2">
              <input type="number" className="w-14 bg-transparent border-b border-gray-100/30 text-gray-900 text-center font-bold focus:ring-2 focus:ring-blue-200" value={data.termine} onChange={e => handleChange('termine', e.target.value)} /> TERMINE
            </div>
            <div className="text-xs text-gray-500 font-normal mt-1 ml-1">{ticketsTotal} Tickets</div>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-lg whitespace-nowrap">
            <input type="number" className="w-16 bg-transparent border-b border-gray-100/30 text-gray-900 text-center font-bold focus:ring-2 focus:ring-blue-200" value={data.ticketPreis} onChange={e => handleChange('ticketPreis', e.target.value)} />€ ×
            <input type="number" className="w-16 bg-transparent border-b border-gray-100/30 text-gray-900 text-center font-bold focus:ring-2 focus:ring-blue-200" value={data.vkProzent} min={0} max={100} onChange={e => handleChange('vkProzent', e.target.value)} />% VK
            <div className="w-full flex items-center mb-2">
              <span className="font-bold text-lg text-left flex-1">{verkauft} verkauft</span>
              <span className="font-bold text-lg text-gray-800 text-right flex-1">{umsatz.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} <span className="text-lg font-normal">Umsatz</span></span>
            </div>
          </div>
          {/* Kostenstruktur als Grid */}
          <div className="mb-4 grid grid-cols-[1fr_auto] gap-y-2 gap-x-4 text-base">
            <div className="text-gray-700">GEMA (9%)</div>
            <div className="flex items-center justify-end">
              <span className="w-28 text-right font-mono">{gema.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-700">MARKETING</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-28 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.marketing} onChange={e => handleChange('marketing', e.target.value)} />
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-700">KÜNSTLER</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-28 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.kuenstler} onChange={e => handleChange('kuenstler', e.target.value)} />
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-700">LOCATIONMIETE</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-28 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.location} onChange={e => handleChange('location', e.target.value)} />
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-700">MERCHER / LOGISTIKER</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-28 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.mercher} onChange={e => handleChange('mercher', e.target.value)} />
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-700">REISEKOSTEN</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-28 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.reise} onChange={e => handleChange('reise', e.target.value)} />
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-700">SHOPIFY-GEBÜHR</div>
            <div className="flex items-center justify-end">
              <span className={`w-28 text-right font-mono ${!shopifyActive ? 'text-gray-300' : 'text-gray-900'}`}>{shopifyFee.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-500 text-xs mb-2">(1,9% + 0,25€ pro Ticket)</div>
          </div>
          <div className="font-bold text-xl mb-4 flex justify-between items-center">
            <span>GEWINN</span>
            <span className="text-right min-w-[120px]">{gewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>
          <div className="border-t border-gray-200 my-4" />
          <div className="font-bold mb-1 text-gray-700">OPTIONAL</div>
          <div className="mb-4 grid grid-cols-[1fr_auto] gap-y-2 gap-x-4 text-base">
            <div className="text-gray-700">AUFBAUHELFER</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-28 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.optionalAufbau} onChange={e => handleChange('optionalAufbau', e.target.value)} />
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-700">VARIABLE KOSTEN</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-28 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.optionalVariabel} onChange={e => handleChange('optionalVariabel', e.target.value)} />
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-700">TICKETING FEE</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-28 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.optionalTicketing} onChange={e => handleChange('optionalTicketing', e.target.value)} />
              <span className="ml-1 text-gray-500">€</span>
            </div>
          </div>
          <div className="font-bold text-xl flex justify-between items-center">
            <span>GEWINN</span>
            <span className="text-right min-w-[120px]">{gewinnOpt.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        </div>
        {/* Monat */}
        <div className="bg-white rounded-2xl p-8 flex-1 w-full lg:w-1/3 border border-gray-200 shadow-xl flex flex-col relative">
          <div className="text-lg font-bold mb-2 tracking-tight">PRO MONAT</div>
          <div className="mb-4 font-bold text-2xl">{ticketsTotal * 2} Tickets</div>
          <div className="mb-4 text-sm font-normal text-gray-500">2 × {gewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} = {monatUmsatz.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
          <div className="space-y-2 mb-4 text-base">
            <div className="flex justify-between items-center">CORPORATE COST <input type="number" className="w-24 bg-transparent border-b border-gray-100/30 text-gray-900 text-right ml-2 focus:ring-2 focus:ring-blue-200" value={data.corporate} onChange={e => handleChange('corporate', e.target.value)} />€</div>
            <div className="flex justify-between items-center">STEUERBERATER <input type="number" className="w-24 bg-transparent border-b border-gray-100/30 text-gray-900 text-right ml-2 focus:ring-2 focus:ring-blue-200" value={data.steuer} onChange={e => handleChange('steuer', e.target.value)} />€</div>
          </div>
          <div className="mb-4">
            <div className="inline-block bg-[#00E676] text-white rounded-xl px-3 py-1.5 font-bold text-base">GEWINN <span className="ml-2">{monatGewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
          </div>
          <div className="border-t border-gray-200 my-4" />
          <div className="font-bold mb-1 text-gray-700">OPTIONAL</div>
          <div className="mb-4 text-lg flex items-center gap-2">
            2 × <span className="font-bold">{gewinnOpt.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span> = <span className="font-bold text-2xl text-gray-800">{monatUmsatzOpt.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>
          <div className="mb-4">
            <div className="inline-block bg-[#33EB91] text-white rounded-xl px-3 py-1.5 font-bold text-base">GEWINN <span className="ml-2">{monatGewinnOpt.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
          </div>
          {/* Gewinnverteilung PRO MONAT horizontal */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 shadow flex flex-col gap-3 w-full">
            <span className="text-xs font-semibold mb-1 text-center">Gewinnverteilung</span>
            <div className="flex flex-col gap-2">
              {[{ name: 'Nik', percent: 31.5 }, { name: 'Adrian', percent: 31.5 }, { name: 'Sebastian', percent: 17 }, { name: 'Mexify', percent: 20 }].map((s, i) => {
                const value = Math.round(monatGewinn * s.percent / 100);
                return (
                  <div key={s.name} className="flex items-center gap-2 w-full">
                    <span className="w-20 truncate font-bold text-gray-700">{s.name}</span>
                    <div className="h-2 w-full bg-gray-200 rounded relative overflow-hidden mx-2">
                      <div className="h-2 bg-green-500 rounded" style={{ width: `${s.percent}%` }} />
                    </div>
                    <span className="font-bold text-green-600 min-w-[60px] text-right">{value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    <span className="text-[10px] text-gray-500">({s.percent}%)</span>
                  </div>
                );
              })}
            </div>
            {/* Optional Gewinnverteilung */}
            <div className="mt-2">
              <span className="text-[10px] font-semibold mb-1 block text-center text-gray-400">Optional</span>
              <div className="flex flex-col gap-2">
                {[{ name: 'Nik', percent: 31.5 }, { name: 'Adrian', percent: 31.5 }, { name: 'Sebastian', percent: 17 }, { name: 'Mexify', percent: 20 }].map((s, i) => {
                  const value = Math.round(monatGewinnOpt * s.percent / 100);
                  return (
                    <div key={s.name} className="flex items-center gap-2 w-full opacity-80">
                      <span className="w-20 truncate font-bold text-gray-400">{s.name}</span>
                      <div className="h-1.5 w-full bg-gray-100 rounded relative overflow-hidden mx-2">
                        <div className="h-1.5 bg-green-300 rounded" style={{ width: `${s.percent}%` }} />
                      </div>
                      <span className="font-bold text-green-500 min-w-[60px] text-right">{value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      <span className="text-[9px] text-gray-400">({s.percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Jahr */}
        <div className="bg-white rounded-2xl p-8 flex-1 w-full lg:w-1/3 border border-gray-200 shadow-xl flex flex-col relative" style={{ minHeight: 400 }}>
          <div className="text-lg font-bold mb-2 tracking-tight">PRO JAHR</div>
          <div className="mb-4 font-bold text-2xl">2 TERMINE × 12 MONATE {ticketsTotal * 12} Tickets</div>
          <div className="mb-4 text-lg">12 × <span className="font-normal text-gray-600">{monatGewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span> <span className="font-bold text-gray-800">{jahrUmsatz.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
          {/* Trennlinie über OPTIONAL */}
          <div className="border-t border-gray-200 my-4" />
          <div className="font-bold mb-1 text-gray-700">OPTIONAL</div>
          <div className="mb-4 flex flex-row items-center gap-2 text-lg whitespace-nowrap">
            <span className="font-normal text-gray-600">12 × {monatGewinnOpt.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
            <span className="font-bold text-gray-800">{jahrUmsatzOpt.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
            {monatGewinn > 0 && monatGewinnOpt < monatGewinn && (
              <span className="font-semibold text-red-500 ml-2">-
                {((1 - monatGewinnOpt / monatGewinn) * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })}%
              </span>
            )}
          </div>
          {/* Gewinnverteilung PRO JAHR horizontal */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 shadow flex flex-col gap-3 w-full">
            <span className="text-xs font-semibold mb-1 text-center">Gewinnverteilung</span>
            <div className="flex flex-col gap-2">
              {[{ name: 'Nik', percent: 31.5 }, { name: 'Adrian', percent: 31.5 }, { name: 'Sebastian', percent: 17 }, { name: 'Mexify', percent: 20 }].map((s, i) => {
                const value = Math.round(jahrUmsatz * s.percent / 100);
                return (
                  <div key={s.name} className="flex items-center gap-2 w-full">
                    <span className="w-20 truncate font-bold text-gray-700">{s.name}</span>
                    <div className="h-2 w-full bg-gray-200 rounded relative overflow-hidden mx-2">
                      <div className="h-2 bg-green-500 rounded" style={{ width: `${s.percent}%` }} />
                    </div>
                    <span className="font-bold text-green-600 min-w-[60px] text-right">{value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    <span className="text-[10px] text-gray-500">({s.percent}%)</span>
                  </div>
                );
              })}
            </div>
            {/* Optional Gewinnverteilung */}
            <div className="mt-2">
              <span className="text-[10px] font-semibold mb-1 block text-center text-gray-400">Optional</span>
              <div className="flex flex-col gap-2">
                {[{ name: 'Nik', percent: 31.5 }, { name: 'Adrian', percent: 31.5 }, { name: 'Sebastian', percent: 17 }, { name: 'Mexify', percent: 20 }].map((s, i) => {
                  const value = Math.round(jahrUmsatzOpt * s.percent / 100);
                  return (
                    <div key={s.name} className="flex items-center gap-2 w-full opacity-80">
                      <span className="w-20 truncate font-bold text-gray-400">{s.name}</span>
                      <div className="h-1.5 w-full bg-gray-100 rounded relative overflow-hidden mx-2">
                        <div className="h-1.5 bg-green-300 rounded" style={{ width: `${s.percent}%` }} />
                      </div>
                      <span className="font-bold text-green-500 min-w-[60px] text-right">{value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      <span className="text-[9px] text-gray-400">({s.percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Export-Button immer unten und zentriert */}
          <div className="flex justify-center mt-8">
            <button
              className="bg-[#00E676] shadow-lg rounded-xl p-4 hover:bg-green-500 transition flex items-center gap-2 text-white font-bold text-lg"
              onClick={() => exportCSV(data, verkauft, umsatz, kosten, gewinn, kostenOpt, gewinnOpt, monatGewinn, monatGewinnOpt, jahrUmsatz, jahrUmsatzOpt)}
              title="Kostenaufstellung als Excel herunterladen"
            >
              <ArrowDownTrayIcon className="w-6 h-6 text-white" />
              <span className="font-semibold text-lg">Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 