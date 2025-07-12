"use client";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/de";
import { supabase } from '../supabaseClient';
ChartJS.register(ArcElement, Tooltip, Legend);

dayjs.locale('de');

function getVertragskostenData() {
  // Holt die Vertragsdaten aus Supabase
  return supabase.from('vertragskosten').select('*');
}

function getMitarbeiterkostenData() {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem('mitarbeiter');
  if (!raw) return 0;
  try {
    const mitarbeiter = JSON.parse(raw);
    return Array.isArray(mitarbeiter)
      ? mitarbeiter.reduce((total, m) => {
          const brutto = parseFloat(m.brutto) || 0;
          const lohnnebenkosten = brutto * 0.22;
          return total + brutto + lohnnebenkosten;
        }, 0)
      : 0;
  } catch {
    return 0;
  }
}

export default function KostenSeite() {
  const [vertragsdaten, setVertragsdaten] = useState<any[]>([]);
  const [mitarbeiterkosten, setMitarbeiterkosten] = useState(0);

  useEffect(() => {
    async function fetchVertraege() {
      const { data, error } = await supabase.from('vertragskosten').select('*');
      if (!error && data) setVertragsdaten(data);
    }
    fetchVertraege();
    // Optional: Realtime-Updates
    const channel = supabase
      .channel('public:vertragskosten')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vertragskosten' }, fetchVertraege)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    setMitarbeiterkosten(getMitarbeiterkostenData());
    const handler = () => {
      setMitarbeiterkosten(getMitarbeiterkostenData());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Corporate Cost = Summe aller Mitarbeiterkosten (bereits als mitarbeiterkosten berechnet)
  const corporateCost = mitarbeiterkosten;
  const vertragskostenSumme = vertragsdaten.reduce((sum, p) => sum + (p.intervall === 'monatlich' ? p.betrag : p.betrag / 12), 0);
  const pieData = {
    labels: ['Vertragskosten', 'Corporate Cost'],
    datasets: [
      {
        data: [vertragskostenSumme, corporateCost],
        backgroundColor: ['#34C759', '#007AFF'],
        borderWidth: 2,
      },
    ],
  };

  // Kostenübersicht nächste 6 Monate
  function isVertragAktivImMonat(vertrag: any, monat: any) {
    if (!vertrag.start && !vertrag.ende) return true;
    const start = vertrag.start ? dayjs(vertrag.start) : null;
    const ende = vertrag.ende ? dayjs(vertrag.ende) : null;
    const m = dayjs(monat);
    if (start && m.isBefore(start, 'month')) return false;
    if (ende && m.isAfter(ende, 'month')) return false;
    return true;
  }
  const heute = dayjs();
  const monate = Array.from({length: 6}, (_, i) => heute.add(i, 'month').startOf('month'));
  const kostenMonate = monate.map(monat => {
    const vertragskosten = vertragsdaten.filter(v => isVertragAktivImMonat(v, monat)).reduce((sum, v) => sum + (v.intervall === 'monatlich' ? v.betrag : v.betrag / 12), 0);
    return {
      monat: monat.format('MMM YY'),
      vertragskosten,
      mitarbeiterkosten
    };
  });
  const gesamt6Monate = kostenMonate.reduce((sum, k) => sum + k.vertragskosten + k.mitarbeiterkosten, 0);

  const monatlicheGesamtsumme = vertragskostenSumme + corporateCost;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start py-6 px-1 font-[system-ui,sans-serif]">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="mx-auto max-w-2xl w-full flex flex-row gap-6 justify-center items-start mb-8">
          {/* Pie-Chart */}
          <div className="max-w-xs w-full bg-white rounded-xl shadow p-3 flex flex-col items-center justify-center">
            {pieData.datasets[0].data.length > 0 ? (
              <>
                <div className="flex justify-center items-center mx-auto mt-4 mb-2" style={{ width: 200, height: 200 }}>
                  <Pie data={pieData} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: true, responsive: false }} />
                </div>
                {/* Eigene Legende */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 mb-2 w-full">
                  {pieData.labels.map((label, i) => (
                    <div key={label} className="flex items-center gap-1 min-w-[90px]">
                      <span style={{ display: 'inline-block', width: 22, height: 10, borderRadius: 4, background: pieData.datasets[0].backgroundColor[i] }}></span>
                      <span className="text-gray-800 text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-base font-semibold text-gray-900 text-center">
                  Monatliche Gesamtkosten:<br />
                  <span className="text-blue-700 text-lg font-bold">{monatlicheGesamtsumme.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-center py-8 text-sm">Noch keine Kosten eingetragen</div>
            )}
          </div>
          {/* Kostenübersicht */}
          <div className="max-w-md w-full bg-white rounded-xl shadow p-3 flex flex-col justify-start">
            <div className="text-base font-bold text-gray-900 mb-2 text-center">Kostenübersicht 6 Monate</div>
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-sm border-separate border-spacing-y-0.5">
                <thead>
                  <tr className="text-gray-600 bg-gray-50">
                    <th className="pb-1 font-medium text-left rounded-tl-lg">Monat</th>
                    <th className="pb-1 font-medium text-right">Vertrag</th>
                    <th className="pb-1 font-medium text-right">MA</th>
                    <th className="pb-1 font-medium text-right rounded-tr-lg">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {kostenMonate.map(k => (
                    <tr key={k.monat} className="bg-white border-b last:border-b-0 shadow rounded-lg">
                      <td className="py-1 px-1 text-left font-semibold whitespace-nowrap text-gray-900">{k.monat}</td>
                      <td className="py-1 px-1 text-right text-gray-800">{k.vertragskosten.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="py-1 px-1 text-right text-gray-800">{k.mitarbeiterkosten.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="py-1 px-1 text-right font-bold text-blue-700">{(k.vertragskosten + k.mitarbeiterkosten).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50">
                    <td className="py-1 px-1 text-left font-bold text-blue-900 rounded-bl-lg">Gesamt</td>
                    <td></td>
                    <td></td>
                    <td className="py-1 px-1 text-right font-bold text-blue-900 rounded-br-lg">{gesamt6Monate.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Kompakte Hauptkarten */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl mt-2">
          <a href="/vertragskosten" className="flex items-center justify-center aspect-[2/1] w-full rounded-xl shadow border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-all text-base font-semibold text-gray-900 px-2 py-4">
            Vertragskosten
          </a>
          <a href="/kostenrechner" className="flex items-center justify-center aspect-[2/1] w-full rounded-xl shadow border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-all text-base font-semibold text-gray-900 px-2 py-4">
            Kostenrechner
          </a>
          <a href="/vergleich" className="flex items-center justify-center aspect-[2/1] w-full rounded-xl shadow border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-all text-base font-semibold text-gray-900 px-2 py-4">
            Vergleichsrechner
          </a>
          <a href="/mitarbeiter" className="flex items-center justify-center aspect-[2/1] w-full rounded-xl shadow border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-all text-base font-semibold text-gray-900 px-2 py-4">
            Mitarbeiter
          </a>
        </div>
      </div>
    </div>
  );
} 