"use client";
import React, { useState } from "react";

export default function Vergleich() {
  const [betragAlt, setBetragAlt] = useState(1000000);
  const [anteilAlt, setAnteilAlt] = useState(3);
  const [anteilNeu, setAnteilNeu] = useState(31.5);

  // Berechnung: Wie viel müsste die neue Firma machen, damit man auf denselben Betrag kommt?
  const aktuell = betragAlt * (anteilAlt / 100);
  const neu = betragAlt * (anteilNeu / 100);
  const prozent = aktuell > 0 ? ((neu / aktuell) - 1) * 100 : 0;
  const neededGewinn = anteilNeu > 0 ? aktuell / (anteilNeu / 100) : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-8 px-2 sm:px-6 font-[system-ui,sans-serif]">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 sm:p-12 flex flex-col gap-8 border border-gray-100">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 text-center tracking-tight mb-2">Vergleichsrechner</h1>
          <p className="text-center text-gray-400 text-lg">Wie viel Gewinn brauchst du mit neuem Anteil, um auf denselben Auszahlungsbetrag zu kommen?</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 w-full items-stretch justify-center">
          {/* Eingaben */}
          <div className="flex-1 flex flex-col gap-6 bg-gray-50 rounded-2xl shadow p-6 min-w-[260px] max-w-md mx-auto">
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-medium text-base">Gewinn aktuell</label>
              <input type="number" min={0} className="w-full bg-white rounded-xl px-4 py-3 text-lg text-gray-900 text-right font-semibold border border-gray-200 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-400" value={betragAlt} onChange={e => setBetragAlt(Number(e.target.value))} placeholder="z.B. 1.000.000" />
            </div>
            <div className="flex flex-row gap-2 items-center justify-between">
              <label className="text-gray-600 font-medium text-base w-40">Anteil aktuell</label>
              <input type="number" min={0} max={100} className="flex-1 bg-white rounded-xl px-4 py-3 text-lg text-gray-900 text-right font-semibold border border-gray-200 focus:ring-2 focus:ring-blue-100 transition" value={anteilAlt} onChange={e => setAnteilAlt(Number(e.target.value))} />
              <span className="text-gray-400 text-lg font-semibold ml-1">%</span>
            </div>
            <div className="flex flex-row gap-2 items-center justify-between">
              <label className="text-gray-600 font-medium text-base w-40">Anteil neu</label>
              <input type="number" min={0} max={100} className="flex-1 bg-white rounded-xl px-4 py-3 text-lg text-gray-900 text-right font-semibold border border-gray-200 focus:ring-2 focus:ring-blue-100 transition" value={anteilNeu} onChange={e => setAnteilNeu(Number(e.target.value))} />
              <span className="text-gray-400 text-lg font-semibold ml-1">%</span>
            </div>
          </div>
          {/* Ergebnisse */}
          <div className="flex-1 flex flex-col gap-6 bg-gray-50 rounded-2xl shadow p-6 min-w-[260px] max-w-md mx-auto items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 text-base mb-0.5">Dein Auszahlungsbetrag aktuell</span>
              <span className="text-3xl font-bold text-gray-900">{aktuell.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              <span className="text-gray-300 text-base">bei {anteilAlt}% Anteil</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 text-base mb-0.5">Mit neuem Anteil</span>
              <span className="text-3xl font-bold text-blue-600">{neu.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              <span className="text-gray-300 text-base">bei {anteilNeu}% Anteil</span>
            </div>
            {betragAlt > 0 && anteilAlt > 0 && anteilNeu > 0 && (
              <span className={`text-base font-semibold ${prozent > 0 ? 'text-green-600' : prozent < 0 ? 'text-red-500' : 'text-gray-400'}`}>{prozent > 0 ? '+' : ''}{prozent.toLocaleString('de-DE', { maximumFractionDigits: 1 })}% mehr als aktuell</span>
            )}
            <div className="w-full flex flex-col items-center mt-4">
              {betragAlt > 0 && anteilAlt > 0 && anteilNeu > 0 && (
                <div className="bg-white rounded-xl shadow border border-gray-100 px-6 py-4 flex flex-col items-center max-w-xs w-full">
                  <span className="text-gray-400 text-base mb-1 text-center">Benötigter Gewinn neu</span>
                  <span className="text-2xl font-bold text-green-600 mb-1">{neededGewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                  <span className="text-gray-300 text-sm text-center">für {anteilNeu}% = {aktuell.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 