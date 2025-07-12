"use client";
import React, { useState, useEffect } from "react";
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';

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
  rabattProzent: 0,
};

function exportCSV(data: any, verkauft: number, umsatz: number, kosten: number, gewinn: number, kostenOpt: number, gewinnOpt: number, monatGewinn: number, monatGewinnOpt: number, jahrUmsatz: number, jahrUmsatzOpt: number) {
  // Hilfsfunktion für Euro-Format
  const euro = (v: number) => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  const rows = [
    ['Kategorie', 'Betrag'],
    ['Tickets pro Termin', data.ticketsProTermin],
    ['Termine', data.termine],
    ['VK-Prozent', data.vkProzent + ' %'],
    ['Verkauft', verkauft],
    ['Ticketpreis', euro(data.ticketPreis)],
    ['Umsatz', euro(umsatz)],
    ['GEMA', euro(data.gema)],
    ['Marketing', euro(data.marketing)],
    ['Künstler', euro(data.kuenstler)],
    ['Locationmiete', euro(data.location)],
    ['Mercher/Logistiker', euro(data.mercher)],
    ['Reisekosten', euro(data.reise)],
    ['Shopify-Gebühr', euro(data.optionalTicketing)],
    ['Rabatte', data.rabattProzent ? data.rabattProzent + ' %' : '0 %'],
    ['Gesamtkosten', euro(kosten)],
    ['Gewinn', euro(gewinn)],
    ['OPTIONAL Aufbauhelfer', euro(data.optionalAufbau)],
    ['OPTIONAL Variable Kosten', euro(data.optionalVariabel)],
    ['OPTIONAL Ticketing Fee', euro(data.optionalTicketing)],
    ['Gesamtkosten (opt)', euro(kostenOpt)],
    ['Gewinn (opt)', euro(gewinnOpt)],
    ['Monatsgewinn', euro(monatGewinn)],
    ['Monatsgewinn (opt)', euro(monatGewinnOpt)],
    ['Jahresgewinn', euro(jahrUmsatz)],
    ['Jahresgewinn (opt)', euro(jahrUmsatzOpt)],
  ];
  // Nur die wichtigsten Felder exportieren, keine Gewinnbeteiligung/Verteilung
  const filteredRows = rows.filter(r => !r[0].toLowerCase().includes('gewinnverteilung') && !r[0].toLowerCase().includes('beteiligung'));
  const csv = filteredRows.map(r => `${r[0]};${r[1]}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Kostenaufstellung.csv';
  a.click();
}

// Hilfsfunktion für rote Darstellung negativer Zahlen
function formatCurrency(value: number) {
  const str = value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  return <span style={{ color: value < 0 ? '#ef4444' : undefined }}>{str}</span>;
}

export default function KostenTool() {
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('kostenToolData');
      if (saved) return JSON.parse(saved);
    }
    return initial;
  });
  const [optionalCorporate, setOptionalCorporate] = useState<number | undefined>(undefined);
  const [optionalSteuer, setOptionalSteuer] = useState<number | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [vertragskosten, setVertragskosten] = useState<number|null>(null);
  const [mitarbeiterkosten, setMitarbeiterkosten] = useState<number>(0);
  const [backClicked, setBackClicked] = useState(false);
  const [showCorporate, setShowCorporate] = useState(true);
  const [showVertragskosten, setShowVertragskosten] = useState(true);

  // Automatische Berechnung
  const ticketsTotal = data.ticketsProTermin * data.termine;
  const verkauft = Math.round(ticketsTotal * (data.vkProzent / 100));
  const rabatt = data.rabattProzent ? (data.ticketPreis * verkauft * (data.rabattProzent / 100)) : 0;
  const umsatz = data.ticketPreis * verkauft - rabatt;
  const gema = Math.round(umsatz * 0.09 * 100) / 100;
  const shopifyFee = Math.round((umsatz * 0.019 + verkauft * 0.25) * 100) / 100;
  const shopifyActive = data.optionalTicketing <= 0;
  const corporateCost = mitarbeiterkosten;
  const kosten = gema + data.marketing + data.kuenstler + data.location + data.mercher + data.reise + (shopifyActive ? shopifyFee : 0) + (vertragskosten ?? 0) + corporateCost;
  const gewinn = umsatz - kosten;
  const kostenOpt = kosten + data.optionalAufbau + data.optionalVariabel + data.optionalTicketing;
  const gewinnOpt = umsatz - kostenOpt;

  // NEUE Monatsgewinn-Berechnung NUR mit den gewünschten Posten
  const monatGewinnBasis = (vertragskosten !== null)
    ? (2 * gewinn)
      - (showCorporate ? corporateCost : 0)
      - (showVertragskosten ? (vertragskosten ?? 0) : 0)
      - data.steuer
    : (2 * gewinn) - (showCorporate ? corporateCost : 0) - data.steuer;
  const steuernAbzugKlar = data.steuerProzent ? (monatGewinnBasis * (data.steuerProzent / 100)) : 0;
  const monatGewinnKlar = monatGewinnBasis - steuernAbzugKlar;

  // Monat/Jahr
  const monatUmsatz = 2 * gewinn;
  const monatGewinnVorSteuern = monatUmsatz - corporateCost - data.steuer;
  const steuernAbzug = data.steuerProzent ? (monatGewinnVorSteuern * (data.steuerProzent / 100)) : 0;
  const monatGewinn = monatGewinnVorSteuern - steuernAbzug;
  const monatUmsatzOpt = 2 * gewinnOpt;
  const monatGewinnOptVorSteuern = monatUmsatzOpt - (optionalCorporate ?? corporateCost) - (optionalSteuer ?? data.steuer);
  const steuernAbzugOpt = data.steuerProzent ? (monatGewinnOptVorSteuern * (data.steuerProzent / 100)) : 0;
  const monatGewinnOptMitSteuern = monatGewinnOptVorSteuern - steuernAbzugOpt;
  const monatGewinnOpt = monatGewinnOptVorSteuern - steuernAbzugOpt;
  const jahrUmsatz = 12 * monatGewinn;
  const jahrUmsatzOpt = 12 * monatGewinnOpt;

  // Optional Gewinnverteilung PRO JAHR auch mit Steuern abziehen
  const jahrUmsatzOptMitSteuern = 12 * monatGewinnOptMitSteuern;

  // Vertragskosten aus Supabase holen
  useEffect(() => {
    async function updateVertragskosten() {
      const { data, error } = await supabase.from('vertragskosten').select('*');
      if (!error && data) {
        const sum = Array.isArray(data)
          ? data.reduce((acc, p) => acc + (p.intervall === 'monatlich' ? p.betrag : p.betrag / 12), 0)
          : null;
        setVertragskosten(sum);
      } else {
        setVertragskosten(null);
      }
    }
    updateVertragskosten();
    // Optional: Realtime-Updates
    const channel = supabase
      .channel('public:vertragskosten')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vertragskosten' }, updateVertragskosten)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Mitarbeiterkosten aus localStorage holen
  useEffect(() => {
    function updateMitarbeiterkosten() {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('mitarbeiter');
        if (raw) {
          try {
            const mitarbeiter = JSON.parse(raw);
            const sum = Array.isArray(mitarbeiter)
              ? mitarbeiter.reduce((acc, m) => {
                  const brutto = parseFloat(m.brutto) || 0;
                  const lohnnebenkosten = brutto * 0.22;
                  return acc + brutto + lohnnebenkosten;
                }, 0)
              : 0;
            setMitarbeiterkosten(sum);
          } catch {
            setMitarbeiterkosten(0);
          }
        } else {
          setMitarbeiterkosten(0);
        }
      }
    }
    updateMitarbeiterkosten();
    window.addEventListener('storage', updateMitarbeiterkosten);
    return () => window.removeEventListener('storage', updateMitarbeiterkosten);
  }, []);

  function handleChange(key: keyof typeof data, value: string) {
    setData((d: any) => {
      const updated = { ...d, [key]: Number(value) };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kostenToolData', JSON.stringify(updated));
      }
      return updated;
    });
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
              <span className="font-bold text-lg text-gray-800 text-right flex-1">{formatCurrency(umsatz)} <span className="text-lg font-normal">Umsatz</span></span>
            </div>
          </div>
          {/* Kostenstruktur als Grid */}
          <div className="mb-4 grid grid-cols-[1fr_auto] gap-y-2 gap-x-4 text-base">
            <div className="text-gray-700">GEMA (9%)</div>
            <div className="flex items-center justify-end">
              <span className="w-28 text-right font-mono">{formatCurrency(gema)}</span>
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
              <span className={`w-28 text-right font-mono ${!shopifyActive ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(shopifyFee)}</span>
              <span className="ml-1 text-gray-500">€</span>
            </div>
            <div className="text-gray-500 text-xs mb-2" style={{gridColumn: '1 / span 2', marginTop: '-8px', marginBottom: '0'}}>(1,9% + 0,25€ pro Ticket)</div>
            <div className="text-gray-700">RABATTE</div>
            <div className="flex items-center justify-end">
              <input type="number" className="w-16 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.rabattProzent ?? 0} min={0} max={100} onChange={e => handleChange('rabattProzent', e.target.value)} />
              <span className="ml-1 text-gray-500">%</span>
            </div>
          </div>
          <div className="font-bold text-xl mb-4 flex justify-between items-center">
            <span>GEWINN</span>
            <span className="text-right min-w-[120px]">{formatCurrency(gewinn)}</span>
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
            <span className="text-right min-w-[120px]">{formatCurrency(gewinnOpt)}</span>
          </div>
        </div>
        {/* Monat */}
        <div className="bg-white rounded-2xl p-8 flex-1 w-full lg:w-1/3 border border-gray-200 shadow-xl flex flex-col relative">
          <div className="text-lg font-bold mb-2 tracking-tight">PRO MONAT</div>
          <div className="mb-4 font-bold text-2xl">{ticketsTotal * 2} Tickets</div>
          <div className="mb-4 text-sm font-normal text-gray-500">2 × {formatCurrency(gewinn)} = {formatCurrency(monatUmsatz)}</div>
          <div className="space-y-2 mb-4 text-base">
            <div className={`flex items-center justify-between gap-2 ${!showCorporate ? 'text-gray-300' : ''}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showCorporate} onChange={e => setShowCorporate(e.target.checked)} />
                <a
                  href="/mitarbeiter"
                  className="text-blue-500 hover:underline hover:text-blue-600 transition cursor-pointer font-normal"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  tabIndex={0}
                >
                  CORPORATE COST
                </a>
              </label>
              <div className="flex items-center gap-0">
                <span className="w-24 text-right font-mono text-gray-900">{formatCurrency(corporateCost)}</span>
              </div>
            </div>
            <div className={`flex items-center justify-between gap-2 ${!showVertragskosten ? 'text-gray-300' : ''}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showVertragskosten} onChange={e => setShowVertragskosten(e.target.checked)} />
                <a
                  href="/vertragskosten"
                  className="text-blue-500 hover:underline hover:text-blue-600 transition cursor-pointer font-normal"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  tabIndex={0}
                >
                  VERTRAGSKOSTEN
                </a>
              </label>
              <div className="flex items-center gap-0">
                <span className="w-24 text-right font-mono text-gray-900">{vertragskosten === null ? '...' : vertragskosten.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>STEUERBERATER</span>
              <div className="flex items-center gap-0">
                <input type="number" className="w-24 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.steuer} onChange={e => handleChange('steuer', e.target.value)} />
                <span className="ml-1 text-gray-500">€</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>STEUERN</span>
              <div className="flex items-center gap-0">
                <input type="number" className="w-16 bg-transparent border-b border-gray-100/30 text-gray-900 text-right focus:ring-2 focus:ring-blue-200" value={data.steuerProzent ?? 0} min={0} max={100} onChange={e => handleChange('steuerProzent', e.target.value)} />
                <span className="ml-1 text-gray-500">%</span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <div className={`inline-block rounded-xl px-3 py-1.5 font-bold text-base ${monatGewinnKlar < 0 ? 'bg-red-500' : 'bg-[#00E676]'} text-white`}>GEWINN <span className="ml-2 text-white">{monatGewinnKlar.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
          </div>
          <div className="border-t border-gray-200 my-4" />
          <div className="font-bold mb-1 text-gray-700">OPTIONAL</div>
          <div className="mb-4 text-lg flex items-center gap-2">
            2 × <span className="font-bold">{formatCurrency(gewinnOpt)}</span> = <span className="font-bold text-2xl text-gray-800">{formatCurrency(monatUmsatzOpt)}</span>
          </div>
          <div className="mb-14">
            <div className={`inline-block rounded-xl px-3 py-1.5 font-bold text-base ${monatGewinnOptMitSteuern < 0 ? 'bg-red-500' : 'bg-[#33EB91]'} text-white`}>GEWINN <span className="ml-2 text-white">{monatGewinnOptMitSteuern.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
          </div>
          {/* Gewinnverteilung PRO MONAT */}
          <div className="mt-4 bg-gray-50 rounded-lg p-2 shadow flex flex-col gap-2 w-full" style={{ maxWidth: 420, margin: '0 auto', overflow: 'hidden' }}>
            <span className="text-xs font-semibold mb-1 text-center">Gewinnverteilung</span>
            <div className="flex flex-col gap-1 items-start">
              {[{ name: 'Nik', percent: 31.5 }, { name: 'Adrian', percent: 31.5 }, { name: 'Sebastian', percent: 17 }, { name: 'Mexify', percent: 20 }].map((s, i) => {
                const value = Math.round(monatGewinn * s.percent / 100);
                const isNegative = value < 0;
                return (
                  <div key={s.name} className="flex items-center justify-start gap-2 w-full text-xs">
                    <span className="w-20 text-right font-bold text-gray-700" style={{fontSize: '10px', wordBreak: 'break-word'}}>{s.name}</span>
                    <span className="text-[8px] text-gray-500 ml-1">({s.percent}%)</span>
                    <div className="h-2 bg-gray-200 rounded relative overflow-hidden mx-2 flex-1 min-w-0" style={{ minWidth: 60, maxWidth: 120 }}>
                      <div className="h-2 rounded" style={{ width: `${s.percent}%`, minWidth: 24, background: isNegative ? '#ef4444' : '#22c55e', transition: 'background 0.2s' }} />
                    </div>
                    <span className="font-bold text-right" style={{fontSize: '10px', color: isNegative ? '#ef4444' : '#16a34a', minWidth: 40, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block'}}>{formatCurrency(value)}</span>
                  </div>
                );
              })}
            </div>
            {/* Optional Gewinnverteilung */}
            <div className="mt-1">
              <span className="text-[8px] font-semibold mb-1 block text-center text-gray-400">Optional</span>
              <div className="flex flex-col gap-1 items-start">
                {[{ name: 'Nik', percent: 31.5 }, { name: 'Adrian', percent: 31.5 }, { name: 'Sebastian', percent: 17 }, { name: 'Mexify', percent: 20 }].map((s, i) => {
                  const value = Math.round(monatGewinnOptMitSteuern * s.percent / 100);
                  const isNegative = value < 0;
                  return (
                    <div key={s.name} className="flex items-center justify-start gap-2 w-full text-xs">
                      <span className="w-20 text-right font-bold text-gray-400" style={{fontSize: '9px'}}>{s.name}</span>
                      <span className="text-[8px] text-gray-500 ml-1">({s.percent}%)</span>
                      <div className="h-2 bg-gray-200 rounded relative overflow-hidden mx-2 flex-1" style={{ minWidth: 80, maxWidth: 180 }}>
                        <div className="h-2 rounded" style={{ width: `${s.percent}%`, minWidth: 24, background: isNegative ? '#ef4444' : '#22c55e', transition: 'background 0.2s' }} />
                      </div>
                      <span className="font-bold text-right" style={{fontSize: '9px', color: isNegative ? '#ef4444' : '#16a34a', minWidth: 60}}>{formatCurrency(value)}</span>
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
          <div className="mb-4 text-lg">12 × <span className="font-normal text-gray-600">{formatCurrency(monatGewinn)}</span> <span className="font-bold text-gray-800">{formatCurrency(jahrUmsatz)}</span></div>
          {/* Trennlinie über OPTIONAL */}
          <div className="border-t border-gray-200 my-4" />
          <div className="font-bold mb-1 text-gray-700">OPTIONAL</div>
          <div className="mb-14 flex flex-row items-center gap-2 text-lg whitespace-nowrap">
            <span className="font-normal text-gray-600">12 × {formatCurrency(monatGewinnOptMitSteuern)}</span>
            <span className="font-bold text-gray-800">{formatCurrency(jahrUmsatzOptMitSteuern)}</span>
            {monatGewinn > 0 && monatGewinnOpt < monatGewinn && (
              <span className="font-semibold text-red-500 ml-2">-
                {((1 - monatGewinnOpt / monatGewinn) * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })}%
              </span>
            )}
          </div>
          {/* Gewinnverteilung PRO JAHR */}
          <div className="mt-4 bg-gray-50 rounded-lg p-2 shadow flex flex-col gap-2 w-full" style={{ maxWidth: 420, margin: '0 auto', overflow: 'hidden' }}>
            <span className="text-xs font-semibold mb-1 text-center">Gewinnverteilung</span>
            <div className="flex flex-col gap-1 items-start">
              {[{ name: 'Nik', percent: 31.5 }, { name: 'Adrian', percent: 31.5 }, { name: 'Sebastian', percent: 17 }, { name: 'Mexify', percent: 20 }].map((s, i) => {
                const value = Math.round(jahrUmsatzOptMitSteuern * s.percent / 100);
                const isNegative = value < 0;
                return (
                  <div key={s.name} className="flex items-center justify-start gap-2 w-full text-xs">
                    <span className="w-20 text-right font-bold text-gray-700" style={{fontSize: '10px', wordBreak: 'break-word'}}>{s.name}</span>
                    <span className="text-[8px] text-gray-500 ml-1">({s.percent}%)</span>
                    <div className="h-2 bg-gray-200 rounded relative overflow-hidden mx-2 flex-1 min-w-0" style={{ minWidth: 60, maxWidth: 120 }}>
                      <div className="h-2 rounded" style={{ width: `${s.percent}%`, minWidth: 24, background: isNegative ? '#ef4444' : '#22c55e', transition: 'background 0.2s' }} />
                    </div>
                    <span className="font-bold text-right" style={{fontSize: '10px', color: isNegative ? '#ef4444' : '#16a34a', minWidth: 40, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block'}}>{formatCurrency(value)}</span>
                  </div>
                );
              })}
            </div>
            {/* Optional Gewinnverteilung */}
            <div className="mt-1">
              <span className="text-[8px] font-semibold mb-1 block text-center text-gray-400">Optional</span>
              <div className="flex flex-col gap-1 items-start">
                {[{ name: 'Nik', percent: 31.5 }, { name: 'Adrian', percent: 31.5 }, { name: 'Sebastian', percent: 17 }, { name: 'Mexify', percent: 20 }].map((s, i) => {
                  const value = Math.round(jahrUmsatzOptMitSteuern * s.percent / 100);
                  const isNegative = value < 0;
                  return (
                    <div key={s.name} className="flex items-center justify-start gap-2 w-full text-xs">
                      <span className="w-20 text-right font-bold text-gray-400" style={{fontSize: '9px'}}>{s.name}</span>
                      <span className="text-[8px] text-gray-500 ml-1">({s.percent}%)</span>
                      <div className="h-2 bg-gray-200 rounded relative overflow-hidden mx-2 flex-1" style={{ minWidth: 80, maxWidth: 180 }}>
                        <div className="h-2 rounded" style={{ width: `${s.percent}%`, minWidth: 24, background: isNegative ? '#ef4444' : '#22c55e', transition: 'background 0.2s' }} />
                      </div>
                      <span className="font-bold text-right" style={{fontSize: '9px', color: isNegative ? '#ef4444' : '#16a34a', minWidth: 60}}>{formatCurrency(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Export-Button immer unten und unten rechts in der Jahres-Box, Speichern-Button links daneben */}
          <div className="flex justify-end items-center gap-2 mt-8">
            <button
              className={`bg-white border border-gray-200 shadow rounded-xl p-2 hover:bg-gray-100 transition flex items-center gap-1 text-gray-900 font-bold text-base ${saved ? 'opacity-60 cursor-default' : ''}`}
              onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500); }}
              disabled={saved}
              title="Daten festlegen"
            >
              <span className="font-semibold text-base">Speichern</span>
            </button>
            <button
              className="bg-[#00E676] shadow-lg rounded-xl p-2 hover:bg-green-500 transition flex items-center gap-1 text-white font-bold text-base"
              onClick={() => exportCSV(data, verkauft, umsatz, kosten, gewinn, kostenOpt, gewinnOpt, monatGewinn, monatGewinnOpt, jahrUmsatz, jahrUmsatzOpt)}
              title="Kostenaufstellung als Excel herunterladen"
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-white" />
              <span className="font-semibold text-base">Export</span>
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="absolute left-4 top-4 flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm font-medium transition"
        onClick={() => {
          if (!backClicked && window.history.length > 1) {
            setBackClicked(true);
            window.history.back();
          } else {
            window.location.href = "/";
          }
        }}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Zurück
      </button>
    </div>
  );
} 